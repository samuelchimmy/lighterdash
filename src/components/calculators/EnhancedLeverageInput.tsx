import { Label } from "@/components/ui/label";
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
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Leverage</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrement}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="text"
            value={leverage}
            onChange={handleInputChange}
            className="w-16 h-8 text-center text-sm font-medium"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrement}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <span className="text-sm text-muted-foreground ml-1">x</span>
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
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>30x</span>
        <span>60x</span>
        <span>90x</span>
        <span>120x</span>
        <span>150x</span>
      </div>
    </div>
  );
}
