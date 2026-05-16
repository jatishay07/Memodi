/** In-memory store for local dev API (no AWS). */

const globalForDev = globalThis;

function store() {
  if (!globalForDev.__memodiDevStore) {
    globalForDev.__memodiDevStore = {
      patientsById: new Map(),
      patientsByEmail: new Map(),
    };
    seedDemoPatient(globalForDev.__memodiDevStore);
  }
  return globalForDev.__memodiDevStore;
}

function seedDemoPatient(s) {
  const patient = {
    patientId: 'patient-demo',
    email: 'demo@memodi.local',
    password: 'demo',
    connectionCode: 'DEMO1234',
    name: 'Alex Morgan',
    nickname: 'Alex',
    dateOfBirth: '1945-06-15',
    timezone: 'America/New_York',
    caregiverId: null,
    familyMembers: [
      {
        name: 'Sarah',
        relationship: 'daughter',
        story: 'Sarah visits every Sunday and brings tea.',
        isDeceased: false,
      },
    ],
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
  s.patientsById.set(patient.patientId, patient);
  s.patientsByEmail.set(patient.email, patient);
}

export function getDevStore() {
  return store();
}

export function generateConnectionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function stripPatientSecrets(patient) {
  const { password, hashedPassword, connectionCode, ...safe } = patient;
  return safe;
}
