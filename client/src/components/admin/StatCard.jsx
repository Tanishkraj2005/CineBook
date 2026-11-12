export default function StatCard({ title, value, icon: Icon, color = 'accent', subtext }) {
  const colorMap = {
    accent: 'bg-cinema-accent/10 border-cinema-accent/30 text-cinema-accent',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  };

  return (
    <div className="card p-5 hover:border-cinema-muted transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && <p className="text-[11px] text-cinema-muted mt-1">{subtext}</p>}
        </div>
        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${
            colorMap[color] || colorMap.accent
          }`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

