export default function MemoryCard({ type, data }) {
  if (type === 'person') {
    return (
      <div className="bg-navy-card border border-navy-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          {data.photoUrl ? (
            <img src={data.photoUrl} alt={data.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#374151] flex items-center justify-center flex-shrink-0">
              <span className="text-amber text-lg font-semibold">{data.name?.[0] ?? '?'}</span>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold">{data.name}</span>
              {data.isDeceased && (
                <span className="text-xs text-gray-400 bg-[#374151] px-2 py-0.5 rounded">In memory</span>
              )}
            </div>
            <p className="text-amber text-sm mt-0.5">{data.relationship}</p>
            {data.story && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{data.story}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'object') {
    return (
      <div className="bg-navy-card border border-navy-border rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">📍</span>
        <div>
          <p className="text-white font-medium">{data.item}</p>
          <p className="text-gray-400 text-sm">{data.location}</p>
        </div>
      </div>
    );
  }

  if (type === 'medication') {
    return (
      <div className="bg-navy-card border border-navy-border rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">💊</span>
        <div>
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-gray-400 text-sm">{data.time} — {data.location}</p>
        </div>
      </div>
    );
  }

  if (type === 'event') {
    return (
      <div className="bg-navy-card border border-navy-border rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">📅</span>
        <div>
          <p className="text-white font-medium">{data.description}</p>
          <p className="text-gray-400 text-sm">{data.date}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-4">
      <p className="text-gray-300 text-sm leading-relaxed">
        {typeof data === 'string' ? data : JSON.stringify(data)}
      </p>
    </div>
  );
}
