import React from 'react';
import StatusBar from './StatusBar';
import { useWorkbenchState } from '../../context/WorkbenchContext';
import { HelpCircle } from 'lucide-react';

interface WorkbenchLayoutProps {
  boardContent?: React.ReactNode;
  moveListContent?: React.ReactNode;
  graphContent?: React.ReactNode;
  engineContent?: React.ReactNode;
  statusBarContent?: React.ReactNode;
  onOpenShortcuts?: () => void;
}

export default function WorkbenchLayout({
  boardContent,
  moveListContent,
  graphContent,
  engineContent,
  statusBarContent,
  onOpenShortcuts,
}: WorkbenchLayoutProps) {
  const state = useWorkbenchState();
  const pliesCount = state.isSandbox ? state.sandboxMoves.length : state.moves.length;

  return (
    <div className="flex min-h-screen w-screen flex-col bg-background text-foreground">
      {/* Header Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-primary">CheckMate Analyze</span>
          <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent">
            MVP v1.0
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Local Engine Ready</span>
          </div>
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts Guide (H)"
              className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 p-4 md:p-6 min-h-0">
        <div className="flex flex-col md:flex-row w-full gap-4 md:gap-6 items-stretch min-h-0">
          
          {/* Column 1 & 2: Chessboard & Analytics (occupies remaining space on large screens) */}
          <div className="flex flex-col gap-4 md:gap-6 flex-1 min-w-0">
            {/* Chessboard & Controls Container */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 md:p-4 shadow-sm min-h-0">
              {boardContent || (
                <div className="flex flex-col items-center justify-center gap-4 text-center h-full w-full">
                  <div className="aspect-square w-full max-w-[520px] rounded-lg border-2 border-dashed border-muted bg-muted/20 flex items-center justify-center text-muted-foreground">
                    Chessboard Container
                  </div>
                  <div className="h-10 w-full max-w-[520px] rounded-lg bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
                    Navigation Controls Placeholder
                  </div>
                </div>
              )}
            </div>

            {/* Evaluation Graph / Engine stats Section */}
            <div className="h-48 shrink-0 rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Evaluation Curve
              </h3>
              <div className="flex-1 min-h-0 min-w-0">
                {graphContent || (
                  <div className="w-full h-full rounded-lg border border-dashed border-muted bg-muted/10 flex items-center justify-center text-xs text-muted-foreground">
                    Evaluation Graph Placeholder
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Engine info & Move List Panel */}
          <div className="flex flex-col gap-4 md:gap-6 w-full md:w-[350px] lg:w-[380px] shrink-0 min-h-0">
            {/* Engine Analysis Panel */}
            <div className="h-55 shrink-0 flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Engine Recommendations (Multi-PV)
              </h3>
              <div className="flex-1 min-h-0 min-w-0 flex flex-col">
                {engineContent || (
                  <div className="w-full flex-1 rounded-lg border border-dashed border-muted bg-muted/10 flex flex-col gap-2 p-3 text-xs text-muted-foreground justify-center items-center">
                    <span>Engine Idle</span>
                  </div>
                )}
              </div>
            </div>

            {/* Move Log Container */}
            <div className="h-80 md:h-[604px] shrink-0 flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm min-h-0">
              <h3 className="text-sm font-semibold border-b border-border pb-2 mb-2 flex items-center justify-between">
                <span>Move Log</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {pliesCount} {pliesCount === 1 ? 'Ply' : 'Plies'}
                </span>
              </h3>
              <div className="flex-1 min-h-0 min-w-0 flex flex-col">
                {moveListContent || (
                  <div className="w-full flex-1 rounded-lg border border-dashed border-muted bg-muted/10 flex items-center justify-center text-xs text-muted-foreground p-4">
                    No Game Loaded. Paste PGN to get started.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 shrink-0 border-t border-border bg-card">
        {statusBarContent || <StatusBar />}
      </footer>
    </div>
  );
}
