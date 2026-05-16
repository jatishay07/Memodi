import { playAudioBase64 } from './audio';
import { synthesizeWithPiper } from './piper';

export function usesClientPiper() {
  return process.env.NEXT_PUBLIC_TTS_PROVIDER === 'piper';
}

/** Speak Memodi's reply: Piper in the browser, or Polly audio from the API. */
export async function speakResponse(text, serverAudioBase64) {
  if (!text?.trim()) return null;

  if (usesClientPiper()) {
    const { base64, mimeType } = await synthesizeWithPiper(text);
    return playAudioBase64(base64, mimeType);
  }
  if (serverAudioBase64) {
    return playAudioBase64(serverAudioBase64, 'audio/mpeg');
  }
  return null;
}
