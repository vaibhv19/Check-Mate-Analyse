import { AlertCircle } from 'lucide-react';

interface ParserExceptionBannerProps {
  error?: string | null;
  syntaxErrors?: string[];
}

export default function ParserExceptionBanner({
  error,
  syntaxErrors = [],
}: ParserExceptionBannerProps) {
  if (!error && syntaxErrors.length === 0) return null;

  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 flex items-start gap-2.5 text-destructive animate-in slide-in-from-top-2 duration-200 w-full">
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="text-xs space-y-1">
        <p className="font-semibold">{error || 'Syntax errors detected:'}</p>
        {syntaxErrors.length > 0 && (
          <ul className="list-disc pl-4 space-y-0.5">
            {syntaxErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
