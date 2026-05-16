import { NextResponse } from 'next/server';
import { generateConnectionCode, getDevStore } from '../../../../../lib/dev-store';

export async function POST(request) {
  const body = await request.json();
  const { email, password, name, dateOfBirth, timezone } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'email, password, and name are required' }, { status: 400 });
  }

  const s = getDevStore();
  if (s.patientsByEmail.has(email)) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const patientId = `patient-${crypto.randomUUID()}`;
  const connectionCode = generateConnectionCode();
  const patient = {
    patientId,
    email,
    password,
    connectionCode,
    name,
    nickname: name.split(' ')[0],
    dateOfBirth: dateOfBirth || '',
    timezone: timezone || 'America/New_York',
    caregiverId: null,
    familyMembers: [],
    objects: [],
    lifeHistory: [],
    medications: [],
    upcomingEvents: [],
    preferences: {
      comfortPhrases: ['You are loved', 'Everything is okay', 'You are safe'],
      avoidTopics: [],
    },
    routine: { schedule: [] },
    createdAt: new Date().toISOString(),
  };

  s.patientsById.set(patientId, patient);
  s.patientsByEmail.set(email, patient);

  return NextResponse.json(
    {
      token: `dev-${patientId}`,
      connectionCode,
      patientId,
      role: 'patient',
      name: patient.name,
    },
    { status: 201 },
  );
}
