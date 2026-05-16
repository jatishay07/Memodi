import { NextResponse } from 'next/server';
import { getDevStore } from '../../../lib/dev-store';

export async function POST(request) {
  const { patientId, clientTts } = await request.json();

  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
  }

  const patient = getDevStore().patientsById.get(patientId);
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  const name = patient.nickname || patient.name.split(' ')[0];
  const response = `Hello ${name}. I'm Memodi. You are safe, and you are loved. I'm right here with you.`;

  return NextResponse.json({
    transcribedText: 'Hello Memodi',
    response,
    audioResponse: clientTts ? null : undefined,
    isDistressed: false,
    distressSeverity: 'low',
  });
}
