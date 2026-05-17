# API Reference

Base URL: `NEXT_PUBLIC_API_BASE_URL` (API Gateway HTTP API in `us-east-1`).

All JSON bodies. CORS enabled. OPTIONS on POST routes.

## Authorization (v1)

| Layer | Behavior |
|-------|----------|
| **Frontend** | `Authorization: Bearer <jwt>` on core routes |
| **Backend** | **Does not verify JWT** — known limitation |

Auth routes do not require Bearer tokens.

---

## Auth

### POST `/auth/patient/register`

**Body:** `{ "email", "password", "name" }`

**201:** `{ "message", "patientId", "email", "name" }` — Cognito verification email; no JWT

**200:** `{ "needsVerification": true, "email", "message" }` (unconfirmed resend)

---

### POST `/auth/patient/login`

**Body:** `{ "email", "password" }`

**200:** `{ "token", "patientId", "role": "patient", "name" }`

**403:** `{ "code": "EMAIL_NOT_VERIFIED" }`

---

### POST `/auth/caregiver/register`

**Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)",
  "name": "string (required)",
  "relationship": "string (required)",
  "connectionCode": "string (required, 6-digit active code)"
}
```

Validates code (exists, not expired, patient has no caregiver). Creates Cognito user + caregiver **already linked** to patient. Consumes code.

**201:** `{ "message", "caregiverId", "email", "patientName", "needsVerification": true }`

**Errors:** 404 code not found, 410 expired, 409 patient already has caregiver / email exists

---

### POST `/auth/caregiver/login`

**Body:** `{ "email", "password" }`

**200:** `{ "token", "caregiverId", "patientId", "role": "caregiver", "name" }`

---

### POST `/auth/verify`

**Confirm:** `{ "email", "code" }` → **200** `{ "message" }`

**Resend:** `{ "email", "resend": true }` → **200** `{ "message" }`

---

### POST `/auth/forgot-password` / POST `/auth/reset-password`

See Cognito flows in [auth-and-sessions.md](../architecture/auth-and-sessions.md).

---

## Linking

### POST `/patient/generate-code`

**Body:** `{ "patientId" }`

**200:** `{ "code": "123456", "expiresAt": "<ISO, +15 minutes>" }`

Sets `connectionCode` and `connectionCodeExpiresAt` on patient. Patient UI shares `/connect?code={code}`.

---

### POST `/caregiver/connect`

**Body:** `{ "caregiverId", "code" }`

Links an **existing** verified caregiver to a patient (alternative to code-at-register). Clears code; returns fresh JWT.

**200:** `{ "token", "patientId", "patientName" }`

**Errors:** 404, 410 expired

---

## Voice

### POST `/voice/text` (primary — `/patient`)

**Body:** `{ "patientId", "text" }`

**200:** `{ "response", "isDistressed", "distressSeverity" }`

Uses Bedrock Agent + conversation history + **Nova Lite** (`extractWithAI`) to append new people/facts to memory lists when detected.

No audio in response — client calls Piper.

---

### POST `/voice` (legacy)

**Body:** `{ "patientId", "audioBase64" }` (webm)

**200:** `{ "transcribedText", "response", "audioResponse", "isDistressed", "distressSeverity" }`

Transcribe + multi-step `invokeClaude` path — **`invokeClaude` not in `bedrock.js` today** (broken until restored or migrated).

---

## Memory

### POST `/memory`

**Body:** `{ "patientId", "memoryType", "data", "photoBase64?" }`

Types: `person`, `object`, `lifeHistory`, `medication`, `event`

**200:** `{ "success": true }`

---

### POST `/memory/delete`

**Body:** `{ "patientId", "field", "index" }`

`field`: `familyMembers` \| `objects` \| `lifeHistory` \| `medications` \| `upcomingEvents`

**200:** `{ "success": true }`

---

### POST `/memory/edit`

**Body:** `{ "patientId", "field", "index", "item" }`

**200:** `{ "success": true }`

---

### POST `/identify`

**Body:** `{ "patientId", "photoBase64" }`

**200:** `{ "description", "audioResponse", "matched": boolean, "person": object | null }`

---

## Patient profile

### GET `/patient/{patientId}`

Strips `connectionCode`, `connectionCodeExpiresAt`, legacy password fields.

---

## Alerts / interactions

### GET `/alerts/{patientId}` — unresolved first

### POST `/alerts/{alertId}/resolve` — **200** `{ "success": true }`

### GET `/interactions/{patientId}?limit=50` — newest first

---

## Scheduled (internal)

`getScheduledMessage` — EventBridge `rate(15 minutes)`.

---

## Client (`web/lib/api.js`)

| Function | Endpoint / service |
|----------|-------------------|
| Auth | `/auth/*` |
| `generateConnectionCode(patientId)` | POST `/patient/generate-code` |
| `connectToPatient(caregiverId, code)` | POST `/caregiver/connect` |
| `sendTextInput(patientId, text)` | POST `/voice/text` |
| `synthesizeWithPiper(text)` | Piper `:59125/synthesize` |
| `sendVoiceInput(...)` | POST `/voice` (legacy) |
| `uploadMemory` / `deleteMemoryItem` / `editMemoryItem` | `/memory*` |
| `getPatient`, `getAlerts`, `resolveAlert`, `getInteractions`, `identifyPhoto` | as above |
