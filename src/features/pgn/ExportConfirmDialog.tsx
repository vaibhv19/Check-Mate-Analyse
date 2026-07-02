import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  unevaluatedCount: number;
}

export default function ExportConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  unevaluatedCount,
}: ExportConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 animate-in scale-in duration-200">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-500 shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground leading-6">
              Partial Analysis Warning
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              There are <span className="font-semibold text-foreground">{unevaluatedCount}</span> moves in this game that have not been evaluated. Exporting now will only include annotations for the analyzed plies.
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="text-xs font-semibold px-4 py-2 bg-amber-500 text-black hover:bg-amber-400"
          >
            Proceed Export
          </Button>
        </div>
      </div>
    </div>
  );
}
