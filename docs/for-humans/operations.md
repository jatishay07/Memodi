# Operations

> Prototype — not HIPAA-compliant.

## Prerequisites

- Node.js 18+
- AWS CLI (`us-east-1`)
- Serverless Framework 3
- Bedrock **Agent** + **Nova Lite** enabled in `us-east-1`
- Python 3.12+ for Piper / DeepFace venvs (local)

## One-time AWS setup

**S3** is created by `serverless deploy` — do not pre-create `memodi-photos` or `memodi-voice-recordings`.

**Manual:**

```bash
aws rekognition create-collection --collection-id memodi-faces --region us-east-1
aws sns create-topic --name memodi-caregiver-alerts --region us-east-1
```

Subscribe to the SNS topic. Confirm Bedrock Agent `TIZBKTXHVL` (or your ID in `serverless.yml`) is deployed.

## Deploy

```bash
cd lambda && npm install && cd ..
export JWT_SECRET="..."
export SNS_CAREGIVER_TOPIC_ARN="arn:aws:sns:..."
npm run deploy
```

## Frontend env (`web/.env.local`)

```
NEXT_PUBLIC_API_BASE_URL=https://....execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_PIPER_URL=http://127.0.0.1:59125
NEXT_PUBLIC_DEEPFACE_URL=http://127.0.0.1:59126
NEXT_PUBLIC_EMOTION_ENABLED=true
```

## Local dev

```bash
npm run dev
```

Starts Piper (required), DeepFace (if venv exists), Next.js on :3000.

| Command | Purpose |
|---------|---------|
| `npm run piper:up` | TTS only |
| `npm run deepface:up` | Emotion only |
| `npm run logs:voice` | Legacy voice Lambda logs |

## Troubleshooting

| Issue | Check |
|-------|--------|
| Piper failed on `npm run dev` | Voice `.onnx` in `services/piper-tts/voices/` |
| Agent error on chat | `processTextInput` logs; if Bedrock returns access denied, update the Bedrock agent execution role to allow the inference profile and its backing foundation models in every routed region |
| Code expired (410) | Patient regenerates code on `/patient` |
| Patient already has caregiver (409) | One caregiver per patient |
| Legacy `/voice` 500 | Check `BEDROCK_MODEL_ID`, `invokeClaude`, and Bedrock permissions |
| Rekognition warn | Collection `memodi-faces` exists |

## Related

- [aws-infrastructure.md](../architecture/aws-infrastructure.md)
- [local-dev-services.md](../architecture/local-dev-services.md)
