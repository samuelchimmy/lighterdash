import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { validateNumberInput } from "@/lib/calculator-utils";

interface CalculatorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  helpText?: string;
}

export function CalculatorInput({
  label,
  value,
  onChange,
  placeholder = "0.00",
  suffix,
  helpText,
}: CalculatorInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (validateNumberInput(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="pr-12"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
