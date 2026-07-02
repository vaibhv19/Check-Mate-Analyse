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
      <main className="flex-1 p-4 md:p-6">
        <div className="grid w-full gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          
          {/* Column 1 & 2: Chessboard & Analytics (occupies 3 columns on large screens) */}
          <div className="flex flex-col gap-4 md:gap-6 md:col-span-2 lg:col-span-3">
            {/* Chessboard & Controls Container */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm min-h-[420px] md:min-h-[500px] lg:min-h-[600px]">
              {boardContent || (
                <div className="flex flex-col items-center justify-center gap-4 text-center h-full w-full">
                  <div className="aspect-square w-full max-w-[480px] rounded-lg border-2 border-dashed border-muted bg-muted/20 flex items-center justify-center text-muted-foreground">
                    Chessboard Container
                  </div>
                  <div className="h-10 w-full max-w-[480px] rounded-lg bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
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

          {/* Column 3: Move List Panel & Engine info */}
          <div className="flex flex-col gap-4 md:gap-6 md:col-span-1 md:h-full">
            {/* Move List Container */}
            <div className="flex-1 flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm min-h-[300px] md:min-h-0">
              <h3 className="text-sm font-semibold border-b border-border pb-2 mb-2 flex items-center justify-between">
                <span>Move Log</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {pliesCount} {pliesCount === 1 ? 'Ply' : 'Plies'}
                </span>
              </h3>
              <div className="flex-1 min-h-0 min-w-0 overflow-y-auto">
                {moveListContent || (
                  <div className="w-full h-full rounded-lg border border-dashed border-muted bg-muted/10 flex items-center justify-center text-xs text-muted-foreground p-4">
                    No Game Loaded. Paste PGN to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Engine Analysis Panel */}
            <div className="h-48 shrink-0 flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Engine Recommendations (Multi-PV)
              </h3>
              <div className="flex-1 min-h-0 min-w-0">
                {engineContent || (
                  <div className="w-full h-full rounded-lg border border-dashed border-muted bg-muted/10 flex flex-col gap-2 p-3 text-xs text-muted-foreground justify-center items-center">
                    <span>Engine Idle</span>
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
