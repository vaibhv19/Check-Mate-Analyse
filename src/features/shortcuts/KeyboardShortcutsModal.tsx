import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle off guide modal on Escape or H keypress
      if (e.key === 'Escape' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['←', 'A'], desc: 'Previous move navigation' },
    { keys: ['→', 'D'], desc: 'Next move navigation' },
    { keys: ['Space'], desc: 'Toggle autoplay moves' },
    { keys: ['Esc'], desc: 'Exit sandbox / Close modals' },
    { keys: ['H'], desc: 'Toggle shortcuts helper guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 animate-in scale-in duration-200">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2 text-primary">
            <Keyboard className="h-5 w-5" />
            <h3 className="text-sm font-bold text-foreground">Keyboard Shortcuts</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-border/10 last:border-0">
              <span className="text-muted-foreground">{s.desc}</span>
              <div className="flex items-center gap-1 shrink-0">
                {s.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-bold font-mono text-foreground shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            className="text-xs font-semibold px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
