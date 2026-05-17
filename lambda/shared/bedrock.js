import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const agentClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
const runtimeClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

const DEFAULT_MODEL_ID = "anthropic.claude-sonnet-4-20250514";

function getRequiredBedrockConfig() {
  const agentId = process.env.BEDROCK_AGENT_ID;
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID;

  if (!agentId) {
    throw new Error("BEDROCK_AGENT_ID is not set");
  }

  if (!agentAliasId) {
    throw new Error("BEDROCK_AGENT_ALIAS_ID is not set");
  }

  return { agentId, agentAliasId };
}

function getModelId() {
  return process.env.BEDROCK_MODEL_ID || DEFAULT_MODEL_ID;
}

export async function extractWithAI(prompt) {
  const response = await runtimeClient.send(new ConverseCommand({
    modelId: "us.amazon.nova-lite-v1:0",
    system: [{ text: "You are a memory extraction assistant. Return ONLY valid JSON, no explanation, no markdown." }],
    messages: [{ role: "user", content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 256, temperature: 0 },
  }));
  const text = response.output.message.content[0].text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

export async function invokeClaude(systemPrompt, userPrompt, maxTokens = 256) {
  const response = await runtimeClient.send(new ConverseCommand({
    modelId: getModelId(),
    system: [{ text: systemPrompt }],
    messages: [{ role: "user", content: [{ text: userPrompt }] }],
    inferenceConfig: { maxTokens, temperature: 0.4 },
  }));

  return (response.output?.message?.content ?? [])
    .map(part => part.text || "")
    .join("")
    .trim();
}

export async function invokeAgent(sessionId, inputText) {
  const { agentId, agentAliasId } = getRequiredBedrockConfig();
  const command = new InvokeAgentCommand({
    agentId,
    agentAliasId,
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
