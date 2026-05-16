'use client';

export default function CaregiverError({ error, reset }) {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6 text-center">
      <p className="text-pink text-lg font-semibold mb-2">Something went wrong</p>
      <p className="text-gray-400 text-sm mb-6">{error?.message || 'Unknown error'}</p>
      <button
        onClick={reset}
        className="px-6 py-2 rounded-xl bg-amber text-navy font-semibold text-sm"
      >
        Try again
      </button>
    </div>
  );
}
