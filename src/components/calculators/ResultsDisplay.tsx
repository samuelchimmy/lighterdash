import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResultItem {
  label: string;
  value: string;
  colorClass?: string;
}

interface ResultsDisplayProps {
  results: ResultItem[];
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  return (
    <Card className="p-6 bg-card/50 border-border/50">
      <h3 className="text-sm font-semibold mb-4 text-foreground">Results</h3>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{result.label}</span>
            <span className={cn("text-base font-semibold", result.colorClass || "text-foreground")}>
              {result.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
