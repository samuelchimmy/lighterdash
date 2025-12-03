import { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { 
  CSVTrade, 
  AnalysisResult, 
  parseCSVRow, 
  analyzeAllTrades 
} from '@/lib/csv-trade-analyzer';
import { useToast } from '@/hooks/use-toast';

interface UseTradeAnalysisReturn {
  trades: CSVTrade[];
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  fileName: string | null;
  handleFileUpload: (file: File) => void;
  clearData: () => void;
}

export function useTradeAnalysis(): UseTradeAnalysisReturn {
  const [trades, setTrades] = useState<CSVTrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const analysis = useMemo(() => {
    if (trades.length === 0) return null;
    return analyzeAllTrades(trades);
  }, [trades]);

  const handleFileUpload = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedTrades: CSVTrade[] = [];
        let parseErrors = 0;

        results.data.forEach((row) => {
          const trade = parseCSVRow(row as Record<string, string>);
          if (trade) {
            parsedTrades.push(trade);
          } else {
            parseErrors++;
          }
        });

        if (parsedTrades.length === 0) {
          setError('No valid trades found in CSV. Please check the file format.');
          toast({
            title: 'Import Failed',
            description: 'No valid trades found. Please ensure your CSV has Date, Market, and PnL columns.',
            variant: 'destructive'
          });
        } else {
          setTrades(parsedTrades);
          toast({
            title: 'Import Successful',
            description: `Imported ${parsedTrades.length} trades${parseErrors > 0 ? ` (${parseErrors} rows skipped)` : ''}`
          });
        }

        setIsLoading(false);
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
        toast({
          title: 'Parse Error',
          description: err.message,
          variant: 'destructive'
        });
        setIsLoading(false);
      }
    });
  }, [toast]);

  const clearData = useCallback(() => {
    setTrades([]);
    setFileName(null);
    setError(null);
  }, []);

  return {
    trades,
    analysis,
    isLoading,
    error,
    fileName,
    handleFileUpload,
    clearData
  };
}
