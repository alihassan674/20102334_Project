export function LoadingSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-surface-800/50 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-surface-800/30 rounded-lg animate-pulse" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-5 space-y-4"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-surface-800/50 animate-pulse" />
              <div className="w-12 h-6 rounded-lg bg-surface-800/30 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-surface-800/30 rounded animate-pulse" />
              <div className="h-7 w-24 bg-surface-800/50 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 h-72 animate-pulse bg-surface-800/20" />
        <div className="glass-card rounded-2xl p-6 h-72 animate-pulse bg-surface-800/20" />
      </div>
    </div>
  );
}
