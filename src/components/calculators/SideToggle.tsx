import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SideToggleProps {
  side: 'long' | 'short';
  onSideChange: (side: 'long' | 'short') => void;
}

export function SideToggle({ side, onSideChange }: SideToggleProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Position Side</Label>
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
        <div className={`flex items-center gap-2 ${side === 'long' ? 'text-profit' : 'text-muted-foreground'}`}>
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Long</span>
        </div>
        <Switch
          checked={side === 'short'}
          onCheckedChange={(checked) => onSideChange(checked ? 'short' : 'long')}
        />
        <div className={`flex items-center gap-2 ${side === 'short' ? 'text-loss' : 'text-muted-foreground'}`}>
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">Short</span>
        </div>
      </div>
    </div>
  );
}
