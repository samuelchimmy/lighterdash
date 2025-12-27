import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExchangeDetectionResult } from '@/lib/exchangeMappings';

interface CSVUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  fileName: string | null;
  error: string | null;
  onClear: () => void;
  detectedExchange?: ExchangeDetectionResult | null;
}

const exchangeLabels: Record<string, { name: string; color: string }> = {
  lighter: { name: 'Lighter', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  nado: { name: 'Nado', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  hyperliquid: { name: 'Hyperliquid', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
};

export function CSVUploader({ 
  onFileUpload, 
  isLoading, 
  fileName, 
  error, 
  onClear,
  detectedExchange 
}: CSVUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  if (fileName && !error) {
    const exchangeInfo = detectedExchange?.exchange && detectedExchange.exchange !== 'unknown' 
      ? exchangeLabels[detectedExchange.exchange] 
      : null;

    return (
      <Card className="bg-gradient-to-br from-card via-card to-profit/5 border-border/50 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-profit/10">
                <FileSpreadsheet className="w-4 h-4 text-profit" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-foreground">{fileName}</p>
                  {exchangeInfo && (
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", exchangeInfo.color)}>
                      <Sparkles className="w-2.5 h-2.5 mr-1" />
                      {exchangeInfo.name}
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">File loaded successfully</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClear} className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm">
      <CardContent className="p-3">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-200",
            isDragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-secondary/30",
            isLoading && "opacity-50 cursor-not-allowed",
            error && "border-destructive bg-destructive/5"
          )}
        >
          <input {...getInputProps()} />
          
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-[10px] text-muted-foreground">Detecting exchange format...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs font-medium text-destructive mb-0.5">Upload Failed</p>
                <p className="text-[10px] text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onClear(); }} className="h-6 text-[10px] px-2">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground mb-0.5">
                  {isDragActive ? "Drop your CSV file here" : "Upload Trade History CSV"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Drag & drop or click to select • Any exchange supported
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
                  Lighter
                </Badge>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-500/5 text-blue-500 border-blue-500/20">
                  Nado
                </Badge>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-purple-500/5 text-purple-500 border-purple-500/20">
                  Hyperliquid
                </Badge>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted text-muted-foreground border-border">
                  + Any CSV
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
