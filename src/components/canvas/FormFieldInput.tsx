import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { FormField } from '@/types/app';

interface FormFieldInputProps {
  field: FormField;
  zoom: number;
  onValueChange: (fieldId: string, value: string) => void;
}

export function FormFieldInput({ field, zoom, onValueChange }: FormFieldInputProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: field.x * zoom,
    top: field.y * zoom,
    width: field.width * zoom,
    height: field.height * zoom,
    zIndex: 100,
  };

  switch (field.type) {
    case 'text':
      return (
        <div style={style} className="flex items-center gap-1">
          <span
            className="shrink-0 text-muted-foreground"
            style={{ fontSize: 10 * zoom }}
          >
            {field.label}:
          </span>
          <Input
            value={field.value}
            onChange={(e) => onValueChange(field.id, e.target.value)}
            className="h-full border-blue-400 bg-blue-50/80 text-foreground"
            style={{ fontSize: 11 * zoom }}
            placeholder={field.label}
          />
        </div>
      );

    case 'checkbox':
      return (
        <label style={style} className="flex cursor-pointer items-center gap-1">
          <input
            type="checkbox"
            checked={field.value === 'true'}
            onChange={(e) => onValueChange(field.id, String(e.target.checked))}
            className="size-4 accent-blue-500"
            style={{ width: field.width * zoom, height: field.height * zoom }}
          />
          <span
            className="text-muted-foreground"
            style={{ fontSize: 10 * zoom, whiteSpace: 'nowrap' }}
          >
            {field.label}
          </span>
        </label>
      );

    case 'radio':
      return (
        <label style={style} className="flex cursor-pointer items-center gap-1">
          <input
            type="radio"
            name={field.group}
            checked={field.value === 'true'}
            onChange={() => onValueChange(field.id, 'true')}
            className="size-4 accent-blue-500"
            style={{ width: field.width * zoom, height: field.height * zoom }}
          />
          <span
            className="text-muted-foreground"
            style={{ fontSize: 10 * zoom, whiteSpace: 'nowrap' }}
          >
            {field.label}
          </span>
        </label>
      );

    case 'dropdown':
      return (
        <div style={style} className="flex items-center gap-1">
          <span
            className="shrink-0 text-muted-foreground"
            style={{ fontSize: 10 * zoom }}
          >
            {field.label}:
          </span>
          <Select value={field.value} onValueChange={(v) => onValueChange(field.id, v)}>
            <SelectTrigger
              className="h-full border-blue-400 bg-blue-50/80"
              style={{ fontSize: 11 * zoom }}
            >
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
  }
}
