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

export async function playAudioBase64(base64, mimeType = 'audio/wav') {
  const audio = new Audio(`data:${mimeType};base64,${base64}`);
  await audio.play();
  return audio;
}

export function isRecordingActive() {
  return mediaRecorder?.state === 'recording';
}

let recognition = null;

export function startSpeechRecognition() {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { reject(new Error('Speech recognition not supported in this browser')); return; }
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = e => resolve(e.results[0][0].transcript);
    recognition.onerror = e => reject(new Error(e.error));
    recognition.onend = () => { recognition = null; };
    recognition.start();
  });
}

export function stopSpeechRecognition() {
  if (recognition) { recognition.stop(); recognition = null; }
}
