// helpers/ocrHelper.ts
import fs from 'fs';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import type { Page } from '@playwright/test';

// Single source of truth for strategies
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
// Crop Calculation (internal)
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
// Image Pre-processing (internal)
// ---------------------------------------------------------------------------

async function buildImage(
  buffer: Buffer,
  strategy: OcrStrategy
): Promise<Buffer> {
  const base = () => sharp(buffer).resize({ width: 1200 }).grayscale();

  switch (strategy) {
    case 'gray':          return base().toBuffer();
    case 'normalize':     return base().normalise().toBuffer();
    case 'sharpen':       return base().normalise().sharpen().toBuffer();
    case 'threshold100':  return base().normalise().threshold(100).toBuffer();
    case 'threshold140':  return base().normalise().threshold(140).toBuffer();
    case 'threshold180':  return base().normalise().threshold(180).toBuffer();
    case 'invert':        return base().negate().normalise().toBuffer();
    case 'invertSharpen': return base().negate().normalise().sharpen().toBuffer();
    default: {
      const _exhaustive: never = strategy;
      throw new Error('Unknown OCR strategy: ' + _exhaustive);
    }
  }
}

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
  const cropBuffer = await sharp(buffer).extract(crop).toBuffer();

  if (debugPrefix) {
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
// OCR Engine (generic - no game knowledge)
// ---------------------------------------------------------------------------

async function runOcr(
  buffer: Buffer,
  strategy: string,
  numericOnly: boolean = false
): Promise<OcrResult> {
  const config: Partial<Tesseract.WorkerOptions> = {};

  if (numericOnly) {
    (config as Record<string, unknown>)['tessedit_char_whitelist'] = '0123456789.';
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error('OCR timed out after ' + OCR_TIMEOUT_MS + 'ms [strategy=' + strategy + ']')),
      OCR_TIMEOUT_MS
    )
  );

  const { data } = await Promise.race([
    Tesseract.recognize(buffer, 'eng', config),
    timeoutPromise
  ]);

  return {
    text:       data.text.trim(),
    confidence: data.confidence,
    strategy
  };
}

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

    if (!numericOnly && result.confidence >= 95 && result.text.length > 0) {
      console.log('[OCR] Early exit on high-confidence result (strategy=' + result.strategy + ')');
      return result;
    }
  }

  if (numericOnly) {
    const countValid = (text: string) =>
      text.split(/\s+/).filter(v => /^\d+\.\d{2}$/.test(v.replace(/[^0-9.]/g, ''))).length;

    results.sort((a, b) => countValid(b.text) - countValid(a.text));
    console.log('[OCR] Best numeric strategy: ' + results[0].strategy);
  } else {
    results.sort((a, b) => b.confidence - a.confidence);
  }

  return results[0];
}

// ---------------------------------------------------------------------------
// Public API - generic text reader
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
// Public API - invert-only OCR for dark panel / light text
// Use this for any canvas panel with dark background and light text.
// Confirmed best strategy via debug image analysis (see resources/screenshots).
// ---------------------------------------------------------------------------

export async function readDarkPanelText(
  canvasBuffer: Buffer,
  cropDef: CropDef,
  debugPrefix?: string
): Promise<string> {
  const meta = await sharp(canvasBuffer).metadata();
  const canvasWidth  = meta.width  ?? 0;
  const canvasHeight = meta.height ?? 0;

  if (!canvasWidth || !canvasHeight) {
    throw new Error('Unable to determine canvas dimensions');
  }

  const crop = calculateCrop(cropDef, canvasWidth, canvasHeight);

  // Pipeline confirmed via debug image analysis:
  // 1. negate()    - flips dark panel to light background
  // 2. resize 2400 - more pixels per character improves digit accuracy
  // 3. threshold(160) - binarises to pure black/white, fixes 5 vs 2 misread
  //    (blur in grey images causes Tesseract to misread rounded-top 5 as 2)
  const processedBuffer = await sharp(canvasBuffer)
    .extract(crop)
    .resize({ width: 2400 })
    .grayscale()
    .negate()
    .threshold(160)
    .toBuffer();

  if (debugPrefix) {
    await fs.promises.writeFile(debugPrefix + '_darkPanel_invert.png', processedBuffer);
  }

  const config: Partial<Tesseract.WorkerOptions> = {};
  (config as Record<string, unknown>)['tessedit_char_whitelist'] = '0123456789.';
  (config as Record<string, unknown>)['tessedit_pageseg_mode']   = '6';

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error('OCR timed out after ' + OCR_TIMEOUT_MS + 'ms')),
      OCR_TIMEOUT_MS
    )
  );

  const { data } = await Promise.race([
    Tesseract.recognize(processedBuffer, 'eng', config),
    timeoutPromise
  ]);

  console.log('[readDarkPanelText] raw text: ' + data.text.trim());
  console.log('[readDarkPanelText] confidence: ' + data.confidence);

  return data.text.trim();
}

// ---------------------------------------------------------------------------
// Money Parsing
// ---------------------------------------------------------------------------

export function parseMoney(text: string | null | undefined): string | null {
  if (!text) return null;

  const cleaned = text.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return null;

  if (cleaned.includes('.') && cleaned.includes(',')) {
    const dotIndex   = cleaned.lastIndexOf('.');
    const commaIndex = cleaned.lastIndexOf(',');

    if (commaIndex > dotIndex) {
      return cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      return cleaned.replace(/,/g, '');
    }
  }

  if (cleaned.includes(',') && !cleaned.includes('.')) {
    const parts = cleaned.split(',');
    const isValidThousands =
      parts[0].length >= 1 &&
      parts[0].length <= 3 &&
      parts.slice(1).every(p => p.length === 3);

    if (isValidThousands) return parts.join('');
    return cleaned;
  }

  return cleaned;
}