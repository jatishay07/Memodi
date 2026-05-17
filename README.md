# Memodi

Voice-first memory companion for dementia patients. Caregivers monitor alerts and manage a shared memory bank.

> **Prototype — not HIPAA-compliant.**

**Docs:** [docs/README.md](docs/README.md)

## Stack

Next.js 14 · AWS Lambda · Cognito · Bedrock Agent · DynamoDB · Piper + DeepFace (local dev) · `us-east-1`

## Local development

```bash
# One-time: Rekognition collection + SNS (see docs/for-humans/operations.md)

cd lambda && npm install && cd ..
export JWT_SECRET="..."
export SNS_CAREGIVER_TOPIC_ARN="..."
npm run deploy

# web/.env.local → NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_PIPER_URL

npm run dev   # Piper + optional DeepFace + Next.js
```
