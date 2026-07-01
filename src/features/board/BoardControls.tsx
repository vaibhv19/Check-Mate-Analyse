import { ChevronsLeft, ChevronLeft, Play, Pause, ChevronRight, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoardControlsProps {
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onPlayToggle: () => void;
  isPlaying: boolean;
  isFirstDisabled?: boolean;
  isLastDisabled?: boolean;
}

export default function BoardControls({
  onFirst,
  onPrev,
  onNext,
  onLast,
  onPlayToggle,
  isPlaying,
  isFirstDisabled = false,
  isLastDisabled = false,
}: BoardControlsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2 w-full max-w-[480px]">
      {/* First Move */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onFirst}
        disabled={isFirstDisabled}
        title="First Move"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
      >
        <ChevronsLeft className="h-5 w-5" />
      </Button>

      {/* Previous Move */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={isFirstDisabled}
        title="Previous Move"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Play / Pause Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={onPlayToggle}
        title={isPlaying ? 'Pause Autoplay' : 'Start Autoplay'}
        className="h-9 w-9 border-border bg-background text-foreground hover:bg-muted"
      >
        {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="h-4.5 w-4.5 fill-current ml-0.5" />}
      </Button>

      {/* Next Move */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={isLastDisabled}
        title="Next Move"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Last Move */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onLast}
        disabled={isLastDisabled}
        title="Last Move"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
      >
        <ChevronsRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
