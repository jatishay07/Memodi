'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/caregiver', label: 'Alerts',       badge: true },
  { href: '/family',    label: 'Memory Base',  badge: false },
];

export default function CaregiverNav({ onSignOut, unread = 0 }) {
  const path = usePathname() ?? '';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: '18px 32px',
      background: 'rgba(255,255,255,0.50)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '2px solid rgba(255,255,255,0.60)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1240, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{
            fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500,
            color: '#4a3f33', letterSpacing: 'normal',
          }}>
            Memodi
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {TABS.map(tab => {
              const active = path === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 999,
                    border: active ? '2px solid transparent' : '2px solid rgba(255,255,255,0.80)',
                    background: active ? '#FC8A2D' : 'rgba(255,255,255,0.60)',
                    color: active ? '#fff' : '#6B6B6B',
                    fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                    textDecoration: 'none',
                    boxShadow: active ? '0 8px 20px rgba(252,138,45,0.26)' : 'none',
                    transition: 'all .25s ease',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                  }}
                >
                  {tab.label}
                  {tab.badge && unread > 0 && (
                    <span style={{
                      width: 8, height: 8, borderRadius: 999,
                      background: '#C42B34', marginLeft: 2,
                      animation: 'carePulse 1.4s ease-in-out infinite',
                    }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            style={{
              padding: '10px 20px', borderRadius: 999,
              border: '2px solid rgba(255,255,255,0.80)',
              background: 'rgba(255,255,255,0.60)',
              color: '#6B6B6B', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
