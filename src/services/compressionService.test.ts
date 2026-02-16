import { beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateDownscale, canvasToBlob, compressPage, PRESETS } from './compressionService';

import type { PageData } from '@/types/page';

describe('compressionService', () => {
  describe('calculateDownscale', () => {
    it('returns 1 when page fits within maxDimension', () => {
      expect(calculateDownscale(1000, 1000, 1600)).toBe(1);
    });

    it('returns correct scale for oversized portrait page', () => {
      expect(calculateDownscale(3000, 4000, 1600)).toBe(0.4);
    });

    it('returns correct scale for oversized landscape page', () => {
      expect(calculateDownscale(2400, 1600, 1200)).toBe(0.5);
    });

    it('returns 1 when page is smaller than maxDimension', () => {
      expect(calculateDownscale(800, 600, 1200)).toBe(1);
    });
  });

  describe('PRESETS', () => {
    it('has correct targetKbPerPage for email preset', () => {
      expect(PRESETS.email.targetKbPerPage).toBe(200);
    });

    it('has correct targetKbPerPage for compact preset', () => {
      expect(PRESETS.compact.targetKbPerPage).toBe(100);
    });

    it('has correct targetKbPerPage for light preset', () => {
      expect(PRESETS.light.targetKbPerPage).toBe(150);
    });

    it('all presets have valid qualityRange', () => {
      for (const preset of Object.values(PRESETS)) {
        expect(preset.qualityRange[0]).toBeLessThan(preset.qualityRange[1]);
      }
    });

    it('all presets have positive maxDimension', () => {
      for (const preset of Object.values(PRESETS)) {
        expect(preset.maxDimension).toBeGreaterThan(0);
      }
    });
  });

  describe('canvasToBlob', () => {
    let mockCanvas: HTMLCanvasElement;

    beforeEach(() => {
      mockCanvas = {
        toBlob: vi.fn(),
      } as unknown as HTMLCanvasElement;
    });

    it('resolves with blob when toBlob succeeds', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      vi.mocked(mockCanvas.toBlob).mockImplementation((callback) => {
        callback?.(mockBlob);
      });

      const result = await canvasToBlob(mockCanvas, 'image/jpeg', 0.8);
      expect(result).toBe(mockBlob);
    });

    it('rejects when toBlob returns null', async () => {
      vi.mocked(mockCanvas.toBlob).mockImplementation((callback) => {
        callback?.(null);
      });

      await expect(canvasToBlob(mockCanvas, 'image/jpeg', 0.8)).rejects.toThrow('Canvas toBlob failed');
    });
  });

  describe('compressPage', () => {
    it('throws AbortError when signal is already aborted', async () => {
      const page: PageData = {
        id: 'test-1',
        originalIndex: 0,
        rotation: 0,
        flipH: false,
        flipV: false,
        width: 612,
        height: 792,
        sourceId: 'source-1',
        sourceFormat: 'pdf',
      };

      const abortedSignal = AbortSignal.abort();

      await expect(compressPage(page, PRESETS.email, abortedSignal)).rejects.toThrow('Aborted');
    });
  });
});
