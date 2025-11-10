import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface LeverageInputProps {
  leverage: number;
  onLeverageChange: (value: number) => void;
}

export function LeverageInput({ leverage, onLeverageChange }: LeverageInputProps) {
  const handleSliderChange = (values: number[]) => {
    onLeverageChange(values[0]);
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
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Leverage</Label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={leverage}
            onChange={handleInputChange}
            className="w-16 h-8 text-center text-sm"
          />
          <span className="text-sm text-muted-foreground">x</span>
        </div>
      </div>
      <Slider
        value={[leverage]}
        onValueChange={handleSliderChange}
        min={1}
        max={100}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1x</span>
        <span>100x</span>
      </div>
    </div>
  );
}
