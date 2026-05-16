# Agent Guide (Claude / Cursor / etc.)

Entry point for AI agents working on **Memodi**.

## Read order

1. [rebuild-from-scratch.md](rebuild-from-scratch.md)
2. [api-reference.md](api-reference.md)
3. [codebase-map.md](codebase-map.md)
4. [implementation-checklist.md](implementation-checklist.md)

Architecture: [../architecture/](../architecture/). Decisions: [../decisions/OPEN_QUESTIONS.md](../decisions/OPEN_QUESTIONS.md) (all resolved).

## Resolved decisions (do not re-litigate)

| Topic | v1 choice |
|-------|-----------|
| API auth | Client-only; no backend JWT verify |
| S3 / Rekognition | Manual AWS setup |
| `/family` | Caregivers only |
| Patient signup | email, password, name, timezone |
| Caregivers | One per patient; code required at signup |
| Deploy | `us-east-1`, single stage |
| Compliance | Prototype; not HIPAA-compliant (see README) |

## Hard rules

- Never hardcode `PATIENT_ID` — use `memodi_auth.patientId`
- Never commit `.env.local` or secrets
- ES modules in `lambda/`
- Send `Authorization: Bearer` on core API calls
- Do not invent API fields outside `api-reference.md`
- Block patients from `/family` in middleware
- Do not add S3/Rekognition to serverless.yml unless user explicitly changes Q2

## Session

`localStorage.memodi_auth` — see [auth-and-sessions.md](../architecture/auth-and-sessions.md).

## Routes

| Path | Role |
|------|------|
| `/auth/patient`, `/auth/caregiver` | Public |
| `/patient` | patient |
| `/family` | caregiver |
| `/caregiver` | caregiver |

## Known gaps to implement

1. Next.js pages under `web/app/`
2. `middleware.js` role guards
3. Post-hackathon: `lambda/shared/auth.js` + JWT verify

## Related

- [../for-humans/design-system.md](../for-humans/design-system.md)
