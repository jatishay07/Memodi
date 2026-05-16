'use client';

import { AuthProvider } from '../lib/auth';

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
