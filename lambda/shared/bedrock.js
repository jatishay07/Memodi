import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

const agentClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

export async function invokeAgent(sessionId, inputText) {
  const command = new InvokeAgentCommand({
    agentId: process.env.BEDROCK_AGENT_ID,
    agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID || "TSTALIASID",
    sessionId,
    inputText,
  });

  const response = await agentClient.send(command);
  let completion = "";
  for await (const event of response.completion) {
    if (event.chunk?.bytes) {
      completion += new TextDecoder().decode(event.chunk.bytes);
    }
  }
  return completion.trim();
}

export function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}
