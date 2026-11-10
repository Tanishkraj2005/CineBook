export default function SeatLegend() {
  const items = [
    { label: 'Available Standard (₹200)', color: 'bg-zinc-700 border-zinc-600' },
    { label: 'Premium (₹350)', color: 'bg-amber-900/60 border-amber-700 text-amber-200' },
    { label: 'Recliner (₹500)', color: 'bg-indigo-900/60 border-indigo-700 text-indigo-200' },
    { label: 'Selected', color: 'bg-cinema-accent border-cinema-accent shadow-md shadow-cinema-accent/30' },
    { label: 'Booked / Held', color: 'bg-zinc-800 border-zinc-800 text-zinc-600 opacity-60' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-4 px-3 bg-cinema-surface/50 border-t border-b border-cinema-border/60 text-xs">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-t-md border ${item.color} flex items-center justify-center text-[10px]`} />
          <span className="text-cinema-muted text-[11px] sm:text-xs">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

