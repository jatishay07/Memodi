# Product Vision

## What is Memodi?

Memodi is a **voice-first memory companion** for people living with dementia. It holds warm, AI-guided conversations grounded in each patient’s personal context: family, objects, routines, medications, and life history. Caregivers use a dashboard to monitor distress alerts and review interactions, and they maintain a **Memory Bank** of facts the companion can reference.

> Memodi is a prototype built for demonstration purposes and is not HIPAA-compliant.

Memodi is not a medical device or a certified health product in its current form.

## Who it is for

| User | Need |
|------|------|
| **Patient** | Simple, calming voice interface; recognition; comfort without complexity |
| **Caregiver** | Distress visibility; Memory Bank management for their linked patient |

**v1 roles:** `patient` and `caregiver` only. A separate **family member** login (Memory Bank without full dashboard) is planned for later.

## Problem

People with dementia often experience confusion, anxiety, and repetition. Generic voice assistants lack personal context and can frustrate or mislead. Families need lightweight signal when something is wrong—not another complex clinical system.

## Product principles

1. **Voice first** — Speak and listen; text is secondary.
2. **Memory grounded** — Only use caregiver-entered facts.
3. **Warm and brief** — Short sentences; no arguing or correcting.
4. **Calm visual design** — Warm cream palette, WebGL orb, minimal chrome.
5. **Caregiver in the loop** — Distress alerts; Memory Bank for accuracy.
6. **Simple onboarding** — Patient verifies email → generates share link → caregiver registers with code.

## Core capabilities (v1)

| Capability | Description |
|------------|-------------|
| Voice companion | Mic → browser STT → Bedrock Agent → Piper voice + caption |
| Live emotions (local) | Webcam distress tint on orb (no cloud upload) |
| Linking | 6-digit codes + `/connect` deep link |
| Memory Bank | Caregivers add, edit, and delete people, objects, history, meds, events |
| Photo identify | Face match + spoken description |
| Distress detection | Alerts + SNS |
| Proactive routine | Scheduled messages per timezone |
| Auth | Cognito email/password; ephemeral connection codes |

## Access model (v1)

| Route | Who |
|-------|-----|
| `/patient` | Patient |
| `/family` | Caregiver only |
| `/caregiver` | Caregiver |

## Security posture (v1)

- **Client-only** route protection and session in `localStorage`
- APIs do not verify JWT yet — post-hackathon hardening
- Single caregiver per patient

## Non-goals (hackathon / v1)

- HIPAA compliance
- Staging/prod AWS environments
- Multiple caregivers per patient
- Native mobile apps
- Multi-language
- Backend JWT enforcement (deferred)

## Related docs

- [user-journeys.md](user-journeys.md)
- [design-system.md](design-system.md)
- [../decisions/OPEN_QUESTIONS.md](../decisions/OPEN_QUESTIONS.md)
