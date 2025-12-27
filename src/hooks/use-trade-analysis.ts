import { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { 
  CSVTrade, 
  AnalysisResult, 
  analyzeAllTrades 
} from '@/lib/csv-trade-analyzer';
import { 
  detectExchange, 
  ExchangeDetectionResult 
} from '@/lib/exchangeMappings';
import { tradeDataStore } from '@/stores/tradeDataStore';
import { useToast } from '@/hooks/use-toast';

interface UseTradeAnalysisReturn {
  trades: CSVTrade[];
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  fileName: string | null;
  detectedExchange: ExchangeDetectionResult | null;
  needsMapping: boolean;
  handleFileUpload: (file: File) => void;
  setTrades: (trades: CSVTrade[]) => void;
  clearData: () => void;
}

export function useTradeAnalysis(): UseTradeAnalysisReturn {
  const [trades, setTrades] = useState<CSVTrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [detectedExchange, setDetectedExchange] = useState<ExchangeDetectionResult | null>(null);
  const [needsMapping, setNeedsMapping] = useState(false);
  const { toast } = useToast();

  const analysis = useMemo(() => {
    if (trades.length === 0) return null;
    return analyzeAllTrades(trades);
  }, [trades]);

  const handleFileUpload = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);
    setNeedsMapping(false);
    setDetectedExchange(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const userHeaders = results.meta.fields || [];
        const rawData = results.data as Record<string, string>[];

        // Detect exchange format
        const detection = detectExchange(userHeaders);
        setDetectedExchange(detection);

        if (detection.detected && detection.mapper) {
          // Known exchange format - auto-map
          const parsedTrades: CSVTrade[] = [];
          let parseErrors = 0;

          rawData.forEach((row) => {
            const trade = detection.mapper!(row);
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
              description: 'No valid trades found. Please ensure your CSV has the required columns.',
              variant: 'destructive'
            });
          } else {
            setTrades(parsedTrades);
            toast({
              title: `✨ ${detection.exchange.charAt(0).toUpperCase() + detection.exchange.slice(1)} Detected`,
              description: `Imported ${parsedTrades.length} trades${parseErrors > 0 ? ` (${parseErrors} rows skipped)` : ''}`,
            });
          }
          setIsLoading(false);
        } else {
          // Unknown format - needs manual mapping
          tradeDataStore.setRawDataForMapping(rawData, userHeaders);
          setNeedsMapping(true);
          setIsLoading(false);
          toast({
            title: 'Unknown Format',
            description: 'Please map your CSV columns to continue.',
          });
        }
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
    setDetectedExchange(null);
    setNeedsMapping(false);
    tradeDataStore.clearRawData();
  }, []);

  return {
    trades,
    analysis,
    isLoading,
    error,
    fileName,
    detectedExchange,
    needsMapping,
    handleFileUpload,
    setTrades,
    clearData
  };
}
