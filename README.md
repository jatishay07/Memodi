# Memodi

Memodi is a voice-first memory companion for people living with dementia. It helps patients ask questions, hear calm personalized answers, and stay connected to context from their own life, while caregivers manage memories, routines, alerts, and interaction history.

> Prototype only. Memodi is not HIPAA-compliant and is not a certified medical product.

## What Memodi does

Memodi gives patients a simple companion interface where they can speak or type questions like:

- “Where are my glasses?”
- “Who is Sarah?”
- “What am I supposed to do today?”
- “I feel scared.”

The app responds with short, warm answers grounded in the patient’s Memory Bank instead of acting like a generic chatbot.

Caregivers can:

- create and manage patient memory records
- add people, objects, medications, routines, preferences, and life history
- review conversation history
- receive distress alerts
- connect to a patient using a temporary connection code
- help the patient identify people from photos

## Core features

### Patient companion

The patient interface is built around a calm voice-first experience. A patient can tap the orb, speak naturally, and receive a spoken response. The app can also accept text input.

### Memory Bank

Caregivers can add structured memories, including:

- family members and relationships
- important objects and where they are kept
- medications
- daily routines
- life history
- upcoming events
- comfort phrases and preferences

These memories are used as context when Memodi answers patient questions.

### Caregiver dashboard

The caregiver dashboard shows alerts, patient activity, and interaction history so caregivers can understand when the patient may be confused, distressed, or repeatedly asking for help.

### Distress detection

Memodi checks patient messages for distress signals. If distress is detected, it can create an alert and notify caregivers through SNS.

### Photo identification

Caregivers can upload photos for family members. The patient can later use photo identification to help recognize a person and hear their story.

### Proactive routine messages

A scheduled backend job checks patient routines and can generate proactive reminders based on the patient’s timezone.

### Local voice and emotion services

Memodi can run local companion services for:

- Piper TTS for spoken audio output
- DeepFace emotion detection
- object tracking experiments

## Tech stack

### Frontend

- Next.js 16
- React 18
- Tailwind CSS
- Lucide React
- OGL / WebGL visual effects
- Browser microphone and speech APIs

### Backend

- Node.js 18
- AWS Lambda
- API Gateway HTTP API
- Serverless Framework 3
- ES modules

### AWS services

- Amazon Cognito for auth
- DynamoDB for patients, caregivers, alerts, and interactions
- S3 for photos and temporary voice recordings
- Amazon Bedrock for AI response generation
- Amazon Titan Embeddings for memory retrieval
- Amazon Transcribe for speech-to-text
- Amazon Rekognition for face matching
- SNS for caregiver alerts
- EventBridge for scheduled routine checks

### Local services

- Piper TTS on port `59125`
- DeepFace emotion service on port `59126`
- Object tracker service on port `59127`

## Project structure

```txt
Memodi/
├── web/                  # Next.js frontend
│   ├── app/              # App Router pages
│   ├── components/       # UI components
│   └── lib/              # API, auth, audio, emotion, recall helpers
├── lambda/               # AWS Lambda handlers
│   ├── processVoiceInput/
│   ├── uploadMemory/
│   ├── identifyPhoto/
│   ├── getAlerts/
│   ├── getInteractions/
│   └── shared/
├── services/             # Local Python/edge services
│   ├── piper-tts/
│   ├── deepface-emotion/
│   └── object-tracker/
├── scripts/              # Local dev scripts
├── docs/                 # Architecture and product docs
├── serverless.yml        # AWS infrastructure and Lambda routes
└── package.json          # Root backend/dev scripts
