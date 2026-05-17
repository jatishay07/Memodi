# Implementation Checklist

## Phase 1 — Infrastructure

- [x] S3 buckets in `serverless.yml`
- [ ] Rekognition `memodi-faces` + SNS subscription
- [ ] Bedrock Agent + Nova Lite access in `us-east-1`
- [ ] `cd lambda && npm install` && `npm run deploy`

## Phase 2 — Auth & linking

- [x] Cognito signup / verify / login / password reset
- [x] `generateConnectionCode` + `connectToPatient`
- [x] Caregiver register with required code
- [x] `/connect?code=` page

## Phase 3 — Patient companion

- [x] Web Speech STT + `sendTextInput` + Piper
- [x] Onboarding welcome + tutorial
- [x] Comfort tray (accessibility)
- [x] EmotionMonitor (local DeepFace)
- [ ] `middleware.js` role guards

## Phase 4 — Memory Bank

- [x] `/family` CRUD + edit/delete APIs

## Phase 5 — Legacy / polish

- [x] Restore `invokeClaude` for legacy `/voice`, identify, and scheduled routes
- [ ] Backend JWT verification

## Verify

| # | Test |
|---|------|
| 1 | Patient login → generate code → caregiver register with code |
| 2 | Voice turn → Agent response + Piper audio |
| 3 | Edit/delete memory on `/family` |
| 4 | Distress phrase → alert on dashboard |
