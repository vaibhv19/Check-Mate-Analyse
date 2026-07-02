import { Play, Pause } from 'lucide-react';

interface StatusBarProps {
  statusText?: string;
  engineDepth?: number;
  maxDepth?: number;
  nps?: number;
  gameLoaded?: boolean;
  openingName?: string;
  ecoCode?: string;
  engineStatus?: 'idle' | 'initializing' | 'analyzing' | 'error' | 'paused';
  isEngineEnabled?: boolean;
  onToggleEngine?: () => void;
}

export default function StatusBar({
  statusText = 'Awaiting PGN Input',
  engineDepth = 0,
  maxDepth = 15,
  nps = 0,
  gameLoaded = false,
  openingName,
  ecoCode,
  engineStatus = 'idle',
  isEngineEnabled = true,
  onToggleEngine,
}: StatusBarProps) {
  const formattedNps = nps > 1000 ? `${(nps / 1000).toFixed(1)}k` : nps;

  return (
    <div className="flex h-full w-full items-center justify-between px-4 text-xs font-medium text-muted-foreground transition-all">
      {/* Left section: Game Load status indicator and Openings */}
      <div className="flex items-center gap-2 overflow-hidden flex-1 mr-4">
        <span
          className={`h-2.5 w-2.5 rounded-full transition-all shrink-0 ${
            !gameLoaded
              ? 'bg-zinc-500'
              : !isEngineEnabled
              ? 'bg-amber-500 animate-pulse'
              : engineStatus === 'analyzing'
              ? 'bg-emerald-500 animate-pulse'
              : 'bg-emerald-600'
          }`}
        ></span>
        <span className="truncate max-w-[200px] sm:max-w-xs shrink-0">{statusText}</span>
        {openingName && (
          <span className="truncate border-l border-border pl-2 text-foreground font-semibold flex items-center gap-1.5 min-w-0">
            {ecoCode && (
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-mono tracking-wider">
                {ecoCode}
              </span>
            )}
            <span className="truncate">{openingName}</span>
          </span>
        )}
      </div>

      {/* Right section: Engine statistics */}
      <div className="flex items-center gap-4 divide-x divide-border">
        {gameLoaded && onToggleEngine && (
          <button
            onClick={onToggleEngine}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground cursor-pointer transition-all border border-border text-[10px] uppercase font-semibold tracking-wider font-sans shrink-0 hover:text-primary"
          >
            {isEngineEnabled ? (
              <>
                <Pause className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 text-emerald-500 fill-emerald-500 shrink-0" />
                <span>Analyze</span>
              </>
            )}
          </button>
        )}
        <div className="flex items-center gap-1.5 pl-4 shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">NPS:</span>
          <span className="text-foreground">{isEngineEnabled && gameLoaded ? `${formattedNps} n/s` : '—'}</span>
        </div>
        <div className="flex items-center gap-1.5 pl-4 shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Depth:</span>
          <span className="text-foreground">
            {isEngineEnabled && gameLoaded ? `${engineDepth}/${maxDepth}` : '—'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 pl-4 shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">RAM:</span>
          <span className="text-foreground">Local Only</span>
        </div>
      </div>
    </div>
  );
}
