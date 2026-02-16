import { useAppState } from '@/hooks/useAppState';

import { FormFieldInput } from './FormFieldInput';

interface FormFieldOverlayProps {
  pageId: string;
  zoom: number;
}

export function FormFieldOverlay({ pageId, zoom }: FormFieldOverlayProps) {
  const { formFields, isFormMode, setFormFieldValue } = useAppState();

  if (!isFormMode) return null;

  const pageFields = formFields.filter((f) => f.pageId === pageId);
  if (pageFields.length === 0) return null;

  return (
    <div className="pointer-events-auto absolute inset-0">
      {pageFields.map((field) => (
        <FormFieldInput
          key={field.id}
          field={field}
          zoom={zoom}
          onValueChange={setFormFieldValue}
        />
      ))}
    </div>
  );
}
