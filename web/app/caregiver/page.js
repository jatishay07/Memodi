'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AlertCard from '../../components/AlertCard';
import CaregiverNav from '../../components/CaregiverNav';
import CaregiverAmbient from '../../components/CaregiverAmbient';
import { useAuth } from '../../lib/auth';
import { getAlerts, getInteractions, resolveAlert, connectToPatient } from '../../lib/api';

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return isToday ? time : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time;
}

export default function CaregiverPage() {
  const router = useRouter();
  const { user, ready, logout, login } = useAuth();

  const [tab, setTab] = useState('alerts');
  const [alerts, setAlerts] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [connectModal, setConnectModal] = useState(false);
  const [connectCode, setConnectCode] = useState('');
  const [connectError, setConnectError] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);

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
    if (alertsRes.status === 'fulfilled')       setAlerts(Array.isArray(alertsRes.value) ? alertsRes.value : []);
    if (interactionsRes.status === 'fulfilled') setInteractions(Array.isArray(interactionsRes.value) ? interactionsRes.value : []);
    setLoading(false);
  }

  async function handleConnect() {
    const code = connectCode.replace(/\s/g, '');
    if (code.length !== 6) { setConnectError('Please enter the full 6-digit code.'); return; }
    setConnectLoading(true);
    setConnectError('');
    try {
      const data = await connectToPatient(user.caregiverId, code);
      login({ ...user, patientId: data.patientId, token: data.token });
      setConnectModal(false);
      setConnectCode('');
      // Reload data for the newly connected patient
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong.';
      setConnectError(msg);
    } finally {
      setConnectLoading(false);
    }
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
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: 64 }}>
      <CaregiverAmbient />
      <CaregiverNav onSignOut={logout} unread={unresolved.length} />

      <div style={{
        position: 'relative', zIndex: 1,
        padding: '120px 40px 0', maxWidth: 980, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 52, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>
              Alerts &amp; notifications
            </h1>
            <p style={{ fontSize: 18, color: '#6B6B6B', margin: '8px 0 0' }}>
              Monitor and respond to important events
            </p>
          </div>
          {user?.patientId && (
            <button
              onClick={() => { setConnectCode(''); setConnectError(''); setConnectModal(true); }}
              style={{
                padding: '10px 18px', borderRadius: 999, border: '2px solid rgba(252,138,45,0.30)',
                background: 'rgba(252,138,45,0.07)', color: '#FC8A2D',
                fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', transition: 'all .2s', alignSelf: 'center', marginTop: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(252,138,45,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(252,138,45,0.07)'; }}
            >
              Change patient
            </button>
          )}
        </div>

        {/* Connect banner — shown when no patient linked */}
        {!user?.patientId && (
          <div style={{
            borderRadius: 24, padding: '28px 32px', margin: '28px 0',
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '2px solid rgba(255,255,255,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
          }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, margin: '0 0 6px', color: '#2D2D2D' }}>
                Connect to a patient
              </h2>
              <p style={{ fontSize: 15, color: '#6B6B6B', margin: 0, maxWidth: 480 }}>
                Ask your patient to open Memodi and tap <strong>"+ Share with caregiver"</strong> — they&apos;ll see a 6-digit code for you to enter here.
              </p>
            </div>
            <button
              onClick={() => { setConnectCode(''); setConnectError(''); setConnectModal(true); }}
              style={{
                padding: '14px 28px', borderRadius: 999, border: 0,
                background: '#FC8A2D', color: '#fff',
                fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: '0 10px 26px rgba(252,138,45,0.28)',
              }}
            >
              Enter code
            </button>
          </div>
        )}

        <div style={{ marginBottom: 36 }} />

        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 36 }}>
          <StatTile label="Active alerts"  value={unresolved.length} color="#9E9820" />
          <StatTile label="Today"          value={todayCount}        color="#DC4F7C" />
          <StatTile label="Distress events" value={distressCount}   color="#C42B34" />
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[['alerts', 'Alerts'], ['interactions', 'Interactions'], ['summary', 'Weekly summary']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '10px 22px', borderRadius: 999, border: 'none',
              background: tab === id ? '#FC8A2D' : 'rgba(255,255,255,0.65)',
              color: tab === id ? '#fff' : '#6B6B6B',
              fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
              cursor: 'pointer', boxShadow: tab === id ? '0 8px 20px rgba(252,138,45,0.26)' : 'none',
              backdropFilter: 'blur(10px)', transition: 'all .2s ease',
            }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid rgba(220,79,124,0.25)',
              borderTopColor: '#DC4F7C',
              animation: 'orbSpin .8s linear infinite',
            }} />
          </div>
        ) : (
          <>
            {tab === 'alerts' && (
              <>
                {safeAlerts.length === 0 && <Empty text="No alerts. All is well." />}
                {unresolved.map(a => <AlertCard key={a.alertId} alert={a} onResolve={handleResolve} />)}
                {resolved.length > 0 && (
                  <>
                    <p style={{ fontSize: 13, color: '#9C9C9C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '24px 0 12px' }}>
                      Resolved
                    </p>
                    {resolved.map(a => <AlertCard key={a.alertId} alert={a} />)}
                  </>
                )}
              </>
            )}

            {tab === 'interactions' && (
              <>
                {safeInteractions.length === 0 && <Empty text="No interactions recorded yet." />}
                {safeInteractions.map(i => (
                  <div key={i.interactionId} style={{
                    borderRadius: 24, padding: '22px 26px', marginBottom: 16,
                    background: 'rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255,255,255,0.85)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{
                        fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.10em',
                        fontWeight: 700, padding: '4px 12px', borderRadius: 999,
                        background: i.type === 'distress' ? 'rgba(196,43,52,0.15)'
                          : i.type === 'proactive' ? 'rgba(158,152,32,0.15)' : 'rgba(0,0,0,0.06)',
                        color: i.type === 'distress' ? '#C42B34' : i.type === 'proactive' ? '#9E9820' : '#6B6B6B',
                      }}>
                        {i.type}
                      </span>
                      <span style={{ fontSize: 13, color: '#9C9C9C' }}>{formatTime(i.timestamp)}</span>
                    </div>
                    {i.patientSaid && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: 13, color: '#9C9C9C', margin: '0 0 4px' }}>Patient said:</p>
                        <p style={{ fontSize: 16, color: '#2D2D2D', fontStyle: 'italic', margin: 0 }}>
                          &ldquo;{i.patientSaid}&rdquo;
                        </p>
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 13, color: '#9C9C9C', margin: '0 0 4px' }}>Memodi:</p>
                      <p style={{ fontSize: 16, color: '#FC8A2D', margin: 0 }}>{i.memodiResponded}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {tab === 'summary' && (
              <div style={{
                borderRadius: 32, padding: '32px 36px',
                background: 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255,255,255,0.85)',
              }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, margin: '0 0 24px' }}>
                  Weekly summary
                </h2>
                {[
                  ['Total interactions', safeInteractions.length],
                  ['Distress events', distressCount],
                  ['Total alerts', safeAlerts.length],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}>
                    <span style={{ fontSize: 16, color: '#6B6B6B' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: '#2D2D2D', fontWeight: 400 }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {/* Connect / change-patient modal */}
      {connectModal && (
        <div
          onClick={() => setConnectModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 40, animation: 'fadeIn .3s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480,
              borderRadius: 32, background: 'rgba(255,255,255,0.96)',
              border: '2px solid rgba(252,138,45,0.15)',
              boxShadow: '0 32px 80px rgba(252,138,45,0.18)',
              padding: '44px 44px 40px', position: 'relative',
              animation: 'slideUpBounce .4s cubic-bezier(.34,1.56,.64,1)',
            }}
          >
            <button
              onClick={() => setConnectModal(false)}
              style={{
                position: 'absolute', top: 20, right: 20, width: 40, height: 40,
                borderRadius: 999, background: 'rgba(252,138,45,0.08)', border: 0,
                color: '#FC8A2D', fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ×
            </button>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, margin: '0 0 8px', color: '#2D2D2D' }}>
              {user?.patientId ? 'Change patient' : 'Connect to patient'}
            </h2>
            <p style={{ fontSize: 15, color: '#6B6B6B', margin: '0 0 28px', lineHeight: 1.55 }}>
              Enter the 6-digit code shown on your patient&apos;s Memodi screen.
            </p>

            {/* Code input */}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000 000"
              value={connectCode}
              onChange={e => {
                setConnectError('');
                setConnectCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }}
              style={{
                width: '100%', padding: '18px 24px', borderRadius: 20,
                background: '#FFF9F0',
                border: `2px solid ${connectError ? '#C42B34' : 'rgba(252,138,45,0.30)'}`,
                fontFamily: 'var(--font-serif)', fontSize: 36, color: '#2D2D2D',
                outline: 'none', boxSizing: 'border-box', textAlign: 'center',
                letterSpacing: '0.20em', marginBottom: 12,
                transition: 'border-color .2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#FC8A2D'; }}
              onBlur={e => { if (!connectError) e.currentTarget.style.borderColor = 'rgba(252,138,45,0.30)'; }}
              onKeyDown={e => { if (e.key === 'Enter') handleConnect(); }}
            />

            {connectError && (
              <p style={{ fontSize: 14, color: '#C42B34', margin: '0 0 16px', lineHeight: 1.45 }}>
                {connectError}
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button
                onClick={() => setConnectModal(false)}
                style={{
                  flex: 1, padding: '14px 20px', borderRadius: 999,
                  border: '2px solid rgba(255,255,255,0.85)',
                  background: 'rgba(255,255,255,0.70)',
                  color: '#6B6B6B', fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={connectCode.length !== 6 || connectLoading}
                style={{
                  flex: 1, padding: '14px 20px', borderRadius: 999, border: 0,
                  background: '#FC8A2D', color: '#fff',
                  fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
                  cursor: connectCode.length === 6 ? 'pointer' : 'not-allowed',
                  opacity: connectCode.length !== 6 || connectLoading ? 0.45 : 1,
                  boxShadow: '0 10px 28px rgba(252,138,45,0.30)',
                }}
              >
                {connectLoading ? '…' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, color }) {
  return (
    <div style={{
      padding: '22px 26px', borderRadius: 24,
      background: 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(20px)',
      border: '2px solid rgba(255,255,255,0.85)',
      boxShadow: '0 8px 24px rgba(45,45,45,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 16, color: '#6B6B6B' }}>{label}</span>
        <span style={{
          width: 40, height: 40, borderRadius: 999, background: color,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: 18 }}>◉</span>
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 48, lineHeight: 1, fontWeight: 400, color: '#2D2D2D' }}>
        {value}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ padding: '64px 0', textAlign: 'center' }}>
      <p style={{ fontSize: 18, color: '#9C9C9C', margin: 0 }}>{text}</p>
    </div>
  );
}
