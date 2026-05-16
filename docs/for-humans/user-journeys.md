# User Journeys

Screen-level flows for Memodi. Routes marked **(not built)** are implementation targets.

## 1. Patient onboarding

```mermaid
sequenceDiagram
  participant Patient
  participant App as /auth/patient
  participant API as Backend

  Patient->>App: name email password timezone
  App->>API: POST /auth/patient/register
  API-->>App: token + connectionCode
  App->>Patient: Show connection code copy UI
  Patient->>Patient: Share code with caregiver
  App->>App: Save session redirect /patient
```

**Register fields:** email, password, name, timezone (required). DOB and preferences optional / profile later.

**Not shown at signup:** preferences editor (server defaults apply).

## 2. Caregiver onboarding

```mermaid
sequenceDiagram
  participant Caregiver
  participant App as /auth/caregiver
  participant API as Backend

  Caregiver->>App: email password connectionCode
  App->>API: POST /auth/caregiver/register
  API-->>App: token patientId patientName
  App->>Caregiver: Welcome linked to patient
  App->>App: Redirect /caregiver or /family
```

**Rules:**

- Connection code **required** at signup — patient must exist first
- **One caregiver** per patient in v1
- No “register now, link later” flow

## 3. Daily companion use (patient)

**Route:** `/patient` **(not built)**

- Tap orb → listen → tap → processing → spoken response
- Distress turns orb pink; caregiver gets alert
- Uses session `patientId` only

## 4. Memory Bank (caregiver)

**Route:** `/family` **(not built)**  
**Access:** **Caregivers only** — patients cannot open this route

Tabs: People · Objects · Life History · Medications · Events

Uses caregiver JWT’s `patientId` (linked patient).

**Future:** Family-member role may access Memory Bank without caregiver dashboard.

## 5. Caregiver dashboard

**Route:** `/caregiver` **(not built)**

Alerts, interactions, summary stats. Resolve alerts in UI.

## 6. Distress alert

Voice pipeline → DynamoDB alert → SNS → caregiver checks dashboard.

## 7. Proactive routine

EventBridge every 15 min; matches `routine.schedule` to patient timezone. Logged as interactions; patient playback UI optional later.

## Navigation by role

| Role | Tabs (`TabNav.jsx`) |
|------|---------------------|
| Patient | Companion (`/patient`) |
| Caregiver | Memory Bank (`/family`), Dashboard (`/caregiver`) |

Middleware should block wrong-role access (e.g. patient → `/family` → redirect).

## Related docs

- [product-vision.md](product-vision.md)
- [../architecture/auth-and-sessions.md](../architecture/auth-and-sessions.md)
