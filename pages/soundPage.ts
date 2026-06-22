// pages/SoundPage.ts
import { Page, expect } from '@playwright/test';
import { captureCanvasBuffer, preprocessCrop, parseMoney, CropDef, readTextFromCrop, readDarkPanelText,cropCanvasRegion } from '../helpers/ocrHelper';
import { pixelsToCropPercent } from '../utils/cropHelper';
import { GamePage } from './gamePage';
import { PNG } from 'pngjs';
import fs from 'fs';
import pixelmatch from 'pixelmatch';


export class SoundPage {
    readonly page: Page;
    readonly iframeSelector = '#gamefileEmbed1';
    readonly playLinkSelector = '#game_link';
    readonly fullscreenToggle = '.games-box-header-switch.games-box-header-switch-fullscreen';

    constructor(page: Page) {
        this.page = page;
    }

   private soundIconCrop = { left: 1086, top: 1, width: 32, height: 32 };

  async captureSoundIcon(debugPrefix?: string): Promise<Buffer> {
    const canvasBuffer = await captureCanvasBuffer(this.page);
    return await cropCanvasRegion(canvasBuffer, this.soundIconCrop, debugPrefix);
  }

  async compareWithBaseline(baselinePath: string, debugPrefix?: string): Promise<boolean> {
    const actualBuffer = await this.captureSoundIcon(debugPrefix);

    const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
    const actualImg   = PNG.sync.read(actualBuffer);

    const { width, height } = baselineImg;
    const diff = new PNG({ width, height });

    const mismatchedPixels = pixelmatch(
      baselineImg.data,
      actualImg.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );

    if (debugPrefix) {
      fs.writeFileSync(debugPrefix + '_diff.png', PNG.sync.write(diff));
    }

    console.log(`Mismatched pixels: ${mismatchedPixels}`);
    return mismatchedPixels < 50; // allow small tolerance
  }
}