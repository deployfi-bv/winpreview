import { AlertTriangle } from 'lucide-react';

export function RedactionProperties() {
  return (
    <>
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <span className="text-xs text-destructive">
        Redaction permanently removes content when flattened
      </span>
    </>
  );
}
