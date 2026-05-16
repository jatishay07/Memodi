'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MemoryCard from '../../components/MemoryCard';
import { useAuth } from '../../lib/auth';
import { getPatient, uploadMemory } from '../../lib/api';

const CATEGORIES = [
  { key: 'people',      label: 'People',      icon: '👤' },
  { key: 'objects',     label: 'Objects',      icon: '🔑' },
  { key: 'history',     label: 'Life History', icon: '📖' },
  { key: 'medications', label: 'Medications',  icon: '💊' },
  { key: 'events',      label: 'Events',       icon: '📅' }
];

const RELATIONSHIPS = ['daughter', 'son', 'husband', 'wife', 'partner', 'sister', 'brother', 'friend', 'neighbor', 'caregiver', 'other'];

export default function FamilyPage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  const [tab, setTab] = useState('people');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);

  const [pName, setPName] = useState('');
  const [pNick, setPNick] = useState('');
  const [pRel, setPRel] = useState('daughter');
  const [pStory, setPStory] = useState('');
  const [pDeceased, setPDeceased] = useState(false);
  const [pDecMsg, setPDecMsg] = useState('');
  const [pPhoto, setPPhoto] = useState(null);

  const [oItem, setOItem] = useState('');
  const [oLoc, setOLoc] = useState('');

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

  async function savePerson() {
    if (!pName.trim()) return;
    setSaving(true);
    try {
      await uploadMemory(user.patientId, 'person', {
        name: pName.trim(), nickname: pNick.trim() || pName.split(' ')[0],
        relationship: pRel, story: pStory.trim(),
        isDeceased: pDeceased,
        deceasedMessage: pDeceased ? pDecMsg.trim() : null
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

  function renderContent() {
    if (!patient) return null;
    switch (tab) {
      case 'people':
        return (
          <>
            {(patient.familyMembers ?? []).map((p, i) => <MemoryCard key={i} type="person" data={p} />)}
            <AddButton label="Add Person" onClick={() => setModal('person')} />
          </>
        );
      case 'objects':
        return (
          <>
            {(patient.objects ?? []).map((o, i) => <MemoryCard key={i} type="object" data={o} />)}
            <AddButton label="Add Object" onClick={() => setModal('object')} />
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

  return (
    <div className="min-h-screen bg-navy">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-white text-2xl font-semibold">Memory Bank</h1>
          <p className="text-gray-400 text-sm mt-1">{patient?.name}</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setTab(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-colors ${
                tab === cat.key
                  ? 'border-amber text-amber bg-[#1C1408]'
                  : 'border-[#1F2937] text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">{renderContent()}</div>
        )}
      </div>

      {modal === 'person' && (
        <Modal title="Add a Person" onClose={() => { setModal(null); resetPerson(); }}>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <button
            onClick={() => photoInputRef.current?.click()}
            className="w-full border border-dashed border-[#374151] rounded-xl py-4 text-gray-400 text-sm hover:text-gray-200 transition-colors mb-4 flex items-center justify-center gap-2"
          >
            {pPhoto ? (
              <img src={`data:image/jpeg;base64,${pPhoto}`} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <><span className="text-xl">📷</span> Add Photo (optional)</>
            )}
          </button>

          <Input placeholder="Full name *" value={pName} onChange={e => setPName(e.target.value)} />
          <Input placeholder="Nickname" value={pNick} onChange={e => setPNick(e.target.value)} />

          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {RELATIONSHIPS.map(r => (
              <button
                key={r}
                onClick={() => setPRel(r)}
                className={`px-3 py-1.5 rounded-full border text-xs whitespace-nowrap transition-colors ${
                  pRel === r ? 'border-amber text-amber bg-[#1C1408]' : 'border-[#374151] text-gray-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <textarea
            className="w-full bg-[#1F2937] rounded-xl px-4 py-3 text-white text-sm resize-none outline-none placeholder-gray-500 mb-3"
            rows={3}
            placeholder="Their story — what should Mom know about this person?"
            value={pStory}
            onChange={e => setPStory(e.target.value)}
          />

          <label className="flex items-center justify-between mb-3 cursor-pointer">
            <span className="text-gray-300 text-sm">This person has passed away</span>
            <div
              onClick={() => setPDeceased(v => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative ${pDeceased ? 'bg-amber' : 'bg-[#374151]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${pDeceased ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>

          {pDeceased && (
            <textarea
              className="w-full bg-[#1F2937] rounded-xl px-4 py-3 text-white text-sm resize-none outline-none placeholder-gray-500 mb-3"
              rows={2}
              placeholder="Gentle message about their passing…"
              value={pDecMsg}
              onChange={e => setPDecMsg(e.target.value)}
            />
          )}

          <ModalActions
            onCancel={() => { setModal(null); resetPerson(); }}
            onSave={savePerson}
            disabled={!pName.trim() || saving}
            saving={saving}
          />
        </Modal>
      )}

      {modal === 'object' && (
        <Modal title="Add an Object" onClose={() => { setModal(null); setOItem(''); setOLoc(''); }}>
          <Input placeholder="What is it? (e.g. glasses, keys) *" value={oItem} onChange={e => setOItem(e.target.value)} />
          <Input placeholder="Where is it kept? *" value={oLoc} onChange={e => setOLoc(e.target.value)} />
          <ModalActions
            onCancel={() => { setModal(null); setOItem(''); setOLoc(''); }}
            onSave={saveObject}
            disabled={!oItem.trim() || !oLoc.trim() || saving}
            saving={saving}
          />
        </Modal>
      )}
    </div>
  );
}

function AddButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full border border-dashed border-[#374151] rounded-xl py-4 text-gray-400 text-sm hover:text-gray-200 transition-colors"
    >
      + {label}
    </button>
  );
}

function Input({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-[#1F2937] rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500 mb-3"
    />
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 px-0 md:px-4">
      <div className="bg-[#111827] w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave, disabled, saving }) {
  return (
    <div className="flex gap-3 mt-2">
      <button
        onClick={onCancel}
        className="flex-1 py-3 rounded-xl border border-[#374151] text-gray-400 text-sm hover:text-white transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        className="flex-1 py-3 rounded-xl bg-amber text-navy font-semibold text-sm disabled:opacity-40 hover:brightness-110 transition-all"
      >
        {saving ? '…' : 'Save'}
      </button>
    </div>
  );
}
