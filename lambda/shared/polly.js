import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const client = new PollyClient({ region: process.env.AWS_REGION || "us-east-1" });

export async function synthesizeSpeech(text) {
  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Ruth",
    Engine: "neural",
    TextType: "text"
  });

  const response = await client.send(command);
  const chunks = [];
  for await (const chunk of response.AudioStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("base64");
}
