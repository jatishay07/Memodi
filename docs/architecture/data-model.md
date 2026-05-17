# Data Model

Memodi stores data in four DynamoDB tables provisioned by `serverless.yml`. S3 holds photos and temporary audio for Transcribe.

## Tables overview

| Table | Partition key | GSIs |
|-------|---------------|------|
| `memodi-patients` | `patientId` | `EmailIndex` (email), `ConnectionCodeIndex` (connectionCode) |
| `memodi-caregivers` | `caregiverId` | `EmailIndex` (email) |
| `memodi-interactions` | `interactionId` | `PatientIdIndex` (patientId + timestamp) |
| `memodi-alerts` | `alertId` | `PatientIdIndex` (patientId + timestamp) |

## `memodi-patients`

One item per patient. Created on register; memories appended via `uploadMemory`.

| Field | Type | Notes |
|-------|------|-------|
| `patientId` | String | PK, e.g. `patient-{uuid}` |
| `email` | String | Cognito username; GSI |
| `connectionCode` | String \| null | 6-digit when active; GSI; **stripped on GET** |
| `connectionCodeExpiresAt` | String \| null | ISO; 15-minute TTL from `generate-code` |
| `name` | String | Full name |
| `nickname` | String | Defaults to first name |
| `dateOfBirth` | String | ISO date, e.g. `1942-03-15` |
| `timezone` | String | IANA, e.g. `America/Chicago` |
| `caregiverId` | String \| null | One caregiver per patient (set on link) |
| `familyMembers` | List | People + stories + optional `photoUrl` |
| `objects` | List | `{ item, location }` |
| `lifeHistory` | List | Strings or `{ fact }` |
| `medications` | List | `{ name, time, location }` |
| `upcomingEvents` | List | `{ description, date }` |
| `preferences` | Map | `{ comfortPhrases[], avoidTopics[] }` |
| `routine` | Map | `{ schedule: [{ time, activity, message }] }` |
| `createdAt` | String | ISO timestamp |

### `familyMembers[]` item shape

```json
{
  "name": "Sarah Chen",
  "nickname": "Sarah",
  "relationship": "daughter",
  "story": "Sarah visits every Sunday and brings groceries.",
  "isDeceased": false,
  "deceasedMessage": null,
  "photoUrl": "https://memodi-photos.s3.amazonaws.com/photos/..."
}
```

### Default preferences on register

```json
{
  "comfortPhrases": ["You are loved", "Everything is okay", "You are safe"],
  "avoidTopics": []
}
```

## `memodi-caregivers`

| Field | Type | Notes |
|-------|------|-------|
| `caregiverId` | String | PK, e.g. `caregiver-{uuid}` |
| `email` | String | GSI |
| `name` | String | Display name |
| `relationship` | String | e.g. `daughter` |
| `linkedPatientId` | String \| null | Set at register-with-code or `/caregiver/connect` |
| `createdAt` | String | ISO timestamp |

## `memodi-interactions`

| Field | Type | Notes |
|-------|------|-------|
| `interactionId` | String | PK (UUID) |
| `patientId` | String | GSI hash |
| `timestamp` | String | GSI range; ISO |
| `type` | String | `reactive` \| `distress` \| `proactive` |
| `patientSaid` | String | Transcript or empty for proactive |
| `memodiResponded` | String | Text response |
| `distressDetected` | Boolean | |
| `audioBase64` | String | Optional; not always stored |
| `activity` | String | Optional routine label |

Queried via `PatientIdIndex`, newest first (`ScanIndexForward: false`).

## `memodi-alerts`

| Field | Type | Notes |
|-------|------|-------|
| `alertId` | String | PK (UUID) |
| `patientId` | String | GSI hash |
| `timestamp` | String | GSI range |
| `caregiverId` | String | From patient at alert time |
| `trigger` | String | Distress reason |
| `patientSaid` | String | Transcript snippet |
| `resolved` | Boolean | |
| `resolvedAt` | String \| null | ISO when resolved |

## S3 objects (not DynamoDB)

| Bucket | Key pattern | Purpose |
|--------|-------------|---------|
| `memodi-photos` | `photos/{patientId}/{uuid}.jpg` | Family member photos |
| `memodi-photos` | `identify-input/{uuid}.jpg` | Temporary identify uploads |
| `memodi-voice-recordings` | `transcribe-input/{jobName}.webm` | STT input |

Buckets are created manually before deploy (not in Serverless). See [aws-infrastructure.md](aws-infrastructure.md).

## Memory records and vector index

DynamoDB is the source of truth for raw memories and structured patient data. The vector store or Bedrock Knowledge Base stores embedded representations of those memories for semantic search.

When a caregiver or family member adds a memory:

1. Store the raw memory text and metadata in DynamoDB.
2. Generate an embedding with Amazon Titan Embeddings.
3. Store the vector in the vector layer with a reference back to the DynamoDB memory record.
4. Retrieve relevant vectors at conversation time and pass the original memory text to Claude as context.

Recommended memory types:

| Type | Description | Entered by |
|------|-------------|------------|
| `location` | Where important objects are kept | Caregiver |
| `routine` | Daily schedules and habits | Caregiver |
| `personal_history` | Family, life events, relationships | Family / caregiver |
| `medical` | Medications, conditions, doctors | Caregiver / medical staff |
| `preference` | Food, music, hobbies, comfort items | Family / caregiver |
| `emergency_contact` | Who to call and where to go | Caregiver |

Vector entries should include enough metadata to filter by `patientId`, memory type, freshness, and caregiver/family source before the text is used in a Claude prompt.

## Rekognition

- Collection ID: `memodi-faces`
- Index on person upload: `ExternalImageId` = `{patientId}__{Person_Name}`
- Search threshold: 80% (`identifyPhoto`)

## Seed data example

Use for manual DynamoDB seeding or integration tests:

```json
{
  "patientId": "patient-margaret-chen-001",
  "name": "Margaret Chen",
  "nickname": "Margaret",
  "dateOfBirth": "1942-03-15",
  "timezone": "America/Chicago",
  "caregiverId": "caregiver-001",
  "familyMembers": [],
  "objects": [
    { "item": "glasses", "location": "bedside table" },
    { "item": "keys", "location": "hook by the front door" }
  ],
  "lifeHistory": [
    "Margaret was a schoolteacher for 35 years in Chicago",
    "She loves gardening and grew prize-winning roses"
  ],
  "medications": [
    { "name": "Aricept", "time": "8:00 AM", "location": "kitchen counter" }
  ],
  "upcomingEvents": [],
  "preferences": {
    "comfortPhrases": ["You are loved", "Everything is okay", "You are safe at home"],
    "avoidTopics": ["arguments", "financial stress"]
  },
  "routine": {
    "schedule": [
      {
        "time": "08:00",
        "activity": "Morning greeting",
        "message": "Good morning Margaret! It's a beautiful day. Your medication is on the kitchen counter."
      },
      {
        "time": "12:00",
        "activity": "Lunch reminder",
        "message": "Hi Margaret, it's lunchtime! Remember to eat something and take your afternoon medication."
      }
    ]
  }
}
```

## Sensitive field handling

`getPatient` strips before JSON response:

- `connectionCode`
- `connectionCodeExpiresAt`

All other fields are returned to any caller with the `patientId` (v1 has no backend auth enforcement; use client route guards).

## Related docs

- [auth-and-sessions.md](auth-and-sessions.md) — connection codes and linking
- [for-agents/api-reference.md](../for-agents/api-reference.md)
