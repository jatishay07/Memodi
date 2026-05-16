function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return isToday
    ? `Today ${time}`
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time;
}

const SEVERITY = {
  high:   { border: 'border-red-500',    badge: 'bg-red-500',    label: '⚠ HIGH' },
  medium: { border: 'border-orange-400', badge: 'bg-orange-400', label: '⚠ ALERT' },
  low:    { border: 'border-yellow-400', badge: 'bg-yellow-400', label: '• NOTICE' }
};

export default function AlertCard({ alert, onResolve }) {
  const sev = alert.trigger?.includes('high') ? 'high' : alert.trigger?.includes('medium') ? 'medium' : 'low';
  const s = SEVERITY[sev];

  return (
    <div className={`bg-navy-card border ${s.border} rounded-xl p-4 mb-3`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`${s.badge} text-white text-xs font-bold px-2 py-1 rounded`}>
          {s.label}
        </span>
        <span className="text-gray-400 text-xs">{formatTime(alert.timestamp)}</span>
      </div>

      {alert.patientSaid && (
        <div className="bg-navy rounded-lg p-3 mb-2">
          <p className="text-gray-500 text-xs mb-1">Patient said:</p>
          <p className="text-gray-200 text-sm italic">"{alert.patientSaid}"</p>
        </div>
      )}

      {alert.trigger && (
        <p className="text-gray-400 text-xs mb-3">{alert.trigger}</p>
      )}

      {!alert.resolved && onResolve && (
        <button
          onClick={() => onResolve(alert.alertId)}
          className="w-full bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          Mark Resolved
        </button>
      )}

      {alert.resolved && (
        <p className="text-gray-500 text-xs">
          ✓ Resolved {alert.resolvedAt ? formatTime(alert.resolvedAt) : ''}
        </p>
      )}
    </div>
  );
}
