import React, { useState } from 'react';
import { Upload, Clipboard, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ParserExceptionBanner from './ParserExceptionBanner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface LandingFormProps {
  onLoadPgn: (pgn: string) => void;
  onLoadSample: () => void;
  error?: string | null;
  syntaxErrors?: string[];
}

export default function LandingForm({
  onLoadPgn,
  onLoadSample,
  error,
  syntaxErrors = [],
}: LandingFormProps) {
  const [pgnInput, setPgnInput] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pgnInput.trim()) {
      onLoadPgn(pgnInput);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.pgn')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text) {
            setPgnInput(text);
            onLoadPgn(text);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setPgnInput(text);
          onLoadPgn(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl border-border bg-card shadow-2xl animate-in fade-in-50 zoom-in-95 duration-250">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            CheckMate Analyze
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1.5">
            Upload or paste a Portable Game Notation (PGN) file to begin your deep chess analysis.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Paste PGN area */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                placeholder="Paste your raw PGN text here... e.g.&#10;1. e4 e5 2. Nf3 Nc6 3. Bb5..."
                className="w-full h-44 rounded-lg border border-border bg-background/50 p-4 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-all resize-none shadow-inner"
              />
              {pgnInput && (
                <Button
                  type="submit"
                  size="sm"
                  className="absolute bottom-3 right-3 shadow-md"
                >
                  Analyze Moves
                </Button>
              )}
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-3 text-xs uppercase tracking-widest text-muted-foreground/60">
              or
            </span>
          </div>

          {/* Drag & Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative group rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-muted-foreground bg-muted/10 hover:bg-muted/20'
            }`}
          >
            <input
              type="file"
              accept=".pgn"
              onChange={handleFileChange}
              id="file-upload"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-background p-2.5 shadow-sm border border-border text-muted-foreground group-hover:text-foreground transition-all">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drag and drop your <span className="text-primary">.pgn</span> file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse local files
                </p>
              </div>
            </div>
          </div>

          {/* Validation Error Banner */}
          <ParserExceptionBanner error={error} syntaxErrors={syntaxErrors} />
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-4 bg-muted/20 rounded-b-xl">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clipboard className="h-4 w-4" />
            <span>Ready for standard PGN formats</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadSample}
            className="flex items-center gap-1.5 border-border text-foreground hover:bg-muted font-medium"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Load Sample Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
