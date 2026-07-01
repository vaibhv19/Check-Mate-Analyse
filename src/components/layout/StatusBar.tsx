interface StatusBarProps {
  statusText?: string;
  engineDepth?: number;
  maxDepth?: number;
  nps?: number;
  gameLoaded?: boolean;
}

export default function StatusBar({
  statusText = 'Awaiting PGN Input',
  engineDepth = 0,
  maxDepth = 15,
  nps = 0,
  gameLoaded = false,
}: StatusBarProps) {
  const formattedNps = nps > 1000 ? `${(nps / 1000).toFixed(1)}k` : nps;

  return (
    <div className="flex h-full w-full items-center justify-between px-4 text-xs font-medium text-muted-foreground transition-all">
      {/* Left section: Game Load status indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full transition-all ${
            gameLoaded ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'
          }`}
        ></span>
        <span className="truncate max-w-[200px] sm:max-w-xs">{statusText}</span>
      </div>

      {/* Right section: Engine statistics */}
      <div className="flex items-center gap-4 divide-x divide-border">
        <div className="flex items-center gap-1.5 pl-4">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">NPS:</span>
          <span className="text-foreground">{formattedNps} n/s</span>
        </div>
        <div className="flex items-center gap-1.5 pl-4">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Depth:</span>
          <span className="text-foreground">
            {engineDepth}/{maxDepth}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 pl-4">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">RAM:</span>
          <span className="text-foreground">Local Only</span>
        </div>
      </div>
    </div>
  );
}
