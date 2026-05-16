import { NextResponse } from 'next/server';
import { getDevStore } from '../../../../../lib/dev-store';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  const patient = getDevStore().patientsByEmail.get(email);
  if (!patient || patient.password !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  return NextResponse.json({
    token: `dev-${patient.patientId}`,
    patientId: patient.patientId,
    role: 'patient',
    name: patient.name,
  });
}
