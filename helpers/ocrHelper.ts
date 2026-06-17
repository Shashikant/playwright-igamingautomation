// helpers/ocrHelper.ts
import fs from 'fs';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import type { Page } from '@playwright/test';

// Fix #9: Single source of truth for strategies
const OCR_STRATEGIES = [
  'gray',
  'normalize',
  'sharpen',
  'threshold100',
  'threshold140',
  'threshold180',
  'invert',
  'invertSharpen'
] as const;

type OcrStrategy = (typeof OCR_STRATEGIES)[number];

const OCR_TIMEOUT_MS = 15_000;

export type CropDef = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
};

export type OcrResult = {
  text: string;
  confidence: number;
  strategy: OcrStrategy | string;
};

// ---------------------------------------------------------------------------
// Canvas Capture
// ---------------------------------------------------------------------------

export async function captureCanvasBuffer(page: Page): Promise<Buffer> {
  const frame = page.frameLocator('#gamefileEmbed1');
  const canvas = frame.locator('canvas');

  await canvas.waitFor({ state: 'visible', timeout: 10_000 });

  return await canvas.screenshot({ type: 'png' });
}

// ---------------------------------------------------------------------------
// Crop Calculation
// ---------------------------------------------------------------------------

function calculateCrop(
  cropDef: CropDef,
  canvasWidth: number,
  canvasHeight: number
) {
  const left   = Math.round(cropDef.leftPct   * canvasWidth);
  const top    = Math.round(cropDef.topPct    * canvasHeight);
  const width  = Math.round(cropDef.widthPct  * canvasWidth);
  const height = Math.round(cropDef.heightPct * canvasHeight);

  return {
    left:   Math.max(0, Math.min(left,   canvasWidth  - 1)),
    top:    Math.max(0, Math.min(top,    canvasHeight - 1)),
    width:  Math.max(1, Math.min(width,  canvasWidth  - left)),
    height: Math.max(1, Math.min(height, canvasHeight - top))
  };
}

// ---------------------------------------------------------------------------
// Image Pre-processing
// Fix #2: Accept Buffer instead of sharp.Sharp to avoid consuming a piped instance.
// Fix #6: Unknown strategy throws instead of silently falling back.
// ---------------------------------------------------------------------------

async function buildImage(
  buffer: Buffer,
  strategy: OcrStrategy
): Promise<Buffer> {
  const base = () => sharp(buffer).resize({ width: 1200 }).grayscale();

  switch (strategy) {
    case 'gray':
      return base().toBuffer();

    case 'normalize':
      return base().normalise().toBuffer();

    case 'sharpen':
      return base().normalise().sharpen().toBuffer();

    case 'threshold100':
      return base().normalise().threshold(100).toBuffer();

    case 'threshold140':
      return base().normalise().threshold(140).toBuffer();

    case 'threshold180':
      return base().normalise().threshold(180).toBuffer();

    case 'invert':
      return base().negate().normalise().toBuffer();

    case 'invertSharpen':
      return base().negate().normalise().sharpen().toBuffer();

    default: {
      const _exhaustive: never = strategy;
      throw new Error('Unknown OCR strategy: ' + _exhaustive);
    }
  }
}

// Fix #1: Extract crop once into a Buffer so every strategy starts from the
// same raw data. The old dead `baseImage` Sharp variable is removed.
export async function preprocessCrop(
  buffer: Buffer,
  cropDef: CropDef,
  debugPrefix?: string
): Promise<Buffer[]> {
  const meta = await sharp(buffer).metadata();

  const canvasWidth  = meta.width  ?? 0;
  const canvasHeight = meta.height ?? 0;

  if (!canvasWidth || !canvasHeight) {
    throw new Error('Unable to determine canvas dimensions');
  }

  const crop = calculateCrop(cropDef, canvasWidth, canvasHeight);

  // Extract once to a Buffer; no Sharp instance is reused across strategies.
  const cropBuffer = await sharp(buffer).extract(crop).toBuffer();

  if (debugPrefix) {
    // Fix #8: async write to avoid blocking the event loop
    await fs.promises.writeFile(debugPrefix + '_rawCrop.png', cropBuffer);
  }

  const processedImages: Buffer[] = [];

  for (const strategy of OCR_STRATEGIES) {
    const img = await buildImage(cropBuffer, strategy);
    processedImages.push(img);

    if (debugPrefix) {
      await fs.promises.writeFile(debugPrefix + '_' + strategy + '.png', img);
    }
  }

  return processedImages;
}

// ---------------------------------------------------------------------------
// OCR
// Fix #5: Use Tesseract.WorkerOptions instead of `any`.
// Fix #7: Wrap recognize() in a timeout guard.
// ---------------------------------------------------------------------------

export async function runOcr(
  buffer: Buffer,
  strategy: string,
  numericOnly: boolean = false
): Promise<OcrResult> {
  const config: Partial<Tesseract.WorkerOptions> = {};

  if (numericOnly) {
    // tessedit_char_whitelist is a valid Tesseract param not yet in the typings
    (config as Record<string, unknown>)['tessedit_char_whitelist'] = '0123456789.,';
  }

  const recognizePromise = Tesseract.recognize(buffer, 'eng', config);

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(
        'OCR timed out after ' + OCR_TIMEOUT_MS + 'ms [strategy=' + strategy + ']'
      )),
      OCR_TIMEOUT_MS
    )
  );

  const { data } = await Promise.race([recognizePromise, timeoutPromise]);

  return {
    text:       data.text.trim(),
    confidence: data.confidence,
    strategy
  };
}

// Fix #3: strategy label is derived from the shared OCR_STRATEGIES constant
//         so it can never drift out of sync with preprocessCrop.
// Fix #10: Early-exit when confidence >= 90 to save time in CI runs.
export async function getBestOcrResult(
  processedImages: Buffer[],
  numericOnly: boolean = false
): Promise<OcrResult> {
  const results: OcrResult[] = [];

  for (let i = 0; i < processedImages.length; i++) {
    const strategy = OCR_STRATEGIES[i];
    const result   = await runOcr(processedImages[i], strategy, numericOnly);

    results.push(result);
    console.log('[OCR] ' + result.strategy + ' | confidence=' + result.confidence + ' | text="' + result.text + '"');

    // Fix #10: skip remaining strategies if confidence is already high
    if (result.confidence >= 95 && result.text.length > 0) {
      console.log('[OCR] Early exit on high-confidence result (strategy=' + result.strategy + ')');
      return result;
    }
  }

  results.sort((a, b) => b.confidence - a.confidence);
  return results[0];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function readTextFromCrop(
  canvasBuffer: Buffer,
  cropDef: CropDef,
  numericOnly: boolean = false,
  debugPrefix?: string
): Promise<OcrResult> {
  const processedImages = await preprocessCrop(canvasBuffer, cropDef, debugPrefix);
  return await getBestOcrResult(processedImages, numericOnly);
}

// ---------------------------------------------------------------------------
// Money Parsing
// Fix #4: Validates that commas appear only in thousands-position before
//         stripping. EU format (1.234,56) is also handled correctly.
// ---------------------------------------------------------------------------

export function parseMoney(text: string | null | undefined): string | null {
  if (!text) return null;

  const cleaned = text.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return null;

  // Both separators present — determine which is the decimal separator
  if (cleaned.includes('.') && cleaned.includes(',')) {
    const dotIndex   = cleaned.lastIndexOf('.');
    const commaIndex = cleaned.lastIndexOf(',');

    if (commaIndex > dotIndex) {
      // EU format: 1.234,56 -> 1234.56
      return cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,234.56 -> 1234.56
      return cleaned.replace(/,/g, '');
    }
  }

  // Only commas — validate thousands-position before stripping
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    const parts = cleaned.split(',');

    const isValidThousands =
      parts[0].length >= 1 &&
      parts[0].length <= 3 &&
      parts.slice(1).every(p => p.length === 3);

    if (isValidThousands) {
      return parts.join('');
    }

    // Commas not in thousands-position — return as-is
    return cleaned;
  }

  return cleaned;
}