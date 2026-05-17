'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const NAV_ITEMS = [
  { href: '/patient',       label: 'Dashboard',    icon: '⌂' },
  { href: '/family',        label: 'Memory Lane',  icon: '◎' },
];

export default function PatientNav({ onSignOut }) {
  const path = usePathname() ?? '';

  return (
    <nav style={{
      position: 'absolute', top: 24, left: 32, zIndex: 50,
      display: 'flex', gap: 12, alignItems: 'center',
    }}>
      <Logo iconSize={32} textSize={18} gap={7} />

      {NAV_ITEMS.map(item => {
        const active = path === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 999,
              border: `2px solid ${active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)'}`,
              background: active ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.40)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              color: active ? '#DC4F7C' : '#6B6B6B',
              boxShadow: active ? '0 8px 24px rgba(45,45,45,0.08)' : 'none',
              fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
              textDecoration: 'none',
              transition: 'all .25s ease',
            }}
          >
            {item.label}
          </Link>
        );
      })}
      {onSignOut && (
        <button
          onClick={onSignOut}
          style={{
            padding: '11px 18px', borderRadius: 999,
            border: '2px solid rgba(255,255,255,0.55)',
            background: 'rgba(255,255,255,0.40)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            color: '#9C9C9C', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      )}
    </nav>
  );
}
