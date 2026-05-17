# User Journeys

## 0. Landing (`/`)

Marketing page (`MemodiMesh`). CTAs → patient or caregiver auth. Logged-in users redirect to their home route.

## 1. Patient onboarding

1. `/auth/patient` — register or login (Cognito + JWT on login)
2. First visit `/patient` — welcome → optional tutorial → companion
3. **Share with caregiver** — generate 6-digit code (15 min) → copy link `/connect?code=…`

## 2. Caregiver onboarding

**Path A — Code at signup**

1. Patient shares code or link
2. `/auth/caregiver` or `/connect?code=123456` — name, relationship, email, password
3. `registerCaregiver` validates code, links accounts, sends verification email
4. Verify email → login → `/caregiver` and `/family`

**Path B — Connect later**

1. Caregiver has account but needs link → `POST /caregiver/connect` (if UI exposed)

**Rules:** One caregiver per patient; expired codes return 410; used codes are cleared.

## 3. Daily companion (`/patient`)

- Tap mic → browser listens → stop → Bedrock Agent response → Piper speaks
- Optional: `EmotionMonitor` (local DeepFace) tints orb on sustained negative emotion
- `ComfortTray` — text size, motion, contrast (client-side)
- Distress keywords → SNS alert + caregiver dashboard

## 4. Memory Bank (`/family`)

Caregiver only. Tabs: People, Objects, Life History, Medications, Events.

- Add via `POST /memory`
- Edit / delete via `/memory/edit`, `/memory/delete`

## 5. Caregiver dashboard (`/caregiver`)

Alerts, interactions, resolve alerts.

## 6. Distress & proactive

- Voice distress → alert + SNS
- EventBridge `getScheduledMessage` — routine schedule (uses legacy `invokeClaude` until fixed)

## Related

- [auth-and-sessions.md](../architecture/auth-and-sessions.md)
- [voice-pipeline.md](../architecture/voice-pipeline.md)
