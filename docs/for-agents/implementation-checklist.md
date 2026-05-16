# Implementation Checklist

Ordered tasks from current repo to shippable hackathon demo. Decisions: [OPEN_QUESTIONS.md](../decisions/OPEN_QUESTIONS.md).

---

## Phase 1 — Infrastructure

- [ ] Manual: S3 `memodi-photos`, `memodi-voice-recordings`, Rekognition `memodi-faces`, SNS topic + subscription
- [ ] `export JWT_SECRET` and `SNS_CAREGIVER_TOPIC_ARN`
- [ ] `npm install && npm run deploy` (us-east-1, single stage)
- [ ] Bedrock model access enabled
- [ ] `web/.env.local` with API URL

**Verify:** `POST /auth/patient/register` → 201 + `connectionCode`

---

## Phase 2 — Backend (post-hackathon only)

Skipped for v1 per Q1. After hackathon:

- [ ] `lambda/shared/auth.js`
- [ ] Enforce JWT + role on all core routes

---

## Phase 3 — Frontend shell

- [ ] `web/app/layout.js` — `AuthProvider`, `TabNav`
- [ ] `web/app/page.js` — redirect by role
- [ ] `web/middleware.js` — patient vs caregiver routes; **block patients from `/family`**

**Verify:** Unauthenticated → auth; patient cannot open `/family`

---

## Phase 4 — Auth UI

- [ ] `/auth/patient` — register: email, password, name, timezone; login
- [ ] `/auth/caregiver` — register: email, password, **connection code**; login
- [ ] Show connection code after patient register
- [ ] Logout

**Verify:** Patient register → caregiver register with code → both sessions work

---

## Phase 5 — Patient companion

- [ ] `/patient/page.js` — orb, `sendVoiceInput(user.patientId, ...)`

**Verify:** Full voice turn with audio playback

---

## Phase 6 — Memory Bank

- [ ] `/family/page.js` — caregiver only, `user.patientId`

**Verify:** Add person → visible in list and `getPatient`

---

## Phase 7 — Caregiver dashboard

- [ ] `/caregiver/page.js`, `error.js`
- [ ] Resolve alerts

**Verify:** Distress phrase → alert on dashboard

---

## Phase 8 — Polish

- [ ] Hide `TabNav` on `/auth/*`
- [ ] README disclaimer present (done in docs)
- [ ] Optional: patient profile page for DOB/preferences (post-signup)

---

## Test plan

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Patient register | Code shown, JWT stored |
| 2 | Caregiver register + code | Linked, one `caregiverId` |
| 3 | Voice turn | MP3 + interaction |
| 4 | Distress | Alert + SNS |
| 5 | Patient visits `/family` | Redirect / 403 |
| 6 | Caregiver adds memory | Persists |
| 7 | Resolve alert | `resolved: true` |

---

## Related

- [CLAUDE.md](CLAUDE.md)
- [codebase-map.md](codebase-map.md)
