import { NextResponse } from 'next/server';
import { getDevStore, stripPatientSecrets } from '../../../../lib/dev-store';

export async function GET(_request, { params }) {
  const patient = getDevStore().patientsById.get(params.patientId);
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }
  return NextResponse.json(stripPatientSecrets(patient));
}
