import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface AlertHistoryItem {
  id: string;
  marketId: number;
  marketSymbol: string;
  type: "price" | "volume" | "funding";
  message: string;
  timestamp: number;
}

interface AlertHistoryProps {
  history: AlertHistoryItem[];
  onClear: () => void;
  onRemove: (id: string) => void;
}

export function AlertHistory({ history, onClear, onRemove }: AlertHistoryProps) {
  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case "price":
        return "default";
      case "volume":
        return "secondary";
      case "funding":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Card className="border-border/30 bg-secondary/10">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-xs">
            <History className="h-3 w-3 text-primary" />
            Alert History
          </CardTitle>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="h-5 text-[9px] px-1.5">
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {history.length === 0 ? (
          <div className="text-center py-4 text-[10px] text-muted-foreground">
            No alerts triggered yet
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-1.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-lg border border-border/30 bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-[10px]">{item.marketSymbol}</span>
                        <Badge variant={getAlertBadgeVariant(item.type)} className="text-[8px] h-3.5 px-1">
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground">{item.message}</p>
                      <p className="text-[8px] text-muted-foreground">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => onRemove(item.id)}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}