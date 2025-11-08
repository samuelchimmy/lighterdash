import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Position, LighterTrade, UserStats } from '@/types/lighter';
import {
  exportPositionsToCSV,
  exportTradesToCSV,
  exportAccountStatsToCSV,
  exportAllData,
} from '@/lib/export-utils';

interface ExportMenuProps {
  positions: Position[];
  trades: LighterTrade[];
  stats: UserStats | null;
  walletAddress: string;
}

export const ExportMenu = ({ positions, trades, stats, walletAddress }: ExportMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => exportPositionsToCSV(positions)}>
          Export Positions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportTradesToCSV(trades)}>
          Export Trades
        </DropdownMenuItem>
        {stats && (
          <DropdownMenuItem onClick={() => exportAccountStatsToCSV(stats)}>
            Export Account Stats
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => exportAllData(positions, trades, stats, walletAddress)}
          className="font-semibold"
        >
          Export All Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
