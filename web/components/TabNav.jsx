'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

const PATIENT_TABS = [
  { href: '/patient', label: 'Companion', icon: '✦' }
];

const CAREGIVER_TABS = [
  { href: '/family',    label: 'Memory Bank', icon: '🫀' },
  { href: '/caregiver', label: 'Dashboard',   icon: '🔔' }
];

export default function TabNav() {
  const path = usePathname() ?? '';
  const { user, logout } = useAuth() ?? {};
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !user) return null;

  const tabs = user.role === 'patient' ? PATIENT_TABS : CAREGIVER_TABS;

  function handleSignOut() {
    logout();
    router.replace('/auth/patient');
  }

  return (
    <>
      {/* Mobile — fixed bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D1320] border-t border-[#1F2937] flex z-50">
        {tabs.map(tab => {
          const active = path.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                active ? 'text-amber' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-500 hover:text-red-400 transition-colors"
        >
          <span className="text-xl">→</span>
          <span className="text-[10px] font-medium tracking-wide">Sign Out</span>
        </button>
      </nav>

      {/* Desktop — fixed left sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-[#0D1320] border-r border-[#1F2937] flex-col pt-8 z-50">
        <div className="px-6 mb-8">
          <span className="text-amber text-xl font-semibold tracking-wide">Memodi</span>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          {tabs.map(tab => {
            const active = path.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition-colors ${
                  active
                    ? 'bg-[#1C1408] text-amber'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-[#111827]'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 mx-3 mb-6 px-4 py-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-[#111827] transition-colors"
        >
          <span className="text-lg">→</span>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </nav>
    </>
  );
}
