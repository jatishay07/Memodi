# Agent Guide

Entry: [rebuild-from-scratch.md](rebuild-from-scratch.md) → [api-reference.md](api-reference.md) → [codebase-map.md](codebase-map.md).

## Locked decisions

| Topic | Choice |
|-------|--------|
| API auth | Client-only JWT |
| Patient voice | Web Speech → `/voice/text` → Agent → Piper |
| Linking | 6-digit code, 15 min, `/patient/generate-code`, `/connect?code=` |
| Caregiver register | `connectionCode` required; links on success |
| S3 | In serverless.yml |
| Rekognition | Manual `memodi-faces` |

## Hard rules

- Use `user.patientId` from session — never hardcode patient IDs
- Patient path: `sendTextInput` + `synthesizeWithPiper`, not `sendVoiceInput`
- Do not invent API fields outside `api-reference.md`
- `cd lambda && npm install` before deploy

## Known gaps

- No `middleware.js` for role guards
- No backend JWT verification

## Local dev

`npm run dev` from repo root (Piper required for patient audio).
