import { describe, expect, it } from 'vitest';

import { cleanupOcrResult, fixCommonSubstitutions, fixUrlPatterns, flagLowConfidence } from '@/lib/ocrCleanup';

import type { OcrPageResult, OcrTextBox } from '@/types/ocr';

describe('fixCommonSubstitutions', () => {
  it('fixes 0 to O in word context', () => {
    expect(fixCommonSubstitutions('m0re')).toBe('mOre');
    expect(fixCommonSubstitutions('h0me')).toBe('hOme');
  });

  it('preserves standalone 0 in numbers', () => {
    expect(fixCommonSubstitutions('100')).toBe('100');
    expect(fixCommonSubstitutions('2023')).toBe('2023');
  });

  it('fixes pipe to l in word context', () => {
    expect(fixCommonSubstitutions('he|lo')).toBe('hello');
    expect(fixCommonSubstitutions('wor|d')).toBe('world');
  });

  it('fixes lowercase l to 1 in digit context', () => {
    expect(fixCommonSubstitutions('1l2')).toBe('112');
    expect(fixCommonSubstitutions('5l0')).toBe('510');
  });

  it('fixes standalone rn to m', () => {
    expect(fixCommonSubstitutions('rn')).toBe('m');
  });

  it('fixes rn to m in plausible word patterns', () => {
    // Pattern requires lowercase and vowel: [a-z]m[aeiour]
    expect(fixCommonSubstitutions('arnore')).toBe('amore');
    expect(fixCommonSubstitutions('trnue')).toBe('tmue'); // lowercase 't' + m + 'u' matches
  });

  it('preserves rn when it does not match m pattern', () => {
    const result = fixCommonSubstitutions('arnx');
    // Should not convert if pattern is implausible (no vowel after m)
    expect(result).toContain('rn');
  });
});

describe('fixUrlPatterns', () => {
  it('fixes htp:// to http://', () => {
    expect(fixUrlPatterns('htp://example.com')).toBe('http://example.com');
    expect(fixUrlPatterns('HTP://EXAMPLE.COM')).toBe('http://EXAMPLE.COM');
  });

  it('fixes htps:// to https://', () => {
    expect(fixUrlPatterns('htps://example.com')).toBe('https://example.com');
  });

  it('fixes nttps:// to https://', () => {
    expect(fixUrlPatterns('nttps://example.com')).toBe('https://example.com');
  });

  it('fixes ww. to www.', () => {
    expect(fixUrlPatterns('ww.example.com')).toBe('www.example.com');
    expect(fixUrlPatterns('WW.EXAMPLE.COM')).toBe('www.EXAMPLE.COM');
  });

  it('fixes .corn to .com', () => {
    expect(fixUrlPatterns('http://example.corn')).toBe('http://example.com');
    expect(fixUrlPatterns('example.corn')).toBe('example.com');
  });

  it('fixes .coni to .com', () => {
    expect(fixUrlPatterns('http://example.coni')).toBe('http://example.com');
  });

  it('fixes .orq to .org', () => {
    expect(fixUrlPatterns('http://example.orq')).toBe('http://example.org');
  });

  it('fixes .nef to .net', () => {
    expect(fixUrlPatterns('http://example.nef')).toBe('http://example.net');
  });

  it('removes spaces after protocol', () => {
    expect(fixUrlPatterns('http:// example.com')).toBe('http://example.com');
    expect(fixUrlPatterns('https://    example.com')).toBe('https://example.com');
  });

  it('removes spaces before dots in TLDs', () => {
    // Pattern: .\s+([a-z]{2,}) - matches space before TLD extension
    expect(fixUrlPatterns('example. com')).toBe('example.com');
    expect(fixUrlPatterns('site. org')).toBe('site.org');
  });

  it('preserves correct URLs', () => {
    expect(fixUrlPatterns('https://example.com')).toBe('https://example.com');
    expect(fixUrlPatterns('http://www.example.org')).toBe('http://www.example.org');
  });
});

describe('flagLowConfidence', () => {
  it('returns boxes below default threshold (0.7)', () => {
    const boxes: OcrTextBox[] = [
      { text: 'high', confidence: 0.9, bbox: { x: 0, y: 0, width: 50, height: 10 } },
      { text: 'low', confidence: 0.3, bbox: { x: 0, y: 10, width: 50, height: 10 } },
      { text: 'medium', confidence: 0.75, bbox: { x: 0, y: 20, width: 50, height: 10 } },
    ];
    const flagged = flagLowConfidence(boxes);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].text).toBe('low');
  });

  it('returns boxes below custom threshold', () => {
    const boxes: OcrTextBox[] = [
      { text: 'high', confidence: 0.95, bbox: { x: 0, y: 0, width: 50, height: 10 } },
      { text: 'medium', confidence: 0.8, bbox: { x: 0, y: 10, width: 50, height: 10 } },
      { text: 'low', confidence: 0.6, bbox: { x: 0, y: 20, width: 50, height: 10 } },
    ];
    const flagged = flagLowConfidence(boxes, 0.85);
    expect(flagged).toHaveLength(2);
    expect(flagged.map((b) => b.text)).toEqual(['medium', 'low']);
  });

  it('returns empty array when all boxes have high confidence', () => {
    const boxes: OcrTextBox[] = [
      { text: 'good', confidence: 0.95, bbox: { x: 0, y: 0, width: 50, height: 10 } },
      { text: 'great', confidence: 0.98, bbox: { x: 0, y: 10, width: 50, height: 10 } },
    ];
    const flagged = flagLowConfidence(boxes);
    expect(flagged).toHaveLength(0);
  });
});

describe('cleanupOcrResult', () => {
  it('applies substitution cleanup to text boxes', () => {
    const result: OcrPageResult = {
      pageId: 'test',
      language: 'latin',
      textBoxes: [
        { text: 'm0re', confidence: 0.8, bbox: { x: 0, y: 0, width: 50, height: 10 } },
        { text: 'he|lo', confidence: 0.9, bbox: { x: 50, y: 0, width: 50, height: 10 } },
      ],
      plainText: 'm0re he|lo',
      wordCount: 2,
      timestamp: Date.now(),
      status: 'completed',
    };
    const cleaned = cleanupOcrResult(result);
    expect(cleaned.textBoxes[0].text).toBe('mOre');
    expect(cleaned.textBoxes[1].text).toBe('hello');
  });

  it('applies URL cleanup to text boxes', () => {
    const result: OcrPageResult = {
      pageId: 'test',
      language: 'latin',
      textBoxes: [
        { text: 'htp://example.corn', confidence: 0.8, bbox: { x: 0, y: 0, width: 100, height: 10 } },
      ],
      plainText: 'htp://example.corn',
      wordCount: 1,
      timestamp: Date.now(),
      status: 'completed',
    };
    const cleaned = cleanupOcrResult(result);
    expect(cleaned.textBoxes[0].text).toBe('http://example.com');
  });

  it('rebuilds plainText from cleaned boxes', () => {
    const result: OcrPageResult = {
      pageId: 'test',
      language: 'latin',
      textBoxes: [
        { text: 'm0re', confidence: 0.8, bbox: { x: 0, y: 0, width: 50, height: 10 } },
        { text: 'text', confidence: 0.9, bbox: { x: 50, y: 0, width: 50, height: 10 } },
      ],
      plainText: 'm0re text',
      wordCount: 2,
      timestamp: Date.now(),
      status: 'completed',
    };
    const cleaned = cleanupOcrResult(result);
    expect(cleaned.plainText).toBe('mOre text');
  });

  it('recalculates word count', () => {
    const result: OcrPageResult = {
      pageId: 'test',
      language: 'latin',
      textBoxes: [
        { text: 'one two three', confidence: 0.8, bbox: { x: 0, y: 0, width: 100, height: 10 } },
      ],
      plainText: 'one two three',
      wordCount: 1, // Incorrect initial count
      timestamp: Date.now(),
      status: 'completed',
    };
    const cleaned = cleanupOcrResult(result);
    expect(cleaned.wordCount).toBe(3);
  });

  it('preserves immutability of original result', () => {
    const result: OcrPageResult = {
      pageId: 'test',
      language: 'latin',
      textBoxes: [
        { text: 'm0re', confidence: 0.8, bbox: { x: 0, y: 0, width: 50, height: 10 } },
      ],
      plainText: 'm0re',
      wordCount: 1,
      timestamp: Date.now(),
      status: 'completed',
    };
    const cleaned = cleanupOcrResult(result);
    // Original should be unchanged
    expect(result.textBoxes[0].text).toBe('m0re');
    expect(result.plainText).toBe('m0re');
    // Cleaned should be updated
    expect(cleaned.textBoxes[0].text).toBe('mOre');
    expect(cleaned.plainText).toBe('mOre');
  });

  it('handles empty text boxes', () => {
    const result: OcrPageResult = {
      pageId: 'test',
      language: 'latin',
      textBoxes: [],
      plainText: '',
      wordCount: 0,
      timestamp: Date.now(),
      status: 'completed',
    };
    const cleaned = cleanupOcrResult(result);
    expect(cleaned.textBoxes).toEqual([]);
    expect(cleaned.plainText).toBe('');
    expect(cleaned.wordCount).toBe(0);
  });
});
