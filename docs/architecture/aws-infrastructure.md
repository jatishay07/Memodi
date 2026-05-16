# AWS Infrastructure

Memodi backend is deployed with the Serverless Framework from the repository root. DynamoDB tables are in `serverless.yml`. S3 and Rekognition are **manual prerequisites**.

## Deployment scope

| Setting | Value |
|---------|--------|
| Region | `us-east-1` only |
| Stages | Single stage (default); no staging/prod split for hackathon |
| Service | `memodi` |

Use `npm run deploy:dev` only if you intentionally want a `dev` stage in the same account — not required for the hackathon.

## Serverless service

| Property | Value |
|----------|--------|
| Framework | Serverless 3 |
| Runtime | `nodejs18.x` |
| API | HTTP API (API Gateway v2) |

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DYNAMODB_PATIENTS_TABLE` | `memodi-patients` |
| `DYNAMODB_INTERACTIONS_TABLE` | `memodi-interactions` |
| `DYNAMODB_ALERTS_TABLE` | `memodi-alerts` |
| `DYNAMODB_CAREGIVERS_TABLE` | `memodi-caregivers` |
| `S3_PHOTOS_BUCKET` | `memodi-photos` |
| `S3_VOICE_BUCKET` | `memodi-voice-recordings` |
| `BEDROCK_MODEL_ID` | `anthropic.claude-sonnet-4-20250514` |
| `SNS_CAREGIVER_TOPIC_ARN` | `${env:SNS_CAREGIVER_TOPIC_ARN}` |
| `JWT_SECRET` | `${env:JWT_SECRET}` |

## IAM permissions (Lambda role)

| Service | Actions |
|---------|---------|
| DynamoDB | GetItem, PutItem, UpdateItem, Query, Scan on `memodi-*` |
| S3 | PutObject, GetObject on `memodi-*` |
| Bedrock | InvokeModel |
| Polly | SynthesizeSpeech |
| Transcribe | StartTranscriptionJob, GetTranscriptionJob |
| Rekognition | SearchFacesByImage, IndexFaces |
| SNS | Publish |

## CloudFormation resources (automatic)

On `serverless deploy`:

- `memodi-patients` (+ `EmailIndex`, `ConnectionCodeIndex`)
- `memodi-interactions` (+ `PatientIdIndex`)
- `memodi-alerts` (+ `PatientIdIndex`)
- `memodi-caregivers` (+ `EmailIndex`)

## Manual prerequisites (before feature work)

Create once in AWS Console or CLI — **not** in `serverless.yml` for v1:

| Resource | Purpose |
|----------|---------|
| S3 `memodi-photos` | Family photos, identify uploads |
| S3 `memodi-voice-recordings` | Transcribe input audio |
| Rekognition collection `memodi-faces` | Face index + search |
| SNS topic | Caregiver distress alerts; set ARN in deploy env |

### CLI example

```bash
aws s3 mb s3://memodi-photos --region us-east-1
aws s3 mb s3://memodi-voice-recordings --region us-east-1
aws rekognition create-collection --collection-id memodi-faces --region us-east-1
aws sns create-topic --name memodi-caregiver-alerts --region us-east-1
```

If buckets are missing, S3/Transcribe fail at runtime. If Rekognition collection is missing, face features log a warning and continue.

## Deploy steps

From repository root:

```bash
npm install
export JWT_SECRET="<strong-random-secret>"
export SNS_CAREGIVER_TOPIC_ARN="arn:aws:sns:us-east-1:ACCOUNT:memodi-caregiver-alerts"
npm run deploy
```

Copy HTTP API URL to `web/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=https://xxxxxxxx.execute-api.us-east-1.amazonaws.com
```

## Lambda functions

| Function | Timeout | Trigger |
|----------|---------|---------|
| Auth (4) | default | HTTP POST |
| `processVoiceInput` | 90s | HTTP POST |
| `uploadMemory`, `identifyPhoto` | 30s | HTTP POST |
| `getPatient`, `getAlerts`, `getInteractions`, `resolveAlert` | default | HTTP |
| `getScheduledMessage` | 60s | `rate(15 minutes)` |

## Bedrock

Enable Claude Sonnet 4 model access in Bedrock console for `us-east-1`.

## Related docs

- [for-humans/operations.md](../for-humans/operations.md)
- [decisions/OPEN_QUESTIONS.md](../decisions/OPEN_QUESTIONS.md)
