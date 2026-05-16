import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand
} from "@aws-sdk/client-transcribe";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION || "us-east-1" });
const s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

const VOICE_BUCKET = () => process.env.S3_VOICE_BUCKET;

export async function transcribeAudio(audioBase64, jobName) {
  const audioBuffer = Buffer.from(audioBase64, "base64");
  const s3Key = `transcribe-input/${jobName}.webm`;

  await s3Client.send(new PutObjectCommand({
    Bucket: VOICE_BUCKET(),
    Key: s3Key,
    Body: audioBuffer,
    ContentType: "audio/webm"
  }));

  await transcribeClient.send(new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    Media: { MediaFileUri: `s3://${VOICE_BUCKET()}/${s3Key}` },
    MediaFormat: "webm",
    LanguageCode: "en-US",
    Settings: { ShowSpeakerLabels: false }
  }));

  // Poll until complete — max 16 x 3s = 48s
  for (let i = 0; i < 16; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const status = await transcribeClient.send(new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName
    }));
    const jobStatus = status.TranscriptionJob.TranscriptionJobStatus;

    if (jobStatus === "COMPLETED") {
      const transcriptUrl = status.TranscriptionJob.Transcript.TranscriptFileUri;
      const res = await fetch(transcriptUrl);
      const data = await res.json();
      return data.results.transcripts[0].transcript;
    }

    if (jobStatus === "FAILED") {
      throw new Error(`Transcription failed: ${status.TranscriptionJob.FailureReason}`);
    }
  }

  throw new Error("Transcription timed out after 48 seconds");
}
