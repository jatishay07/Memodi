import base64
import os
import time
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

MODEL_NAME = os.environ.get("TRACKER_MODEL", "yolo26n.pt")
FALLBACK_MODEL_NAME = os.environ.get("TRACKER_FALLBACK_MODEL", "yolo11n.pt")
WORLD_MODEL_NAME = os.environ.get("TRACKER_WORLD_MODEL", "yolov8s-world.pt")
CONFIDENCE = float(os.environ.get("TRACKER_CONF", "0.25"))
IOU_MATCH_THRESHOLD = float(os.environ.get("TRACKER_IOU_MATCH", "0.15"))
TRAIL_LIMIT = int(os.environ.get("TRACKER_TRAIL_LIMIT", "28"))
TARGET_LABEL = "target"
TRACKER_ALGORITHM = os.environ.get("TRACKER_ALGORITHM", "bytetrack.yaml")

app = FastAPI(title="Memodi Object Tracker")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(","),
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


class TargetImage(BaseModel):
    name: str | None = None
    imageBase64: str


class TargetsRequest(BaseModel):
    targets: list[TargetImage]


class TrackRequest(BaseModel):
    imageBase64: str


model = None
world_model = None
target_ready = False
target_name = TARGET_LABEL
target_class_id: int | None = None
target_mode = "none"
next_track_id = 1
tracks: dict[int, dict[str, Any]] = {}


def _decode_image(image_b64: str) -> np.ndarray:
    raw = base64.b64decode(image_b64.split(",")[-1] if "," in image_b64 else image_b64)
    img = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image")
    return img


def _load_model():
    global model
    if model is not None:
        return model
    try:
        from ultralytics import YOLO
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Install tracker dependencies with npm run tracker:setup. ({exc})") from exc

    try:
        model = YOLO(MODEL_NAME)
    except Exception:
        model = YOLO(FALLBACK_MODEL_NAME)
    return model


def _load_world_model(label: str):
    global world_model
    if world_model is None:
        try:
            from ultralytics import YOLOWorld
        except Exception as exc:
            raise HTTPException(status_code=503, detail=f"Install tracker dependencies with npm run tracker:setup. ({exc})") from exc
        world_model = YOLOWorld(WORLD_MODEL_NAME)
    world_model.set_classes([label])
    return world_model


def _box_iou(a: list[float], b: list[float]) -> float:
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    ix1, iy1 = max(ax1, bx1), max(ay1, by1)
    ix2, iy2 = min(ax2, bx2), min(ay2, by2)
    iw, ih = max(0.0, ix2 - ix1), max(0.0, iy2 - iy1)
    inter = iw * ih
    area_a = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
    area_b = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
    denom = area_a + area_b - inter
    return inter / denom if denom else 0.0


def _direction(dx: float, dy: float) -> str:
    if abs(dx) < 2 and abs(dy) < 2:
        return "steady"
    horizontal = "right" if dx > 0 else "left"
    vertical = "down" if dy > 0 else "up"
    if abs(dx) > abs(dy) * 1.6:
        return horizontal
    if abs(dy) > abs(dx) * 1.6:
        return vertical
    return f"{vertical}-{horizontal}"


def _assign_tracks(detections: list[dict[str, Any]]) -> list[dict[str, Any]]:
    global next_track_id, tracks
    now = time.time()
    assigned: set[int] = set()
    output = []

    for det in detections:
        best_id = None
        best_iou = 0.0
        for track_id, track in tracks.items():
            if track_id in assigned:
                continue
            score = _box_iou(det["box"], track["box"])
            if score > best_iou:
                best_iou = score
                best_id = track_id

        if best_id is None or best_iou < IOU_MATCH_THRESHOLD:
            best_id = next_track_id
            next_track_id += 1
            tracks[best_id] = {"box": det["box"], "center": det["center"], "trail": [], "updatedAt": now}

        previous = tracks[best_id]
        dx = det["center"]["x"] - previous["center"]["x"]
        dy = det["center"]["y"] - previous["center"]["y"]
        trail = [*previous.get("trail", []), det["center"]][-TRAIL_LIMIT:]
        tracks[best_id] = {"box": det["box"], "center": det["center"], "trail": trail, "updatedAt": now}
        assigned.add(best_id)
        output.append({**det, "id": best_id, "velocity": {"x": round(dx, 2), "y": round(dy, 2)}, "direction": _direction(dx, dy), "trail": trail})

    tracks = {track_id: track for track_id, track in tracks.items() if now - track["updatedAt"] < 3.0}
    return output


def _detect_target_class(images: list[np.ndarray]) -> tuple[int, str, float] | None:
    yolo = _load_model()
    best = None

    for img in images:
        results = yolo.predict(img, conf=CONFIDENCE, imgsz=640, verbose=False)
        boxes = results[0].boxes if results else None
        if boxes is None or boxes.xyxy is None or len(boxes) == 0:
            continue

        xyxy = boxes.xyxy.cpu().numpy()
        confs = boxes.conf.cpu().numpy()
        classes = boxes.cls.cpu().numpy()
        for box, conf, cls in zip(xyxy, confs, classes):
            x1, y1, x2, y2 = [float(v) for v in box]
            area = max(0.0, x2 - x1) * max(0.0, y2 - y1)
            score = area * float(conf)
            if best is None or score > best["score"]:
                class_id = int(cls)
                best = {
                    "classId": class_id,
                    "className": yolo.names[class_id],
                    "confidence": float(conf),
                    "score": score,
                }

    if best is None:
        return None
    return best["classId"], best["className"], best["confidence"]


def _result_to_detections(result: Any) -> list[dict[str, Any]]:
    boxes = getattr(result, "boxes", None)
    if boxes is None or boxes.xyxy is None:
        return []

    xyxy = boxes.xyxy.cpu().numpy()
    confs = boxes.conf.cpu().numpy() if boxes.conf is not None else np.ones(len(xyxy))
    track_ids = boxes.id.cpu().numpy().astype(int).tolist() if getattr(boxes, "id", None) is not None else [None] * len(xyxy)
    candidates = []
    for box, conf, track_id in zip(xyxy, confs, track_ids):
        if float(conf) < CONFIDENCE:
            continue
        x1, y1, x2, y2 = [float(v) for v in box]
        candidates.append({
            "label": target_name,
            "confidence": round(float(conf), 3),
            "box": [round(x1, 2), round(y1, 2), round(x2, 2), round(y2, 2)],
            "center": {"x": round((x1 + x2) / 2, 2), "y": round((y1 + y2) / 2, 2)},
            "ultralyticsTrackId": track_id,
        })

    detections = []
    for candidate in sorted(candidates, key=lambda item: item["confidence"], reverse=True):
        if all(_box_iou(candidate["box"], existing["box"]) < 0.65 for existing in detections):
            detections.append(candidate)
    return detections


@app.get("/health")
def health():
    try:
        import ultralytics
        version = ultralytics.__version__
    except Exception:
        version = None
    active_model = getattr(model, "ckpt_path", None) or MODEL_NAME
    return {
        "status": "ok" if version else "missing-dependencies",
        "engine": "ultralytics-yolo-track",
        "model": str(active_model),
        "worldModel": WORLD_MODEL_NAME,
        "tracker": TRACKER_ALGORITHM,
        "ultralytics": version,
        "targetReady": target_ready,
        "targetMode": target_mode,
        "targetClassId": target_class_id,
        "targetName": target_name,
    }


@app.post("/targets")
def set_targets(req: TargetsRequest):
    global target_name, target_ready, target_class_id, target_mode, tracks, next_track_id
    if not req.targets:
        raise HTTPException(status_code=400, detail="At least one target photo is required")

    images = [_decode_image(target.imageBase64) for target in req.targets]
    for img in images:
        h, w = img.shape[:2]
        if w < 16 or h < 16:
            raise HTTPException(status_code=400, detail="Target photo is too small")

    requested_name = (req.targets[0].name or "").strip()
    detected = _detect_target_class(images)
    if detected is not None:
        detected_class_id, detected_class_name, detected_confidence = detected
        target_class_id = detected_class_id
        target_name = detected_class_name
        target_mode = "class"
        message = f"Detected '{target_name}' in the target photo. Live tracking will follow that Ultralytics class."
    else:
        fallback_name = requested_name if requested_name and requested_name.lower() != TARGET_LABEL else "object"
        _load_world_model(fallback_name)
        target_class_id = 0
        target_name = fallback_name
        target_mode = "world"
        detected_confidence = 0.0
        message = f"Could not identify a COCO class in the photo, so live tracking will use YOLO-World for '{target_name}'."

    tracks = {}
    next_track_id = 1
    target_ready = True
    h, w = images[0].shape[:2]
    return {
        "status": "ok",
        "targetReady": True,
        "targetName": target_name,
        "targetMode": target_mode,
        "targetClassId": target_class_id,
        "targetConfidence": round(detected_confidence, 3),
        "referenceCount": len(images),
        "referenceSize": {"width": w, "height": h},
        "message": message,
    }


@app.post("/track")
def track(req: TrackRequest):
    if not target_ready:
        raise HTTPException(status_code=400, detail="Upload or capture a target photo before tracking")

    frame = _decode_image(req.imageBase64)
    yolo = _load_world_model(target_name) if target_mode == "world" else _load_model()
    results = yolo.track(
        frame,
        conf=CONFIDENCE,
        imgsz=640,
        persist=True,
        tracker=TRACKER_ALGORITHM,
        classes=[target_class_id] if target_mode == "class" and target_class_id is not None else None,
        verbose=False,
    )
    detections = _assign_tracks(_result_to_detections(results[0] if results else None))
    h, w = frame.shape[:2]
    return {
        "status": "ok",
        "frame": {"width": w, "height": h},
        "targetName": target_name,
        "targetMode": target_mode,
        "targetClassId": target_class_id,
        "detections": detections,
        "tracked": len(detections) > 0,
    }
