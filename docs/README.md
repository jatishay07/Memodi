# Memodi Documentation

Memodi is a voice-first memory companion for dementia patients. Caregivers monitor alerts and manage a shared memory bank.

> **Disclaimer:** Memodi is a prototype built for demonstration purposes and is not HIPAA-compliant.

> **Repo note:** The git folder may be named `Ember`; the product name is **Memodi**.

## Start here

| If you are… | Read first |
|-------------|------------|
| Product, design, or ops | [for-humans/product-vision.md](for-humans/product-vision.md) |
| Implementing or reviewing code | [for-agents/CLAUDE.md](for-agents/CLAUDE.md) |
| Understanding the system | [architecture/system-overview.md](architecture/system-overview.md) |
| Design decisions (resolved) | [decisions/OPEN_QUESTIONS.md](decisions/OPEN_QUESTIONS.md) |

## Documentation map

### Decisions

- [decisions/OPEN_QUESTIONS.md](decisions/OPEN_QUESTIONS.md) — Resolved product/architecture choices (Q1–Q8)

### Architecture (shared)

- [architecture/system-overview.md](architecture/system-overview.md)
- [architecture/data-model.md](architecture/data-model.md)
- [architecture/auth-and-sessions.md](architecture/auth-and-sessions.md)
- [architecture/voice-pipeline.md](architecture/voice-pipeline.md)
- [architecture/photo-object-tracker.md](architecture/photo-object-tracker.md)
- [architecture/aws-infrastructure.md](architecture/aws-infrastructure.md)

### For humans

- [for-humans/product-vision.md](for-humans/product-vision.md)
- [for-humans/user-journeys.md](for-humans/user-journeys.md)
- [for-humans/design-system.md](for-humans/design-system.md)
- [for-humans/operations.md](for-humans/operations.md)

### For agents

- [for-agents/CLAUDE.md](for-agents/CLAUDE.md)
- [for-agents/rebuild-from-scratch.md](for-agents/rebuild-from-scratch.md)
- [for-agents/api-reference.md](for-agents/api-reference.md)
- [for-agents/codebase-map.md](for-agents/codebase-map.md)
- [for-agents/implementation-checklist.md](for-agents/implementation-checklist.md)

## Stack summary

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | AWS Lambda, Serverless Framework 3 |
| Region | `us-east-1`, single stage |
| Data | DynamoDB, S3 (manual setup) |
| AI / voice | Bedrock Claude, Titan Embeddings, vector memory search, Piper TTS, Transcribe / browser STT, Rekognition |

## Implementation status

| Area | Status |
|------|--------|
| Lambda core + auth | Done |
| Backend JWT enforcement | Deferred (client-only v1) |
| S3 / Rekognition | Manual one-time setup |
| Web app pages | Not built |
