# Auth and Sessions

Memodi uses **Amazon Cognito** for credentials and **app-issued JWTs** after login. Patient and caregiver profiles live in DynamoDB.

## Roles

| Role | Routes |
|------|--------|
| `patient` | `/patient` |
| `caregiver` | `/family`, `/caregiver` |

Patients cannot access caregiver routes; caregivers cannot access `/patient`.

## Credentials

Passwords live in **Cognito only** (`lambda/shared/cognito.js`). DynamoDB stores profile data.

## Patient registration & login

**Register:** `POST /auth/patient/register` — `email`, `password`, `name` → verification email (no JWT).

**Login:** `POST /auth/patient/login` → JWT after Cognito auth.

**Verify:** `POST /auth/verify` with `{ email, code }` or `{ email, resend: true }`.

## Caregiver registration & login

**Register:** `POST /auth/caregiver/register` requires `name`, `relationship`, `email`, `password`, and **`connectionCode`** (6-digit, active).

On success:

1. Patient validated by code (not expired, no existing caregiver)
2. Cognito signup
3. Caregiver created with `linkedPatientId` set
4. Patient `caregiverId` set; code cleared

**201** includes `needsVerification: true` — caregiver verifies email before login.

**Login:** `POST /auth/caregiver/login` → JWT with `patientId` = `linkedPatientId`.

## Connection codes (linking)

| Property | Value |
|----------|--------|
| Format | 6-digit numeric (`100000`–`999999`) |
| TTL | 15 minutes (`connectionCodeExpiresAt`) |
| Generation | `POST /patient/generate-code` from logged-in patient |
| Share | Patient UI copies link `https://<host>/connect?code=XXXXXX` |
| Consumption | Single use — cleared on successful link |
| Caregivers per patient | One |

### Linking paths

1. **Register with code** — `/auth/caregiver` or `/connect?code=…` → `registerCaregiver`
2. **Post-register connect** — `POST /caregiver/connect` with `caregiverId` + `code` (returns new JWT)

### Patient flow

After login, patient opens **Share with caregiver** on `/patient` → `generateConnectionCode` → display countdown → caregiver opens `/connect` or enters code at signup.

> **Note:** `registerPatient` still writes an 8-char alphanumeric placeholder to DynamoDB at signup, but the **canonical** share flow uses `generate-code`. Auth UI may show a code screen only if the API returns one (dev mocks use `DEMO-1234`).

## JWT

| Property | Value |
|----------|-------|
| Secret | `JWT_SECRET` |
| Expiry | 30 days |
| Header | `Authorization: Bearer <token>` |

**Patient claims:** `{ sub, role: "patient", patientId }`

**Caregiver claims:** `{ sub, role: "caregiver", caregiverId, patientId }`

## Frontend session

`localStorage.memodi_auth` — see `web/lib/auth.js`.

## API authorization (backend)

**v1:** No JWT verification on Lambdas. Client route guards only.

## Related docs

- [for-agents/api-reference.md](../for-agents/api-reference.md)
- [for-humans/user-journeys.md](../for-humans/user-journeys.md)
- [data-model.md](data-model.md)
