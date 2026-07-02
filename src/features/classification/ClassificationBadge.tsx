import type { ClassificationType } from '@/types/state';
import { Check, Star, ThumbsUp, Book, HelpCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface ClassificationBadgeProps {
  type: ClassificationType;
}

export default function ClassificationBadge({ type }: ClassificationBadgeProps) {
  const config = {
    best: {
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: Check,
      label: 'Best',
    },
    excellent: {
      color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      icon: Star,
      label: 'Excellent',
    },
    good: {
      color: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
      icon: ThumbsUp,
      label: 'Good',
    },
    book: {
      color: 'bg-amber-600/10 text-amber-500 border-amber-600/20',
      icon: Book,
      label: 'Book',
    },
    forced: {
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: ArrowRight,
      label: 'Forced',
    },
    inaccuracy: {
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      icon: HelpCircle,
      label: 'Inaccuracy',
    },
    mistake: {
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      icon: AlertTriangle,
      label: 'Mistake',
    },
    blunder: {
      color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      icon: XCircle,
      label: 'Blunder',
    },
  }[type];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      title={config.label}
      className={`inline-flex items-center justify-center p-0.5 rounded border shrink-0 ${config.color}`}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
    </div>
  );
}
