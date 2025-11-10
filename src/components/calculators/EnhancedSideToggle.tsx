import { cn } from "@/lib/utils";

interface EnhancedSideToggleProps {
  side: 'long' | 'short';
  onSideChange: (side: 'long' | 'short') => void;
}

export function EnhancedSideToggle({ side, onSideChange }: EnhancedSideToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted/30 border border-border/50">
      <button
        type="button"
        onClick={() => onSideChange('long')}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-all",
          side === 'long'
            ? "bg-profit text-profit-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Long
      </button>
      <button
        type="button"
        onClick={() => onSideChange('short')}
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-all",
          side === 'short'
            ? "bg-loss text-loss-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Short
      </button>
    </div>
  );
}
