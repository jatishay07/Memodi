# Memodi

A voice-first memory companion for dementia patients. Caregivers monitor alerts and manage a shared memory bank.

> **Memodi is a prototype built for demonstration purposes and is not HIPAA-compliant.**

**Documentation:** [docs/README.md](docs/README.md)

## Quick links

- [Product vision](docs/for-humans/product-vision.md)
- [Architecture overview](docs/architecture/system-overview.md)
- [Agent rebuild guide](docs/for-agents/CLAUDE.md)
- [Design decisions](docs/decisions/OPEN_QUESTIONS.md)

## Stack

Next.js 14 · AWS Lambda · DynamoDB · Bedrock · Polly · Transcribe · `us-east-1`

## Local development

```bash
# One-time: create S3 buckets + Rekognition collection (see docs/for-humans/operations.md)

# Backend
npm install
export JWT_SECRET="..."
export SNS_CAREGIVER_TOPIC_ARN="..."
npm run deploy

# Frontend
cd web && npm install
# web/.env.local → NEXT_PUBLIC_API_BASE_URL
npm run dev
```

See [docs/for-humans/operations.md](docs/for-humans/operations.md).
