import { Button } from '@/components/ui/button';
import { Download, FileText, Image, Sheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Position, LighterTrade, UserStats } from '@/types/lighter';
import {
  exportPositionsToCSV,
  exportTradesToCSV,
  exportAccountStatsToCSV,
  exportAllData,
} from '@/lib/export-utils';
import { exportToPDF } from '@/lib/pdf-export';
import { createShareableCard } from '@/lib/image-export';
import { useToast } from '@/hooks/use-toast';

interface ExportMenuProps {
  positions: Position[];
  trades: LighterTrade[];
  stats: UserStats | null;
  walletAddress: string;
}

export const ExportMenu = ({ positions, trades, stats, walletAddress }: ExportMenuProps) => {
  const { toast } = useToast();

  const handleShareableImage = async () => {
    try {
      const portfolio = parseFloat(stats?.portfolio_value || '0');
      const collateral = parseFloat(stats?.collateral || '0');
      const totalPnl = portfolio - collateral;
      
      const winningPositions = positions.filter(p => parseFloat(p.unrealized_pnl || '0') > 0);
      const winRate = positions.length > 0 ? (winningPositions.length / positions.length) * 100 : 0;

      const imageUrl = await createShareableCard(walletAddress, totalPnl, portfolio, winRate);
      
      // Download the image
      const link = document.createElement('a');
      link.download = `lighterdash-${walletAddress.slice(0, 8)}-${Date.now()}.png`;
      link.href = imageUrl;
      link.click();

      toast({
        title: "Image generated!",
        description: "Your shareable performance card has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate shareable image.",
        variant: "destructive",
      });
    }
  };

  const handlePDFExport = () => {
    try {
      exportToPDF({ walletAddress, stats, positions, trades });
      toast({
        title: "PDF exported!",
        description: "Your trading report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate PDF report.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" fill="currentColor" fillOpacity={0.2} />
          <span className="hidden md:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => exportPositionsToCSV(positions)} className="gap-2">
          <Sheet className="w-4 h-4" fill="currentColor" fillOpacity={0.2} />
          Export Positions (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportTradesToCSV(trades)} className="gap-2">
          <Sheet className="w-4 h-4" fill="currentColor" fillOpacity={0.2} />
          Export Trades (CSV)
        </DropdownMenuItem>
        {stats && (
          <DropdownMenuItem onClick={() => exportAccountStatsToCSV(stats)} className="gap-2">
            <Sheet className="w-4 h-4" fill="currentColor" fillOpacity={0.2} />
            Export Account Stats (CSV)
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => exportAllData(positions, trades, stats, walletAddress)}
          className="gap-2"
        >
          <Sheet className="w-4 h-4" fill="currentColor" fillOpacity={0.2} />
          Export All Data (CSV)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handlePDFExport} className="gap-2">
          <FileText className="w-4 h-4" fill="currentColor" fillOpacity={0.2} />
          Generate PDF Report
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleShareableImage} className="gap-2">
          <Image className="w-4 h-4" fill="currentColor" fillOpacity={0.2} />
          Create Share Card
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
