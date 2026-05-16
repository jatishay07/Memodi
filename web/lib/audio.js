'use client';

let mediaRecorder = null;
let audioChunks = [];
let streamRef = null;

export async function requestAudioPermission() {
  try {
    streamRef = await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    return false;
  }
}

export async function startRecording() {
  if (!streamRef) {
    streamRef = await navigator.mediaDevices.getUserMedia({ audio: true });
  }
  audioChunks = [];

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  mediaRecorder = new MediaRecorder(streamRef, { mimeType });
  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };
  mediaRecorder.start();
}

export async function stopRecordingAndGetBase64() {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) { reject(new Error('No active recording')); return; }

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    };
    mediaRecorder.stop();
  });
}

export async function playAudioBase64(base64) {
  const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
  await audio.play();
  return audio;
}

export function isRecordingActive() {
  return mediaRecorder?.state === 'recording';
}
