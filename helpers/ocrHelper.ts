// helpers/ocrHelper.ts
import fs from 'fs';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import type { Locator } from '@playwright/test';

export type CropDef = { leftPct: number; topPct: number; widthPct: number; heightPct: number; };

/**
 * Capture the canvas element as a PNG Buffer using a Playwright Locator.
 * Use canvasLocator.screenshot() so we don't need frame.evaluate().
 */
export async function captureCanvasBuffer(canvasLocator: Locator): Promise<Buffer> {
  await canvasLocator.waitFor({ state: 'visible', timeout: 30000 });
  const buffer = await canvasLocator.screenshot({ type: 'png' });
  return buffer;
}

/**
 * Preprocess a crop from the canvas buffer.
 * cropDef uses percentages relative to the canvas image dimensions.
 */
export async function preprocessCrop(buffer: Buffer, cropDef: CropDef, outName?: string): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const canvasWidth = meta.width ?? 0;
  const canvasHeight = meta.height ?? 0;
  if (!canvasWidth || !canvasHeight) throw new Error('Unable to determine canvas dimensions');

  const left = Math.round(cropDef.leftPct * canvasWidth);
  const top = Math.round(cropDef.topPct * canvasHeight);
  const width = Math.round(cropDef.widthPct * canvasWidth);
  const height = Math.round(cropDef.heightPct * canvasHeight);

  const safeLeft = Math.max(0, Math.min(left, canvasWidth - 1));
  const safeTop = Math.max(0, Math.min(top, canvasHeight - 1));
  const safeWidth = Math.max(1, Math.min(width, canvasWidth - safeLeft));
  const safeHeight = Math.max(1, Math.min(height, canvasHeight - safeTop));

  const processed = await sharp(buffer)
    .extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight })
    .resize({ width: safeWidth * 2, height: safeHeight * 2 })
    .grayscale()
    .normalise()
    .threshold(160)
    .toBuffer();

  if (outName) {
    try { fs.writeFileSync(`${outName}_proc.png`, processed); } catch { /* ignore */ }
  }

  return processed;
}

/**
 * Run Tesseract OCR on a preprocessed image buffer.
 * Returns raw OCR text.
 */
export async function runOcr(buffer: Buffer): Promise<string> {
  const { data } = await Tesseract.recognize(buffer, 'eng', {
    logger: () => { /* silent by default */ }
  });
  return data.text;
}

/**
 * Parse money-like strings from OCR output into normalized numeric string.
 * Returns null if nothing parseable.
 */
export function parseMoney(text: string | null | undefined): string | null {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return null;
  // If both dot and comma present, assume dot is decimal separator -> remove commas
  if (cleaned.includes('.') && cleaned.includes(',')) return cleaned.replace(/,/g, '');
  // If only commas present and multiple commas, remove commas (thousand separators)
  const commaCount = (cleaned.match(/,/g) || []).length;
  if (commaCount > 0 && !cleaned.includes('.')) return cleaned.replace(/,/g, '');
  return cleaned;
}
