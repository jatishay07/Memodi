# Codebase Map

## Root layout

```
.
├── serverless.yml          # 19 Lambdas, Cognito, S3, DynamoDB
├── lambda/                 # npm install here before deploy
├── scripts/dev.sh          # Piper + DeepFace + Next.js
├── services/               # piper-tts, deepface-emotion
└── web/
    ├── app/                # pages
    ├── components/         # UI
    └── lib/                # api, auth, audio, emotion
```

## Lambdas (19 handlers)

| Area | Functions |
|------|-----------|
| Auth | register/login patient & caregiver, verify, forgot/reset password |
| Linking | `generateConnectionCode`, `connectToPatient` |
| Voice | `processTextInput`, `processVoiceInput` (legacy) |
| Memory | `uploadMemory`, `manageMemory` (delete/edit), `identifyPhoto` |
| Data | `getPatient`, `getAlerts`, `getInteractions`, `resolveAlert` |
| Cron | `getScheduledMessage` |

## Shared modules

| File | Exports |
|------|---------|
| `bedrock.js` | `invokeAgent`, `extractWithAI`, `extractJSON` |
| `cognito.js` | SignUp, auth, forgot password |
| `dynamodb.js` | CRUD + list append/delete/update |
| `polly.js`, `transcribe.js` | Legacy `/voice` |

## Web pages

| Path | Notes |
|------|-------|
| `app/page.js` | Landing |
| `app/auth/*` | Sign-in components |
| `app/connect/` | Caregiver register with code from URL |
| `app/patient/page.js` | Orb, STT, Piper, onboarding, code share, EmotionMonitor |
| `app/family/page.js` | Memory CRUD |
| `app/caregiver/page.js` | Dashboard |

## Key components

`Orb`, `EmotionMonitor`, `PatientWelcome`, `TutorialBubble`, `ComfortTray`, `AtmosphericDepth`, `MemoryCard`, `PatientNav`, `CaregiverNav`, `MemodiMesh`

## Related

- [api-reference.md](api-reference.md)
- [implementation-checklist.md](implementation-checklist.md)
