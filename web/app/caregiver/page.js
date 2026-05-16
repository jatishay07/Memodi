'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AlertCard from '../../components/AlertCard';
import { useAuth } from '../../lib/auth';
import { getAlerts, getInteractions, resolveAlert } from '../../lib/api';

const TABS = ['Alerts', 'Interactions', 'Summary'];

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return isToday ? time : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time;
}

export default function CaregiverPage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  const [tab, setTab] = useState('Alerts');
  const [alerts, setAlerts] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace('/auth/caregiver'); return; }
    if (user.role !== 'caregiver') { router.replace('/patient'); return; }
    fetchAll();
  }, [ready, user]);

  async function fetchAll() {
    if (!user?.patientId) { setLoading(false); return; }
    const [alertsRes, interactionsRes] = await Promise.allSettled([
      getAlerts(user.patientId),
      getInteractions(user.patientId, 30)
    ]);
    if (alertsRes.status === 'fulfilled') {
      setAlerts(Array.isArray(alertsRes.value) ? alertsRes.value : []);
    }
    if (interactionsRes.status === 'fulfilled') {
      setInteractions(Array.isArray(interactionsRes.value) ? interactionsRes.value : []);
    }
    setLoading(false);
  }

  async function handleResolve(alertId) {
    try {
      await resolveAlert(alertId);
      setAlerts(prev => prev.map(a =>
        a.alertId === alertId ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a
      ));
    } catch {}
  }

  if (!ready) return null;

  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeInteractions = Array.isArray(interactions) ? interactions : [];
  const unresolved = safeAlerts.filter(a => !a.resolved);
  const resolved = safeAlerts.filter(a => a.resolved);
  const distressCount = safeInteractions.filter(i => i.distressDetected).length;
  const todayCount = safeInteractions.filter(i => new Date(i.timestamp).toDateString() === new Date().toDateString()).length;

  return (
    <div className="min-h-screen bg-navy">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-white text-2xl font-semibold mb-4">Caregiver Dashboard</h1>
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: unresolved.length, label: 'Active alerts' },
              { num: todayCount, label: 'Today' },
              { num: distressCount, label: 'Distress events', red: distressCount > 0 }
            ].map((s, i) => (
              <div key={i} className="bg-navy-card border border-navy-border rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${s.red ? 'text-pink' : 'text-white'}`}>{s.num}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-[#111827] rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                tab === t ? 'bg-[#1C1408] text-amber' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t}
              {t === 'Alerts' && unresolved.length > 0 && (
                <span className="absolute top-1.5 right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unresolved.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'Alerts' && (
              <>
                {safeAlerts.length === 0 && <Empty icon="✓" text="No alerts. All is well." />}
                {unresolved.map(a => <AlertCard key={a.alertId} alert={a} onResolve={handleResolve} />)}
                {resolved.length > 0 && (
                  <>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mt-4 mb-3">Resolved</p>
                    {resolved.map(a => <AlertCard key={a.alertId} alert={a} />)}
                  </>
                )}
              </>
            )}

            {tab === 'Interactions' && (
              <>
                {safeInteractions.length === 0 && <Empty text="No interactions recorded yet." />}
                {safeInteractions.map(i => (
                  <div key={i.interactionId} className="bg-navy-card border border-navy-border rounded-xl p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                        i.type === 'distress' ? 'bg-[#1F0A0A] text-pink'
                          : i.type === 'proactive' ? 'bg-[#0A1F0A] text-green-400'
                          : 'bg-[#1F2937] text-gray-400'
                      }`}>{i.type}</span>
                      <span className="text-gray-500 text-xs">{formatTime(i.timestamp)}</span>
                    </div>
                    {i.patientSaid && (
                      <div className="mb-2">
                        <p className="text-gray-500 text-xs mb-1">Patient said:</p>
                        <p className="text-gray-300 text-sm italic">"{i.patientSaid}"</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Memodi:</p>
                      <p className="text-amber text-sm italic">{i.memodiResponded}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {tab === 'Summary' && (
              <div className="bg-navy-card border border-navy-border rounded-xl p-6">
                <h2 className="text-white text-lg font-semibold mb-1">Weekly Summary</h2>
                <p className="text-gray-500 text-sm mb-6">Full analytics coming soon</p>
                {[
                  { num: safeInteractions.length, label: 'Total interactions', color: 'text-amber' },
                  { num: distressCount, label: 'Distress events', color: 'text-pink' },
                  { num: safeAlerts.length, label: 'Total alerts', color: 'text-amber' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 mb-5">
                    <span className={`text-4xl font-bold w-16 ${s.color}`}>{s.num}</span>
                    <span className="text-gray-400 text-sm">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      {icon && <span className="text-4xl mb-3">{icon}</span>}
      <p className="text-gray-500">{text}</p>
    </div>
  );
}
