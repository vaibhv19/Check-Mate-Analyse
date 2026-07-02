import { useWorkbenchState, useWorkbenchDispatch } from '@/context/WorkbenchContext';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function SandboxBanner() {
  const state = useWorkbenchState();
  const dispatch = useWorkbenchDispatch();

  if (!state.isSandbox) return null;

  return (
    <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-2.5 rounded-lg flex items-center justify-between text-xs font-medium gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-left">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
        <div>
          <span>Sandbox Mode Active</span>
          <span className="text-[10px] text-amber-500/60 block mt-0.5">
            Exploring alternative branch. Evaluations will update live.
          </span>
        </div>
      </div>
      <button
        onClick={() => dispatch({ type: 'EXIT_SANDBOX' })}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-amber-500 text-black hover:bg-amber-400 transition-all font-semibold cursor-pointer shrink-0 text-[10px] uppercase tracking-wider"
      >
        <RotateCcw className="h-3 w-3" strokeWidth={2.5} />
        Exit
      </button>
    </div>
  );
}
