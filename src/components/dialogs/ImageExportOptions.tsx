import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

import { DPI_OPTIONS, JPEG_QUALITY_DEFAULT } from '@/constants/dialogs';

interface DpiSelectProps {
  value: string;
  onChange: (value: string) => void;
}

function DpiSelect({ value, onChange }: DpiSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Resolution</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DPI_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function JpegOptions() {
  const [quality, setQuality] = useState(JPEG_QUALITY_DEFAULT);
  const [dpi, setDpi] = useState('300');
  const [exportAll, setExportAll] = useState(false);

  return (
    <div className="space-y-4 pt-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Quality</Label>
          <span className="text-sm text-muted-foreground">{quality}%</span>
        </div>
        <Slider
          value={[quality]}
          onValueChange={(v) => setQuality(v[0])}
          min={1}
          max={100}
          step={1}
        />
      </div>

      <DpiSelect value={dpi} onChange={setDpi} />

      <div className="flex items-center gap-2">
        <Checkbox
          id="jpeg-export-all"
          checked={exportAll}
          onCheckedChange={(v) => setExportAll(v === true)}
        />
        <Label htmlFor="jpeg-export-all" className="font-normal">Export all pages</Label>
      </div>
    </div>
  );
}

export function PngOptions() {
  const [dpi, setDpi] = useState('300');
  const [exportAll, setExportAll] = useState(false);

  return (
    <div className="space-y-4 pt-3">
      <DpiSelect value={dpi} onChange={setDpi} />

      <div className="flex items-center gap-2">
        <Checkbox
          id="png-export-all"
          checked={exportAll}
          onCheckedChange={(v) => setExportAll(v === true)}
        />
        <Label htmlFor="png-export-all" className="font-normal">Export all pages</Label>
      </div>
    </div>
  );
}
