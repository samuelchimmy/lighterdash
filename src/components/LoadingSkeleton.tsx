import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SummaryCardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
    {[...Array(3)].map((_, i) => (
      <Card 
        key={i} 
        className="relative overflow-hidden p-6 bg-card/80 backdrop-blur-sm border-border/50"
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-muted to-muted/50 animate-shimmer" />
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20 bg-muted/50" />
              <Skeleton className="h-5 w-16 rounded-full bg-muted/50" />
            </div>
            <Skeleton className="h-10 w-32 bg-muted/50" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl bg-muted/50" />
        </div>
      </Card>
    ))}
  </div>
);

export const AccountStatsSkeleton = () => (
  <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 animate-fade-in delay-100">
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5 rounded bg-muted/50" />
      <Skeleton className="h-6 w-32 bg-muted/50" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="stat-card" style={{ animationDelay: `${i * 75}ms` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg bg-muted/50" />
              <Skeleton className="h-3 w-20 bg-muted/50" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <Skeleton className="h-9 w-24 bg-muted/50" />
            <Skeleton className="h-11 w-11 rounded-full bg-muted/50" />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export const PositionsTableSkeleton = () => (
  <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 animate-fade-in delay-200">
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5 rounded bg-muted/50" />
      <Skeleton className="h-6 w-28 bg-muted/50" />
    </div>
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg bg-muted/50" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-muted/50" />
              <Skeleton className="h-3 w-16 bg-muted/50" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20 bg-muted/50" />
            <Skeleton className="h-6 w-16 rounded-full bg-muted/50" />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export const ChartSkeleton = () => (
  <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 animate-fade-in delay-150">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded bg-muted/50" />
        <Skeleton className="h-6 w-28 bg-muted/50" />
      </div>
      <div className="flex items-center gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-12 rounded-lg bg-muted/50" />
        ))}
      </div>
    </div>
    <div className="relative h-64 rounded-xl overflow-hidden bg-secondary/20 border border-border/30">
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-muted/10 to-transparent" />
      <svg className="w-full h-full opacity-20" preserveAspectRatio="none">
        <path d="M0,180 Q50,160 100,165 T200,145 T300,155 T400,130 T500,140 T600,100 T700,110 T800,80" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
      </svg>
    </div>
  </Card>
);

export const PerformanceMetricsSkeleton = () => (
  <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 animate-fade-in delay-200">
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5 rounded bg-muted/50" />
      <Skeleton className="h-6 w-40 bg-muted/50" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="stat-card" style={{ animationDelay: `${i * 75}ms` }}>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-8 w-8 rounded-lg bg-muted/50" />
            <Skeleton className="h-3 w-24 bg-muted/50" />
          </div>
          <Skeleton className="h-9 w-28 bg-muted/50" />
          <Skeleton className="h-3 w-20 mt-2 bg-muted/50" />
        </div>
      ))}
    </div>
  </Card>
);
