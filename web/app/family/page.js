'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MemoryCard from '../../components/MemoryCard';
import CaregiverNav from '../../components/CaregiverNav';
import CaregiverAmbient from '../../components/CaregiverAmbient';
import PatientNav from '../../components/PatientNav';
import Ambient from '../../components/Ambient';
import { useAuth } from '../../lib/auth';
import { getPatient, uploadMemory, deleteMemoryItem, editMemoryItem } from '../../lib/api';

const CATEGORIES = [
  { key: 'people',      label: 'People' },
  { key: 'objects',     label: 'Objects' },
  { key: 'history',     label: 'Life History' },
  { key: 'medications', label: 'Medications' },
  { key: 'events',      label: 'Events' },
];

const RELATIONSHIPS = ['daughter', 'son', 'husband', 'wife', 'partner', 'sister', 'brother', 'friend', 'neighbor', 'caregiver', 'other'];

// Map tab key → DynamoDB field name
const FIELD_MAP = {
  people:      'familyMembers',
  objects:     'objects',
  history:     'lifeHistory',
  medications: 'medications',
  events:      'upcomingEvents',
};

const TYPE_MAP = {
  people:      'person',
  objects:     'object',
  history:     'lifeHistory',
  medications: 'medication',
  events:      'event',
};

export default function FamilyPage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const [tab, setTab] = useState('people');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Caregiver modal state
  const [modal, setModal] = useState(null);

  // Patient modal state: null | 'person' | 'object' | 'history' | 'medication' | 'event'
  const [patModal, setPatModal] = useState(null);
  const [patEditing, setPatEditing] = useState(null); // { field, index, item }

  // Shared person fields (used by both caregiver + patient person modal)
  const [pName, setPName] = useState('');
  const [pNick, setPNick] = useState('');
  const [pRel, setPRel] = useState('daughter');
  const [pStory, setPStory] = useState('');
  const [pDeceased, setPDeceased] = useState(false);
  const [pDecMsg, setPDecMsg] = useState('');
  const [pPhoto, setPPhoto] = useState(null);

  // Shared object fields
  const [oItem, setOItem] = useState('');
  const [oLoc, setOLoc] = useState('');

  // Patient-only fields
  const [hText, setHText] = useState('');
  const [mName, setMName] = useState('');
  const [mTime, setMTime] = useState('');
  const [mLoc, setMLoc] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evDate, setEvDate] = useState('');

  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace('/auth/caregiver'); return; }
    fetchPatient();
  }, [ready, user]);

  async function fetchPatient() {
    const empty = { familyMembers: [], objects: [], lifeHistory: [], medications: [], upcomingEvents: [] };
    try {
      const p = await getPatient(user.patientId);
      setPatient((p && typeof p === 'object' && !Array.isArray(p)) ? p : empty);
    } catch { setPatient(empty); }
    finally { setLoading(false); }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPPhoto(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  }

  function resetPerson() {
    setPName(''); setPNick(''); setPRel('daughter'); setPStory('');
    setPDeceased(false); setPDecMsg(''); setPPhoto(null);
  }

  // ── Caregiver save functions ──

  async function savePerson() {
    if (!pName.trim()) return;
    setSaving(true);
    try {
      await uploadMemory(user.patientId, 'person', {
        name: pName.trim(), nickname: pNick.trim() || pName.split(' ')[0],
        relationship: pRel, story: pStory.trim(),
        isDeceased: pDeceased, deceasedMessage: pDeceased ? pDecMsg.trim() : null
      }, pPhoto);
      await fetchPatient();
      setModal(null); resetPerson();
    } finally { setSaving(false); }
  }

  async function saveObject() {
    if (!oItem.trim() || !oLoc.trim()) return;
    setSaving(true);
    try {
      await uploadMemory(user.patientId, 'object', { item: oItem.trim(), location: oLoc.trim() });
      await fetchPatient();
      setModal(null); setOItem(''); setOLoc('');
    } finally { setSaving(false); }
  }

  // ── Patient CRUD ──

  function patStartEdit(field, index, item) {
    setPatEditing({ field, index, item });
    if (field === 'familyMembers') {
      setPName(item.name || ''); setPNick(item.nickname || ''); setPRel(item.relationship || 'daughter');
      setPStory(item.story || ''); setPDeceased(item.isDeceased || false); setPDecMsg(item.deceasedMessage || '');
      setPatModal('person');
    } else if (field === 'objects') {
      setOItem(item.item || ''); setOLoc(item.location || '');
      setPatModal('object');
    } else if (field === 'lifeHistory') {
      setHText(typeof item === 'string' ? item : (item.fact || ''));
      setPatModal('history');
    } else if (field === 'medications') {
      setMName(item.name || ''); setMTime(item.time || ''); setMLoc(item.location || '');
      setPatModal('medication');
    } else if (field === 'upcomingEvents') {
      setEvDesc(item.description || ''); setEvDate(item.date || '');
      setPatModal('event');
    }
  }

  function patCloseModal() {
    setPatModal(null); setPatEditing(null);
    resetPerson(); setOItem(''); setOLoc('');
    setHText(''); setMName(''); setMTime(''); setMLoc('');
    setEvDesc(''); setEvDate('');
  }

  async function patSavePerson() {
    if (!pName.trim()) return;
    setSaving(true);
    try {
      if (patEditing) {
        const updated = {
          name: pName.trim(), nickname: pNick.trim() || pName.split(' ')[0],
          relationship: pRel, story: pStory.trim(),
          isDeceased: pDeceased, deceasedMessage: pDeceased ? pDecMsg.trim() : null,
          photoUrl: patEditing.item.photoUrl || null,
        };
        await editMemoryItem(user.patientId, 'familyMembers', patEditing.index, updated);
      } else {
        await uploadMemory(user.patientId, 'person', {
          name: pName.trim(), nickname: pNick.trim() || pName.split(' ')[0],
          relationship: pRel, story: pStory.trim(),
          isDeceased: pDeceased, deceasedMessage: pDeceased ? pDecMsg.trim() : null,
        }, pPhoto);
      }
      await fetchPatient();
      patCloseModal();
    } finally { setSaving(false); }
  }

  async function patSaveObject() {
    if (!oItem.trim() || !oLoc.trim()) return;
    setSaving(true);
    try {
      if (patEditing) {
        await editMemoryItem(user.patientId, 'objects', patEditing.index, { item: oItem.trim(), location: oLoc.trim() });
      } else {
        await uploadMemory(user.patientId, 'object', { item: oItem.trim(), location: oLoc.trim() });
      }
      await fetchPatient();
      patCloseModal();
    } finally { setSaving(false); }
  }

  async function patSaveHistory() {
    if (!hText.trim()) return;
    setSaving(true);
    try {
      if (patEditing) {
        await editMemoryItem(user.patientId, 'lifeHistory', patEditing.index, hText.trim());
      } else {
        await uploadMemory(user.patientId, 'lifeHistory', { fact: hText.trim() });
      }
      await fetchPatient();
      patCloseModal();
    } finally { setSaving(false); }
  }

  async function patSaveMedication() {
    if (!mName.trim()) return;
    setSaving(true);
    try {
      const med = { name: mName.trim(), time: mTime.trim(), location: mLoc.trim() };
      if (patEditing) {
        await editMemoryItem(user.patientId, 'medications', patEditing.index, med);
      } else {
        await uploadMemory(user.patientId, 'medication', med);
      }
      await fetchPatient();
      patCloseModal();
    } finally { setSaving(false); }
  }

  async function patSaveEvent() {
    if (!evDesc.trim()) return;
    setSaving(true);
    try {
      const ev = { description: evDesc.trim(), date: evDate.trim() };
      if (patEditing) {
        await editMemoryItem(user.patientId, 'upcomingEvents', patEditing.index, ev);
      } else {
        await uploadMemory(user.patientId, 'event', ev);
      }
      await fetchPatient();
      patCloseModal();
    } finally { setSaving(false); }
  }

  async function patDelete(field, index) {
    if (!confirm('Remove this memory?')) return;
    setSaving(true);
    try {
      await deleteMemoryItem(user.patientId, field, index);
      await fetchPatient();
    } finally { setSaving(false); }
  }

  function renderPatientContent() {
    if (!patient) return null;
    const field = FIELD_MAP[tab];
    const cardType = TYPE_MAP[tab];
    const modalType = tab === 'people' ? 'person' : tab === 'history' ? 'history' : tab === 'events' ? 'event' : tab === 'medications' ? 'medication' : 'object';
    const items = patient[field] ?? [];
    const addLabel = CATEGORIES.find(c => c.key === tab)?.label ?? tab;

    return (
      <>
        {items.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 18, color: '#9C9C9C', margin: 0 }}>Nothing here yet — add your first memory.</p>
          </div>
        )}
        {items.map((item, i) => (
          <MemoryCard
            key={i}
            type={cardType}
            data={item}
            onEdit={() => patStartEdit(field, i, item)}
            onDelete={() => patDelete(field, i)}
          />
        ))}
        <PinkAddButton label={`Add ${addLabel.toLowerCase()}`} onClick={() => setPatModal(modalType)} />
      </>
    );
  }

  function renderCaregiverContent() {
    if (!patient) return null;
    switch (tab) {
      case 'people':
        return (
          <>
            {(patient.familyMembers ?? []).map((p, i) => <MemoryCard key={i} type="person" data={p} />)}
            <AddButton label="Add person" onClick={() => setModal('person')} />
          </>
        );
      case 'objects':
        return (
          <>
            {(patient.objects ?? []).map((o, i) => <MemoryCard key={i} type="object" data={o} />)}
            <AddButton label="Add object" onClick={() => setModal('object')} />
          </>
        );
      case 'history':
        return (patient.lifeHistory ?? []).map((f, i) => <MemoryCard key={i} type="lifeHistory" data={f} />);
      case 'medications':
        return (patient.medications ?? []).map((m, i) => <MemoryCard key={i} type="medication" data={m} />);
      case 'events':
        return (patient.upcomingEvents ?? []).map((e, i) => <MemoryCard key={i} type="event" data={e} />);
      default: return null;
    }
  }

  if (!ready) return null;

  const isPatient = user?.role === 'patient';

  /* ── Patient: editable Memory Lane ── */
  if (isPatient) {
    const isEditing = patEditing !== null;
    return (
      <div style={{
        position: 'relative', minHeight: '100vh', overflow: 'hidden', paddingBottom: 64,
        background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 40%, rgba(252,233,171,0.10) 100%)',
      }}>
        <Ambient particleCount={8} />
        <PatientNav onSignOut={logout} />

        <div style={{ position: 'relative', zIndex: 1, padding: '120px 40px 0', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 52, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>
              Memory Lane
            </h1>
            <p style={{ fontSize: 18, color: '#6B6B6B', margin: '8px 0 0' }}>
              {patient?.name ? `${patient.name}'s cherished memories` : 'Your cherished memories'}
            </p>
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 28 }}>
            {CATEGORIES.map(cat => {
              const active = tab === cat.key;
              return (
                <button key={cat.key} onClick={() => setTab(cat.key)} style={{
                  padding: '10px 22px', borderRadius: 999, border: 'none',
                  background: active ? '#DC4F7C' : 'rgba(255,255,255,0.65)',
                  color: active ? '#fff' : '#6B6B6B',
                  fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  boxShadow: active ? '0 8px 20px rgba(220,79,124,0.26)' : '0 2px 8px rgba(45,45,45,0.06)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all .2s ease',
                }}>
                  {cat.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '3px solid rgba(220,79,124,0.25)', borderTopColor: '#DC4F7C',
                animation: 'orbSpin .8s linear infinite',
              }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {renderPatientContent()}
            </div>
          )}
        </div>

        {/* ── Patient Modals ── */}

        {/* Person modal */}
        {patModal === 'person' && (
          <PinkModal title={isEditing ? 'Edit person' : 'Add a person'} onClose={patCloseModal}>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            {!isEditing && (
              <button
                onClick={() => photoInputRef.current?.click()}
                style={{
                  width: '100%', borderRadius: 20, padding: '18px',
                  border: '2px dashed rgba(220,79,124,0.35)',
                  background: 'rgba(220,79,124,0.05)',
                  color: '#DC4F7C', fontSize: 15, cursor: 'pointer',
                  marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#DC4F7C'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,79,124,0.35)'; }}
              >
                {pPhoto
                  ? <img src={`data:image/jpeg;base64,${pPhoto}`} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
                  : <><span style={{ fontSize: 20 }}>⊕</span> Add photo (optional)</>
                }
              </button>
            )}
            <PinkInput placeholder="Full name" value={pName} onChange={e => setPName(e.target.value)} />
            <PinkInput placeholder="Nickname" value={pNick} onChange={e => setPNick(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {RELATIONSHIPS.map(r => (
                <button key={r} onClick={() => setPRel(r)} style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 13,
                  border: `2px solid ${pRel === r ? '#DC4F7C' : 'rgba(255,255,255,0.85)'}`,
                  background: pRel === r ? 'rgba(220,79,124,0.12)' : 'rgba(255,255,255,0.65)',
                  color: pRel === r ? '#DC4F7C' : '#6B6B6B',
                  cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-sans)',
                }}>
                  {r}
                </button>
              ))}
            </div>
            <textarea
              rows={3} placeholder="Their story — what do you want to remember about this person?"
              value={pStory} onChange={e => setPStory(e.target.value)}
              style={{ ...pinkInputStyle, minHeight: 80, resize: 'vertical', marginBottom: 16 }}
            />
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, cursor: 'pointer' }}>
              <span style={{ fontSize: 16, color: '#2D2D2D' }}>This person has passed away</span>
              <div
                onClick={() => setPDeceased(v => !v)}
                style={{
                  width: 44, height: 24, borderRadius: 999, position: 'relative',
                  background: pDeceased ? '#DC4F7C' : 'rgba(0,0,0,0.12)',
                  transition: 'background .2s ease',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  transform: pDeceased ? 'translateX(23px)' : 'translateX(3px)',
                  transition: 'transform .2s ease',
                }} />
              </div>
            </label>
            {pDeceased && (
              <textarea
                rows={2} placeholder="Gentle message about their passing…"
                value={pDecMsg} onChange={e => setPDecMsg(e.target.value)}
                style={{ ...pinkInputStyle, resize: 'vertical', marginBottom: 16 }}
              />
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={patCloseModal} style={pinkGhostBtn}>Cancel</button>
              <button
                onClick={patSavePerson}
                disabled={!pName.trim() || saving}
                style={{ ...pinkSolidBtn, opacity: (!pName.trim() || saving) ? 0.45 : 1 }}
              >
                {saving ? '…' : isEditing ? 'Save changes' : 'Save memory'}
              </button>
            </div>
          </PinkModal>
        )}

        {/* Object modal */}
        {patModal === 'object' && (
          <PinkModal title={isEditing ? 'Edit object' : 'Add an object'} onClose={patCloseModal}>
            <PinkInput placeholder="What is it? (e.g. glasses, keys)" value={oItem} onChange={e => setOItem(e.target.value)} />
            <PinkInput placeholder="Where is it kept?" value={oLoc} onChange={e => setOLoc(e.target.value)} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={patCloseModal} style={pinkGhostBtn}>Cancel</button>
              <button
                onClick={patSaveObject}
                disabled={!oItem.trim() || !oLoc.trim() || saving}
                style={{ ...pinkSolidBtn, opacity: (!oItem.trim() || !oLoc.trim() || saving) ? 0.45 : 1 }}
              >
                {saving ? '…' : isEditing ? 'Save changes' : 'Save memory'}
              </button>
            </div>
          </PinkModal>
        )}

        {/* Life history modal */}
        {patModal === 'history' && (
          <PinkModal title={isEditing ? 'Edit memory' : 'Add a memory'} onClose={patCloseModal}>
            <textarea
              rows={4} placeholder="Share something meaningful — a story, a place, a moment you treasure…"
              value={hText} onChange={e => setHText(e.target.value)}
              style={{ ...pinkInputStyle, minHeight: 100, resize: 'vertical', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={patCloseModal} style={pinkGhostBtn}>Cancel</button>
              <button
                onClick={patSaveHistory}
                disabled={!hText.trim() || saving}
                style={{ ...pinkSolidBtn, opacity: (!hText.trim() || saving) ? 0.45 : 1 }}
              >
                {saving ? '…' : isEditing ? 'Save changes' : 'Save memory'}
              </button>
            </div>
          </PinkModal>
        )}

        {/* Medication modal */}
        {patModal === 'medication' && (
          <PinkModal title={isEditing ? 'Edit medication' : 'Add a medication'} onClose={patCloseModal}>
            <PinkInput placeholder="Medication name" value={mName} onChange={e => setMName(e.target.value)} />
            <PinkInput placeholder="When do you take it? (e.g. morning)" value={mTime} onChange={e => setMTime(e.target.value)} />
            <PinkInput placeholder="Where is it kept?" value={mLoc} onChange={e => setMLoc(e.target.value)} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={patCloseModal} style={pinkGhostBtn}>Cancel</button>
              <button
                onClick={patSaveMedication}
                disabled={!mName.trim() || saving}
                style={{ ...pinkSolidBtn, opacity: (!mName.trim() || saving) ? 0.45 : 1 }}
              >
                {saving ? '…' : isEditing ? 'Save changes' : 'Save memory'}
              </button>
            </div>
          </PinkModal>
        )}

        {/* Event modal */}
        {patModal === 'event' && (
          <PinkModal title={isEditing ? 'Edit event' : 'Add an event'} onClose={patCloseModal}>
            <PinkInput placeholder="What's happening?" value={evDesc} onChange={e => setEvDesc(e.target.value)} />
            <PinkInput placeholder="When? (e.g. Saturday, June 7)" value={evDate} onChange={e => setEvDate(e.target.value)} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={patCloseModal} style={pinkGhostBtn}>Cancel</button>
              <button
                onClick={patSaveEvent}
                disabled={!evDesc.trim() || saving}
                style={{ ...pinkSolidBtn, opacity: (!evDesc.trim() || saving) ? 0.45 : 1 }}
              >
                {saving ? '…' : isEditing ? 'Save changes' : 'Save memory'}
              </button>
            </div>
          </PinkModal>
        )}
      </div>
    );
  }

  /* ── Caregiver: full editable Memory Base ── */
  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: 64 }}>
      <CaregiverAmbient />
      <CaregiverNav onSignOut={logout} />

      <div style={{ position: 'relative', zIndex: 1, padding: '120px 40px 0', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 52, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>
              Memory Base
            </h1>
            <p style={{ fontSize: 18, color: '#6B6B6B', margin: '8px 0 0' }}>
              {patient?.name ? `Manage and organize cherished memories for ${patient.name}` : 'Manage and organize cherished memories'}
            </p>
          </div>
          <button
            onClick={() => setModal('person')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 26px', borderRadius: 999, border: 0,
              background: '#FC8A2D', color: '#fff',
              fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 10px 26px rgba(252,138,45,0.28)', whiteSpace: 'nowrap',
            }}
          >
            + Add memory
          </button>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 28 }}>
          {CATEGORIES.map(cat => {
            const active = tab === cat.key;
            return (
              <button key={cat.key} onClick={() => setTab(cat.key)} style={{
                padding: '10px 22px', borderRadius: 999, border: 'none',
                background: active ? '#FC8A2D' : 'rgba(255,255,255,0.65)',
                color: active ? '#fff' : '#6B6B6B',
                fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: active ? '0 8px 20px rgba(252,138,45,0.26)' : '0 2px 8px rgba(45,45,45,0.06)',
                backdropFilter: 'blur(10px)',
                transition: 'all .2s ease',
              }}>
                {cat.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid rgba(252,138,45,0.25)', borderTopColor: '#FC8A2D',
              animation: 'orbSpin .8s linear infinite',
            }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {renderCaregiverContent()}
          </div>
        )}
      </div>

      {/* Add Person Modal */}
      {modal === 'person' && (
        <MemoryModal title="Add a person" onClose={() => { setModal(null); resetPerson(); }}>
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          <button
            onClick={() => photoInputRef.current?.click()}
            style={{
              width: '100%', borderRadius: 20, padding: '18px',
              border: '2px dashed rgba(252,138,45,0.35)',
              background: 'rgba(252,138,45,0.05)',
              color: '#FC8A2D', fontSize: 15, cursor: 'pointer',
              marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              transition: 'border-color .25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FC8A2D'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(252,138,45,0.35)'; }}
          >
            {pPhoto
              ? <img src={`data:image/jpeg;base64,${pPhoto}`} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
              : <><span style={{ fontSize: 20 }}>⊕</span> Add photo (optional)</>
            }
          </button>

          <WarmInput placeholder="Full name" value={pName} onChange={e => setPName(e.target.value)} />
          <WarmInput placeholder="Nickname" value={pNick} onChange={e => setPNick(e.target.value)} />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {RELATIONSHIPS.map(r => (
              <button key={r} onClick={() => setPRel(r)} style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 13,
                border: `2px solid ${pRel === r ? '#FC8A2D' : 'rgba(255,255,255,0.85)'}`,
                background: pRel === r ? 'rgba(252,138,45,0.12)' : 'rgba(255,255,255,0.65)',
                color: pRel === r ? '#FC8A2D' : '#6B6B6B',
                cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-sans)',
              }}>
                {r}
              </button>
            ))}
          </div>

          <textarea
            rows={3} placeholder="Their story — what should the patient know about this person?"
            value={pStory} onChange={e => setPStory(e.target.value)}
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical', marginBottom: 16 }}
          />

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, cursor: 'pointer' }}>
            <span style={{ fontSize: 16, color: '#2D2D2D' }}>This person has passed away</span>
            <div
              onClick={() => setPDeceased(v => !v)}
              style={{
                width: 44, height: 24, borderRadius: 999, position: 'relative',
                background: pDeceased ? '#FC8A2D' : 'rgba(0,0,0,0.12)',
                transition: 'background .2s ease',
              }}
            >
              <div style={{
                position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                transform: pDeceased ? 'translateX(23px)' : 'translateX(3px)',
                transition: 'transform .2s ease',
              }} />
            </div>
          </label>

          {pDeceased && (
            <textarea
              rows={2} placeholder="Gentle message about their passing…"
              value={pDecMsg} onChange={e => setPDecMsg(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: 16 }}
            />
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setModal(null); resetPerson(); }} style={ghostBtn}>Cancel</button>
            <button
              onClick={savePerson}
              disabled={!pName.trim() || saving}
              style={{ ...solidBtn, opacity: (!pName.trim() || saving) ? 0.45 : 1 }}
            >
              {saving ? '…' : 'Save memory'}
            </button>
          </div>
        </MemoryModal>
      )}

      {/* Add Object Modal */}
      {modal === 'object' && (
        <MemoryModal title="Add an object" onClose={() => { setModal(null); setOItem(''); setOLoc(''); }}>
          <WarmInput placeholder="What is it? (e.g. glasses, keys)" value={oItem} onChange={e => setOItem(e.target.value)} />
          <WarmInput placeholder="Where is it kept?" value={oLoc} onChange={e => setOLoc(e.target.value)} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setModal(null); setOItem(''); setOLoc(''); }} style={ghostBtn}>Cancel</button>
            <button
              onClick={saveObject}
              disabled={!oItem.trim() || !oLoc.trim() || saving}
              style={{ ...solidBtn, opacity: (!oItem.trim() || !oLoc.trim() || saving) ? 0.45 : 1 }}
            >
              {saving ? '…' : 'Save memory'}
            </button>
          </div>
        </MemoryModal>
      )}
    </div>
  );
}

// ── Shared styles ──

const inputStyle = {
  width: '100%', padding: '13px 20px', borderRadius: 20,
  background: '#FFF9F0', border: '2px solid rgba(255,255,255,0.90)',
  fontFamily: 'var(--font-sans)', fontSize: 16, color: '#2D2D2D',
  outline: 'none', boxSizing: 'border-box', marginBottom: 12,
};

const pinkInputStyle = {
  ...inputStyle,
};

const ghostBtn = {
  flex: 1, padding: '13px 20px', borderRadius: 999,
  border: '2px solid rgba(255,255,255,0.85)',
  background: 'rgba(255,255,255,0.70)',
  color: '#6B6B6B', fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 500,
  cursor: 'pointer',
};

const solidBtn = {
  flex: 1, padding: '13px 20px', borderRadius: 999, border: 0,
  background: '#FC8A2D', color: '#fff',
  fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
  cursor: 'pointer', boxShadow: '0 10px 28px rgba(252,138,45,0.30)',
};

const pinkGhostBtn = {
  ...ghostBtn,
};

const pinkSolidBtn = {
  flex: 1, padding: '13px 20px', borderRadius: 999, border: 0,
  background: '#DC4F7C', color: '#fff',
  fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
  cursor: 'pointer', boxShadow: '0 10px 28px rgba(220,79,124,0.30)',
};

// ── Sub-components ──

function WarmInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={inputStyle}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(252,138,45,0.45)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.90)'; }}
    />
  );
}

function PinkInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={pinkInputStyle}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(220,79,124,0.45)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.90)'; }}
    />
  );
}

function MemoryModal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, animation: 'fadeIn .35s ease',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
          borderRadius: 32, background: 'rgba(255,255,255,0.96)',
          border: '2px solid #fff', boxShadow: '0 32px 80px rgba(45,45,45,0.25)',
          padding: '44px 44px 40px', position: 'relative',
          animation: 'slideUpBounce .45s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20, width: 40, height: 40,
          borderRadius: 999, background: 'rgba(255,255,255,0.9)', border: 0,
          cursor: 'pointer', fontSize: 18, color: '#6B6B6B',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(45,45,45,0.06)',
        }}>
          ×
        </button>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400,
          margin: '0 0 28px', color: '#2D2D2D', letterSpacing: '-0.01em',
        }}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

function PinkModal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, animation: 'fadeIn .35s ease',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
          borderRadius: 32, background: 'rgba(255,255,255,0.96)',
          border: '2px solid rgba(220,79,124,0.15)',
          boxShadow: '0 32px 80px rgba(220,79,124,0.18)',
          padding: '44px 44px 40px', position: 'relative',
          animation: 'slideUpBounce .45s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20, width: 40, height: 40,
          borderRadius: 999, background: 'rgba(220,79,124,0.08)', border: 0,
          cursor: 'pointer', fontSize: 18, color: '#DC4F7C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          ×
        </button>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400,
          margin: '0 0 28px', color: '#2D2D2D', letterSpacing: '-0.01em',
        }}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

function AddButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '18px', borderRadius: 20,
      border: '2px dashed rgba(252,138,45,0.30)',
      background: 'rgba(252,138,45,0.04)',
      color: '#FC8A2D', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
      cursor: 'pointer', marginBottom: 12,
      transition: 'border-color .25s, background .25s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#FC8A2D'; e.currentTarget.style.background = 'rgba(252,138,45,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(252,138,45,0.30)'; e.currentTarget.style.background = 'rgba(252,138,45,0.04)'; }}
    >
      + {label}
    </button>
  );
}

function PinkAddButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '18px', borderRadius: 20,
      border: '2px dashed rgba(220,79,124,0.30)',
      background: 'rgba(220,79,124,0.04)',
      color: '#DC4F7C', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
      cursor: 'pointer', marginTop: 4, marginBottom: 12,
      transition: 'border-color .25s, background .25s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#DC4F7C'; e.currentTarget.style.background = 'rgba(220,79,124,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,79,124,0.30)'; e.currentTarget.style.background = 'rgba(220,79,124,0.04)'; }}
    >
      + {label}
    </button>
  );
}
