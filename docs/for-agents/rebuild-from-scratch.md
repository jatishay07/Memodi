# Rebuild from Scratch

Master reference to regenerate Memodi. See [CLAUDE.md](CLAUDE.md) for agent rules.

> Memodi is a prototype built for demonstration purposes and is not HIPAA-compliant.

## What is Memodi?

Voice-first memory companion for dementia patients. Stack: Next.js 14, AWS Lambda, DynamoDB, Bedrock Claude, Titan Embeddings, vector memory search, Piper TTS, Transcribe / browser STT, Rekognition, SNS, EventBridge.

## v1 decisions (locked)

| Area | Choice |
|------|--------|
| API security | Client-only; backend JWT post-hackathon |
| S3 / Rekognition | Manual one-time AWS setup |
| `/family` | Caregivers only; family role later |
| Patient register | email, password, name, timezone |
| Caregivers | One per patient; code required at signup |
| Deploy | `us-east-1`, single stage |
| HIPAA | Disclaimer in README |

Details: [../decisions/OPEN_QUESTIONS.md](../decisions/OPEN_QUESTIONS.md).

## Project structure

```
.
├── package.json
├── serverless.yml
├── lambda/
│   ├── shared/ (bedrock, dynamodb, polly, transcribe)
│   ├── registerPatient, loginPatient, registerCaregiver, loginCaregiver
│   ├── processVoiceInput, uploadMemory, identifyPhoto
│   ├── getPatient, getAlerts, getInteractions, resolveAlert
│   └── getScheduledMessage
└── web/
    ├── app/ (layout, pages — mostly to build)
    ├── components/ (Orb, TabNav, AlertCard, MemoryCard)
    └── lib/ (api, auth, audio)
```

## Environment

**Backend:** `DYNAMODB_*`, `S3_*`, `BEDROCK_MODEL_ID`, `JWT_SECRET`, `SNS_CAREGIVER_TOPIC_ARN`

**Frontend:** `NEXT_PUBLIC_API_BASE_URL`

## Auth & routes

- Patient: `/patient` — register with name + timezone; share `connectionCode`
- Caregiver: `/family`, `/caregiver` — register with code
- Session: `localStorage.memodi_auth`
- No hardcoded `PATIENT_ID` in `api.js`

## API routes

See [api-reference.md](api-reference.md).

## Design system

Navy/amber/cream/pink/gold; orb states `idle|listening|speaking|distress|morning`. See [../for-humans/design-system.md](../for-humans/design-system.md).

## Voice pipeline

Transcribe / browser STT → Titan query embedding → vector memory retrieval → Claude response → distress check + Piper TTS → save interaction/alert. See [../architecture/voice-pipeline.md](../architecture/voice-pipeline.md).

## Deploy

1. Manual S3 + Rekognition + SNS
2. `npm install && npm run deploy`
3. `web/.env.local`
4. `cd web && npm run dev`

## Repo status

| Item | Status |
|------|--------|
| Lambdas | Done |
| JWT backend verify | Deferred |
| Web pages | Not built |
| middleware | Not built |

[codebase-map.md](codebase-map.md) · [implementation-checklist.md](implementation-checklist.md)
