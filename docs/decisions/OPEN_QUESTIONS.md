# Open Questions — Resolved

**Status:** All questions answered. Decisions are propagated across the documentation suite.

**Date resolved:** 2026-05-16

---

## Q1 — API security

Should protected Lambdas verify JWT and enforce `patientId` / role (patient vs caregiver)?

**Decision:** **B — Client-only route protection for now**

Backend JWT enforcement adds significant complexity. Ship fast; treat backend verification as a **post-hackathon security upgrade**. Frontend still sends `Authorization: Bearer` for future compatibility.

**Impacts:** `api-reference.md`, `auth-and-sessions.md`, `implementation-checklist.md`

---

## Q2 — AWS resources not in Serverless

How should S3 buckets and Rekognition collection be created?

**Decision:** **B — Manual one-time setup in AWS Console / CLI**

Do not add S3/Rekognition to `serverless.yml` for the hackathon. Create `memodi-photos`, `memodi-voice-recordings`, and collection `memodi-faces` once by hand before building features that depend on them.

**Impacts:** `aws-infrastructure.md`, `operations.md`

---

## Q3 — Route access matrix

Who may use `/family` (Memory Bank)?

**Decision:** **C — Caregivers only for now; separate “family member” role later**

Two roles in v1: `patient` and `caregiver`. Patients use `/patient` only. Caregivers use `/family` and `/caregiver`. A dedicated family-member role is a future product feature.

**Impacts:** `auth-and-sessions.md`, `user-journeys.md`, middleware, `TabNav`

---

## Q4 — Patient auth fields

**Decision:** **A — Email + password as primary auth**

Collect **name** and **timezone** on register (greeting + proactive scheduling). Do **not** require DOB or preferences at signup — those can be added on a patient profile page after login. Backend may still accept optional `dateOfBirth` if sent.

**Impacts:** `auth-and-sessions.md`, `api-reference.md`, auth UI copy

---

## Q5 — Connection code lifecycle

**Decision:** **One caregiver per patient; ephemeral 6-digit codes**

- Generated on demand via `/patient/generate-code`
- Expires in 15 minutes; single-use (cleared after link)
- One `caregiverId` per patient

**Impacts:** `data-model.md`, patient + caregiver UIs

---

## Q6 — Caregiver without code at signup

**Decision:** **Connection code required at caregiver signup**

Patient generates a 6-digit code (15 min). Caregiver must supply it when registering (`/auth/caregiver` or `/connect?code=`). `registerCaregiver` links accounts immediately. Optional `POST /caregiver/connect` for existing caregivers.

**Impacts:** `user-journeys.md`, `auth-and-sessions.md`, `api-reference.md`

---

## Q7 — Deployment target

**Decision:** **`us-east-1` only, single stage — no staging/prod split**

One Serverless stage, one region. Document and move on. Staging environments are post-hackathon.

**Impacts:** `operations.md`, `aws-infrastructure.md`

---

## Q8 — HIPAA / PHI

**Decision:** **Include disclaimer**

Add to root README and `docs/README.md`:

> Memodi is a prototype built for demonstration purposes and is not HIPAA-compliant.

**Impacts:** `product-vision.md`, README files

---

## Summary table

| # | Decision |
|---|----------|
| Q1 | Client-only auth; backend JWT later |
| Q2 | Manual S3 + Rekognition setup |
| Q3 | `/family` caregivers only; family role later |
| Q4 | Email/password; name + timezone on register |
| Q5 | One caregiver per patient |
| Q6 | Connection code required at caregiver signup |
| Q7 | us-east-1, single stage |
| Q8 | HIPAA disclaimer in README |
