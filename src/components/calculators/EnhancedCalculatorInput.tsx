import { Input } from "@/components/ui/input";
import { validateNumberInput } from "@/lib/calculator-utils";

interface EnhancedCalculatorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix: string;
}

export function EnhancedCalculatorInput({
  label,
  value,
  onChange,
  placeholder = "0.00",
  suffix,
}: EnhancedCalculatorInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (validateNumberInput(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="pr-14 h-9 text-sm bg-background border-border/50 focus:border-primary/50 transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium uppercase">
          {suffix}
        </span>
      </div>
    </div>
  );
}