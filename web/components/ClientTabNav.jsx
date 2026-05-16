'use client';
import dynamic from 'next/dynamic';

const TabNav = dynamic(() => import('./TabNav'), { ssr: false });

export default function ClientTabNav() {
  return <TabNav />;
}
