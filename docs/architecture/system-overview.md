# System Overview

Memodi connects a Next.js web app to AWS Lambda functions behind API Gateway HTTP API. Patients interact through a calm companion experience; caregivers manage memories and monitor alerts.

Memodi is not a generic chatbot. It is a memory-aware companion: every patient-facing response should be grounded in caregiver- or family-entered memories, patient profile data, routines, preferences, and recent conversation context.

## High-level architecture

```mermaid
flowchart TB
  subgraph client [Next.js Web]
    PatientUI["/patient - Orb"]
    FamilyUI["/family - Memory Bank"]
    CaregiverUI["/caregiver - Dashboard"]
    AuthUI["/auth/patient | /auth/caregiver"]
  end

  subgraph aws [AWS us-east-1]
    APIGW[API Gateway HTTP API]
    LambdaAuth[Auth Lambdas]
    LambdaVoice[processVoiceInput]
    LambdaCore[Other Lambdas]
    DDB[(DynamoDB)]
    S3[(S3)]
    Bedrock[Bedrock Claude]
    Titan[Titan Embeddings]
    KB[Vector Store / Bedrock Knowledge Base]
    Transcribe[Transcribe STT]
    Rekognition[Rekognition]
    SNS[SNS Alerts]
    EB[EventBridge 15min]
  end

  subgraph local [Local Device / Edge Service]
    Piper[Piper TTS]
  end

  AuthUI --> APIGW --> LambdaAuth --> DDB
  PatientUI --> APIGW --> LambdaVoice
  LambdaVoice --> Transcribe --> S3
  LambdaVoice --> Bedrock
  LambdaVoice --> Titan --> KB
  KB --> LambdaVoice
  LambdaVoice --> Piper
  LambdaVoice --> DDB
  LambdaVoice --> SNS
  FamilyUI --> APIGW --> LambdaCore --> DDB
  FamilyUI --> APIGW --> LambdaCore --> S3
  FamilyUI --> APIGW --> LambdaCore --> Rekognition
  CaregiverUI --> APIGW --> LambdaCore --> DDB
  EB --> LambdaCore
```

## Technology stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Axios |
| API | API Gateway HTTP API (v2) |
| Compute | AWS Lambda, Node.js 18, ES modules |
| IaC / deploy | Serverless Framework 3 (`serverless.yml`) |
| Region / stage | `us-east-1`, single stage |
| Primary database | DynamoDB (4 tables) |
| Object storage | S3 (manual setup) |
| LLM | Amazon Bedrock — Claude Sonnet 4 |
| Embeddings / memory search | Amazon Titan Embeddings + vector store or Bedrock Knowledge Base |
| Speech | Transcribe or browser STT for voice input; Piper TTS for local voice output |
| Vision | Rekognition `memodi-faces` (manual setup) |
| Notifications | SNS |
| Schedules | EventBridge `rate(15 minutes)` |

## AI and memory provider roles

| Provider | Role | Handles |
|----------|------|---------|
| Anthropic Claude via Bedrock | Cognitive layer | Understanding patient requests, reasoning over memory context, generating short calm responses |
| Amazon Titan Embeddings | Memory indexing | Converting memory text and patient queries into vectors for semantic search |
| DynamoDB | Structured storage | Patient profiles, caregiver links, raw memories, routines, preferences, conversation history, alerts |
| Vector store / Bedrock Knowledge Base | Searchable memory layer | Retrieving semantically relevant memories for each patient turn |
| Piper TTS | Local voice output | Speaking Claude's final text response only |

Claude does not permanently store memories. It receives patient profile data, retrieved memory snippets, and recent conversation context for each turn, then writes the response. Piper does not reason or remember; it only converts the final text response into audio.

## Memory-aware response flow

```mermaid
flowchart TB
  UserInput[Patient speaks or types] --> ClaudeIntent[Claude understands request]
  ClaudeIntent --> QueryEmbedding[Titan Embeddings vectorizes query]
  QueryEmbedding --> MemorySearch[Vector store or Bedrock Knowledge Base retrieves memories]
  MemorySearch --> PromptContext[Assemble profile, memories, recent turns, user query]
  PromptContext --> ClaudeResponse[Claude writes calm personalized response]
  ClaudeResponse --> PiperAudio[Piper TTS generates local audio]
  PiperAudio --> PatientHears[Patient hears the answer]
```

## HTTP route map

| Method | Path | Lambda | Purpose |
|--------|------|--------|---------|
| POST | `/auth/patient/register` | `registerPatient` | Create patient + connection code |
| POST | `/auth/patient/login` | `loginPatient` | Patient login |
| POST | `/auth/caregiver/register` | `registerCaregiver` | Caregiver signup + link |
| POST | `/auth/caregiver/login` | `loginCaregiver` | Caregiver login |
| POST | `/voice` | `processVoiceInput` | Voice pipeline |
| POST | `/memory` | `uploadMemory` | Append memory |
| POST | `/identify` | `identifyPhoto` | Face match |
| GET | `/patient/{patientId}` | `getPatient` | Patient profile |
| GET | `/alerts/{patientId}` | `getAlerts` | Alerts list |
| POST | `/alerts/{alertId}/resolve` | `resolveAlert` | Resolve alert |
| GET | `/interactions/{patientId}` | `getInteractions` | Interaction log |
| _(schedule)_ | `rate(15 minutes)` | `getScheduledMessage` | Proactive messages |

See [for-agents/api-reference.md](../for-agents/api-reference.md).

## Frontend routes

| Route | Role | Purpose |
|-------|------|---------|
| `/auth/patient` | Public | Patient register / login |
| `/auth/caregiver` | Public | Caregiver register / login |
| `/patient` | Patient | Voice companion |
| `/family` | Caregiver only | Memory bank |
| `/caregiver` | Caregiver | Dashboard |

Future: family-member role may access Memory Bank.

## Cross-cutting concerns

### CORS

All Lambdas: `Access-Control-Allow-Origin: *`, headers include `Authorization`, OPTIONS supported.

### Authentication

| Concern | v1 behavior |
|---------|-------------|
| JWT issued on login/register | Yes |
| JWT verified on APIs | **No** — client route guards only |
| Frontend Bearer header | Yes (future-proof) |
| Session | `localStorage.memodi_auth` |

Post-hackathon: add backend JWT verification ([decisions](../decisions/OPEN_QUESTIONS.md)).

### Timeouts

`processVoiceInput` 90s; `uploadMemory` / `identifyPhoto` 30s; `getScheduledMessage` 60s.

## Related docs

- [data-model.md](data-model.md)
- [auth-and-sessions.md](auth-and-sessions.md)
- [voice-pipeline.md](voice-pipeline.md)
- [aws-infrastructure.md](aws-infrastructure.md)
