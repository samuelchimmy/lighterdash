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
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="pr-16 h-10 bg-background border-border"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
          {suffix}
        </span>
      </div>
    </div>
  );
}
