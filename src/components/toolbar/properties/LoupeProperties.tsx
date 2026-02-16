import { Search } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAppState } from '@/hooks/useAppState';

const MAGNIFICATION_OPTIONS = [1.5, 2, 3, 4, 5];

export function LoupeProperties() {
  const { loupeMagnification, setLoupeMagnification } = useAppState();

  return (
    <>
      <Search className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Loupe — hover on canvas</span>
      <Select
        value={String(loupeMagnification)}
        onValueChange={(v) => setLoupeMagnification(Number(v))}
      >
        <SelectTrigger className="h-7 w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MAGNIFICATION_OPTIONS.map((m) => (
            <SelectItem key={m} value={String(m)}>{m}x</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
