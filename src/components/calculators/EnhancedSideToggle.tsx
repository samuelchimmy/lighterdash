import { cn } from "@/lib/utils";

interface EnhancedSideToggleProps {
  side: 'long' | 'short';
  onSideChange: (side: 'long' | 'short') => void;
}

export function EnhancedSideToggle({ side, onSideChange }: EnhancedSideToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-0.5 p-0.5 rounded-lg bg-muted/30 border border-border/50">
      <button
        type="button"
        onClick={() => onSideChange('long')}
        className={cn(
          "px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
          side === 'long'
            ? "bg-profit text-profit-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        Long
      </button>
      <button
        type="button"
        onClick={() => onSideChange('short')}
        className={cn(
          "px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
          side === 'short'
            ? "bg-loss text-loss-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        Short
      </button>
    </div>
  );
}