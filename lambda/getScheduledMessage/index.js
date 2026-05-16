import { scanAllPatients, saveInteraction } from "../shared/dynamodb.js";
import { invokeClaude } from "../shared/bedrock.js";
import { synthesizeSpeech } from "../shared/polly.js";
import { v4 as uuidv4 } from "uuid";

function getCurrentTimeInTimezone(timezone) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false });
  return timeStr;
}

function isWithin7Minutes(scheduleTime, currentTime) {
  const [sh, sm] = scheduleTime.split(":").map(Number);
  const [ch, cm] = currentTime.split(":").map(Number);
  const schedMins = sh * 60 + sm;
  const currMins = ch * 60 + cm;
  return Math.abs(schedMins - currMins) <= 7;
}

export const handler = async () => {
  const patients = await scanAllPatients();

  for (const patient of patients) {
    const schedule = patient.routine?.schedule ?? [];
    const timezone = patient.timezone || "America/New_York";
    const currentTime = getCurrentTimeInTimezone(timezone);

    for (const entry of schedule) {
      if (!isWithin7Minutes(entry.time, currentTime)) continue;

      try {
        const responseText = await invokeClaude(
          `You are Memodi, a warm companion for ${patient.name}. Say this scheduled message warmly and naturally in 1-2 sentences: "${entry.message}"`,
          `It is ${currentTime} and time for: ${entry.activity}`,
          128
        );

        const audioBase64 = await synthesizeSpeech(responseText);

        await saveInteraction({
          interactionId: uuidv4(),
          patientId: patient.patientId,
          timestamp: new Date().toISOString(),
          type: "proactive",
          patientSaid: null,
          memodiResponded: responseText,
          distressDetected: false,
          activity: entry.activity,
          audioBase64
        });
      } catch (err) {
        console.error(`Scheduled message failed for ${patient.patientId}:`, err);
      }
    }
  }
};
