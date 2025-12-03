import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SummaryCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6 bg-card border-border shadow-card">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export const AccountStatsSkeleton = () => {
  return (
    <Card className="p-6 bg-card border-border shadow-card">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-secondary/50 rounded-lg p-4 border border-border/50 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
};

export const PositionsTableSkeleton = () => {
  return (
    <Card className="p-6 bg-card border-border shadow-card">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 bg-secondary/30 rounded-lg p-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </Card>
  );
};

export const ChartSkeleton = () => {
  return (
    <Card className="p-6 bg-card border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-12" />
          ))}
        </div>
      </div>
      <Skeleton className="h-[300px] w-full" />
    </Card>
  );
};

export const PerformanceMetricsSkeleton = () => {
  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card border-border shadow-card">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-secondary/50 rounded-lg p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
