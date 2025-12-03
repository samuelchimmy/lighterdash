import { Loader2, BarChart3, Wallet, Activity } from 'lucide-react';

export const ScanningLoader = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header with scanning animation */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 gradient-primary blur-2xl opacity-50 animate-pulse" />
          <div className="relative bg-card border border-primary/50 rounded-2xl p-6">
            <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" fill="currentColor" fillOpacity={0.1} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold text-foreground">
            Scanning Wallet...
          </h3>
          <p className="text-sm text-muted-foreground">
            Connecting to Lighter network and fetching account data
          </p>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Wallet, label: 'Fetching Account', delay: '0ms' },
          { icon: BarChart3, label: 'Loading Positions', delay: '150ms' },
          { icon: Activity, label: 'Syncing Trades', delay: '300ms' }
        ].map((item, index) => (
          <div
            key={item.label}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4"
            style={{ animationDelay: item.delay }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur animate-pulse" />
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-glow animate-in slide-in-from-left-full duration-1000"
                  style={{ animationDelay: item.delay }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton cards */}
      <div className="space-y-4 animate-in fade-in duration-700" style={{ animationDelay: '500ms' }}>
        {/* Summary card skeleton */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 bg-secondary rounded animate-shimmer" />
              <div className="h-8 w-48 bg-secondary rounded animate-shimmer" />
            </div>
            <div className="h-12 w-12 bg-secondary rounded-lg animate-shimmer" />
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="h-3 w-20 bg-secondary rounded animate-shimmer" />
              <div className="h-6 w-32 bg-secondary rounded animate-shimmer" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="h-5 w-32 bg-secondary rounded animate-shimmer" />
          <div className="h-64 bg-secondary/50 rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
};
