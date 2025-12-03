import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CSVUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  fileName: string | null;
  error: string | null;
  onClear: () => void;
}

export function CSVUploader({ onFileUpload, isLoading, fileName, error, onClear }: CSVUploaderProps) {
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
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{fileName}</p>
                <p className="text-sm text-muted-foreground">File loaded successfully</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClear}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/30",
            isLoading && "opacity-50 cursor-not-allowed",
            error && "border-destructive"
          )}
        >
          <input {...getInputProps()} />
          
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-muted-foreground">Parsing CSV file...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive mb-1">Upload Failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onClear(); }}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  {isDragActive ? "Drop your CSV file here" : "Upload Trade History CSV"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to select
                </p>
              </div>
              <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-4 py-2">
                Required columns: Date, Market, Side, Closed PnL, Fee, Role, Type
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
