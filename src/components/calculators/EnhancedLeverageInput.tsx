import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface EnhancedLeverageInputProps {
  leverage: number;
  onLeverageChange: (value: number) => void;
}

export function EnhancedLeverageInput({ leverage, onLeverageChange }: EnhancedLeverageInputProps) {
  const handleIncrement = () => {
    if (leverage < 100) onLeverageChange(leverage + 1);
  };

  const handleDecrement = () => {
    if (leverage > 1) onLeverageChange(leverage - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) || value === '') {
      const num = parseInt(value) || 1;
      const clamped = Math.min(Math.max(num, 1), 100);
      onLeverageChange(clamped);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Leverage</span>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 border-border/50"
            onClick={handleDecrement}
          >
            <Minus className="h-2.5 w-2.5" />
          </Button>
          <Input
            type="text"
            value={leverage}
            onChange={handleInputChange}
            className="w-12 h-7 text-center text-xs font-semibold border-border/50"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 border-border/50"
            onClick={handleIncrement}
          >
            <Plus className="h-2.5 w-2.5" />
          </Button>
          <span className="text-xs text-muted-foreground ml-0.5">x</span>
        </div>
      </div>
      <Slider
        value={[leverage]}
        onValueChange={(values) => onLeverageChange(values[0])}
        min={1}
        max={150}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>30x</span>
        <span>60x</span>
        <span>90x</span>
        <span>120x</span>
        <span>150x</span>
      </div>
    </div>
  );
}