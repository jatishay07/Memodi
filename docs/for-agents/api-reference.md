# API Reference

Base URL: `NEXT_PUBLIC_API_BASE_URL` (API Gateway HTTP API in `us-east-1`, single stage).

All JSON bodies. CORS enabled. OPTIONS supported on POST routes.

## Authorization (v1)

| Layer | Behavior |
|-------|----------|
| **Frontend** | Sends `Authorization: Bearer <jwt>` on core routes via `web/lib/api.js` |
| **Backend** | **Does not verify JWT** — client-only security for hackathon |
| **Post-hackathon** | Add `lambda/shared/auth.js` and enforce role + `patientId` |

Auth register/login routes do not require a Bearer token.

---

## Auth

### POST `/auth/patient/register`

**Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)",
  "name": "string (required)",
  "timezone": "string (required, IANA e.g. America/Chicago)",
  "dateOfBirth": "string (optional)"
}
```

Preferences and DOB are not required at signup; defaults applied server-side.

**201:** `{ "token", "connectionCode", "patientId", "role": "patient", "name" }`

**Errors:** 400, 409 email exists

---

### POST `/auth/patient/login`

**Body:** `{ "email", "password" }`

**200:** `{ "token", "patientId", "role": "patient", "name" }`

---

### POST `/auth/caregiver/register`

**Body:** `{ "email", "password", "connectionCode" }` — all required; code mandatory

**201:** `{ "token", "caregiverId", "patientId", "patientName", "role": "caregiver" }`

**Errors:** 404 invalid code, 409 email exists

---

### POST `/auth/caregiver/login`

**Body:** `{ "email", "password" }`

**200:** `{ "token", "caregiverId", "patientId", "role": "caregiver" }`

---

## Voice

### POST `/voice`

**Headers:** `Authorization: Bearer` (sent by client; not validated server-side in v1)

**Body:** `{ "patientId", "audioBase64" }` (webm)

**200:** `{ "transcribedText", "response", "audioResponse", "isDistressed", "distressSeverity" }`

**Errors:** 400, 404, 500

---

## Memory

### POST `/memory`

**Body:** `{ "patientId", "memoryType", "data", "photoBase64?" }`

Types: `person`, `object`, `lifeHistory`, `medication`, `event`

**200:** `{ "success": true }`

---

### POST `/identify`

**Body:** `{ "patientId", "photoBase64" }`

**200:** `{ "description", "audioResponse", "matchedPerson" | null }`

---

## Patient profile

### GET `/patient/{patientId}`

Returns patient without `hashedPassword` or `connectionCode`.

---

## Alerts

### GET `/alerts/{patientId}`

Array; unresolved first.

### POST `/alerts/{alertId}/resolve`

**200:** `{ "success": true }`

---

## Interactions

### GET `/interactions/{patientId}?limit=50`

Newest first.

---

## Scheduled (internal)

`getScheduledMessage` — EventBridge only.

---

## Client (`web/lib/api.js`)

| Function | Endpoint |
|----------|----------|
| `registerPatient(data)` | POST `/auth/patient/register` |
| `loginPatient(data)` | POST `/auth/patient/login` |
| `registerCaregiver(data)` | POST `/auth/caregiver/register` |
| `loginCaregiver(data)` | POST `/auth/caregiver/login` |
| `sendVoiceInput(patientId, audioBase64)` | POST `/voice` + Bearer |
| `getPatient(patientId)` | GET `/patient/{id}` + Bearer |
| `uploadMemory(...)` | POST `/memory` + Bearer |
| `identifyPhoto(...)` | POST `/identify` + Bearer |
| `getAlerts(patientId)` | GET `/alerts/{id}` + Bearer |
| `resolveAlert(alertId)` | POST `/alerts/{id}/resolve` + Bearer |
| `getInteractions(patientId, limit)` | GET `/interactions/{id}` + Bearer |
