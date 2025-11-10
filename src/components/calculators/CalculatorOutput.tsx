import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OutputItem {
  label: string;
  value: string;
  colorClass?: string;
  suffix?: string;
}

interface CalculatorOutputProps {
  title?: string;
  outputs: OutputItem[];
}

export function CalculatorOutput({ title = "Results", outputs }: CalculatorOutputProps) {
  return (
    <Card className="p-4 bg-muted/30 border-border/50">
      {title && (
        <h3 className="text-sm font-semibold mb-3 text-foreground">{title}</h3>
      )}
      <div className="space-y-3">
        {outputs.map((output, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{output.label}</span>
            <span className={cn("text-base font-semibold", output.colorClass || "text-foreground")}>
              {output.value}
              {output.suffix && (
                <span className="text-sm ml-1">{output.suffix}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
