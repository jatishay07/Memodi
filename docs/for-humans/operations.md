# Operations

Runbook for deploying and developing Memodi.

> Memodi is a prototype built for demonstration purposes and is not HIPAA-compliant.

## Prerequisites

- Node.js 18+
- AWS account, CLI configured for **us-east-1**
- Serverless Framework 3
- Bedrock access for Claude Sonnet 4 in `us-east-1`

## One-time AWS setup (manual)

Before voice, photos, or face features work:

```bash
aws s3 mb s3://memodi-photos --region us-east-1
aws s3 mb s3://memodi-voice-recordings --region us-east-1
aws rekognition create-collection --collection-id memodi-faces --region us-east-1
aws sns create-topic --name memodi-caregiver-alerts --region us-east-1
```

Subscribe email/SMS to the SNS topic. Not managed in `serverless.yml` for v1.

## Environment variables

### Deploy (shell)

```bash
export JWT_SECRET="<strong-random-secret>"
export SNS_CAREGIVER_TOPIC_ARN="arn:aws:sns:us-east-1:ACCOUNT:memodi-caregiver-alerts"
```

### Frontend (`web/.env.local` — do not commit)

```
NEXT_PUBLIC_API_BASE_URL=https://xxxxxxxx.execute-api.us-east-1.amazonaws.com
```

## Text-to-speech (Piper vs Polly)

| Layer | Default | With Piper |
|-------|---------|------------|
| Patient voice replies | Lambda → **Polly** (mp3 in API) | Browser → **Piper** (local Python service); Lambda returns text only |
| Scheduled / photo flows | Lambda → Polly | Unchanged (server-side Polly) |

**Piper runs only in the browser** — not in Lambda. See [rhasspy/piper](https://github.com/rhasspy/piper) (archived; active fork: [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl)).

1. One-time setup (Python 3.9+, no Docker required):

```bash
npm run piper:setup
```

2. Start Piper + frontend together:

```bash
npm run dev
```

Or two terminals: `npm run piper:up` and `cd web && npm run dev`.

Verify: `curl http://127.0.0.1:59125/health`

3. In `web/.env.local`:

```
NEXT_PUBLIC_TTS_PROVIDER=piper
NEXT_PUBLIC_PIPER_TTS_URL=http://127.0.0.1:59125
```

4. Redeploy Lambda once so `/voice` accepts `clientTts` (if not already deployed). The patient orb calls Piper directly; `/voice` sends `clientTts: true` so Lambda skips Polly.

Stop Piper: kill the `piper:up` terminal, or `npm run piper:down` if you used Docker (`piper:up:docker`).

## Deploy backend

Single stage, `us-east-1`:

```bash
npm install
npm run deploy
```

No staging/prod split required for hackathon. Optional: `npm run deploy:dev` for a named stage in the same account.

## Run frontend

```bash
cd web
npm install
npm run dev
```

## Seed data

Prefer `POST /auth/patient/register` for realistic auth flows.

Manual DynamoDB seed shape: [data-model.md](../architecture/data-model.md#seed-data-example).

## Commands

| Task | Command |
|------|---------|
| Voice logs | `npm run logs:voice` |
| Remove stack | `npm run remove` |
| Build web | `cd web && npm run build` |

## Troubleshooting

| Issue | Check |
|-------|--------|
| CORS | API URL in `.env.local`, no trailing slash |
| Mic | HTTPS or localhost; browser permission |
| Voice timeout | S3 voice bucket exists; Lambda logs |
| Transcribe fail | Bucket + IAM S3 write |
| Rekognition warn | Collection `memodi-faces` exists |
| 404 patient | Session `patientId` matches DynamoDB |
| Alerts not received | SNS ARN set; topic subscribed |

**Security note:** APIs do not validate JWT in v1. Do not expose API URL publicly without understanding the risk. Add backend auth post-hackathon.

## Related docs

- [aws-infrastructure.md](../architecture/aws-infrastructure.md)
- [implementation-checklist.md](../for-agents/implementation-checklist.md)
