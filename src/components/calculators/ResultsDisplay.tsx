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
    <Card className="p-5 bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Results</h3>
      <div className="space-y-3">
        {results.map((result, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 animate-in fade-in slide-in-from-right-2 duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-xs text-muted-foreground">{result.label}</span>
            <span className={cn("text-sm font-bold", result.colorClass || "text-foreground")}>
              {result.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}