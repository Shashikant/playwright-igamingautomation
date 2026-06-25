// pages/GamePage.ts
import type { Page } from '@playwright/test';
import { captureCanvasBuffer, preprocessCrop, parseMoney, CropDef, readTextFromCrop, readDarkPanelText } from '../helpers/ocrHelper';
import { pixelsToCropPercent } from '../utils/cropHelper';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs';

export class GamePage {
  readonly page: Page;
  readonly iframeSelector = '#fancybox__iframe_1_0';
  readonly playLinkSelector = '//a[contains(text(),"Play Demo")]';
  

  // // percent-based crops tuned for Balance and Total bet (adjust if needed)
  // readonly balanceCrop: CropDef = { leftPct: 0.04, topPct: 0.86, widthPct: 0.30, heightPct: 0.10 };
  // readonly totalBetCrop: CropDef = { leftPct: 0.34, topPct: 0.86, widthPct: 0.30, heightPct: 0.10 };

  // // spin button percent coords relative to canvas (adjust if needed)
  // readonly spinPct = { xPct: 0.87, yPct: 0.90 };

  constructor(page: Page) {
    this.page = page;
  }

  async openGame() {
    await this.page.goto('', { waitUntil: 'networkidle' });
    //Make Full Screen
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.locator('//a[contains(text(),"I am 18 years or older")]').click();
    await this.page.locator('//span[contains(text(),"Demo")]').nth(1).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('//div[@class="game-card__view-tooltip-wrapper"]//span[contains(text(),"Play on Desktop")]').nth(1).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('//button[@id="onetrust-reject-all-handler"]').click();
    await canvas.screenshot({ path: 'resources/screenshots/IntroScreen.png', type: 'png' });
    await canvas.click({ button: 'left', position: { x: 471, y: 313 }, force: true });
    await this.page.waitForTimeout(2000);
    await canvas.screenshot({ path: 'resources/screenshots/InitalGameUI.png', type: 'png' });
    await canvas.click({ button: 'left', position: { x: 617, y: 579 }, force: true });
    await this.page.waitForTimeout(2000);
    await canvas.screenshot({ path: 'resources/screenshots/MainGameUI.png', type: 'png' });
    const box = await canvas.boundingBox();
    console.log(box);
    await this.page.waitForTimeout(1000);
  }

  // Click the SPIN button by computing absolute coords from canvas bounding box.
  async clickSpin() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({ button: 'left', position: { x: 1080, y: 300 }, force: true });
    //await this.page.waitForTimeout(1000);
  }

  async hoverInfo() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.hover({ position: { x: 200, y: 560 }, force: true });
    await this.page.waitForTimeout(1000);
  }

  async clickPaytableIcon() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({ position: { x: 200, y: 560 }, force: true });
    await this.page.waitForTimeout(1000);
    //await canvas.screenshot({ path: 'resources/screenshots/paytable-screen.png', type: 'png' });
  }

  async clickHelpIcon() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({ position: { x: 200, y: 525 }, force: true });
    await this.page.waitForTimeout(1000);
    //await canvas.screenshot({ path: 'resources/screenshots/help-screen.png', type: 'png' });
  }

  async clickBetSettingsButton() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({ position: { x: 1085, y: 393 }, force: true });
    await this.page.waitForTimeout(1000);
    await canvas.screenshot({ path: 'resources/screenshots/betOptions-screen.png', type: 'png' });
  }

  async getbetOptionsFromUI(): Promise<string[] | null> {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await canvas.hover({ position: { x: 420, y: 400 }, force: true });

    await this.page.waitForTimeout(1000);
    // await this.page.mouse.wheel(0, -300); // Scroll up to reveal more bet options
    const canvasBounds = await frame.locator('canvas').boundingBox();
    const canvasWidth = canvasBounds?.width ?? 1280;
    const canvasHeight = canvasBounds?.height ?? 610;
    const canvasBuffer = await captureCanvasBuffer(this.page);
    const betOcrResult = await readDarkPanelText(
      canvasBuffer,
      pixelsToCropPercent(325, 260, 590, 270, canvasWidth, canvasHeight),
      'resources/screenshots/betOption1-area'
    );
    const values1 = betOcrResult.split(/\s+/)                // split on whitespace
    .map(t => t.replace(/[^0-9.]/g, "")) // keep only digits and dot
    .filter(t => t.length > 0)   // remove empties
    .map(v => parseFloat(v).toFixed(2));;
    const sortedUiBets = [...values1].sort((a, b) => parseFloat(a) - parseFloat(b));
    console.log('[GamePage] getBetOptionsFromUI:', sortedUiBets);
    return sortedUiBets;
  }

  async getInitialBalanceFromUI(): Promise<string | null> {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    const canvasBounds = await frame.locator('canvas').boundingBox();
    const canvasWidth = canvasBounds?.width ?? 1280;
    const canvasHeight = canvasBounds?.height ?? 610;
    const canvasBuffer = await captureCanvasBuffer(this.page);
    const initBalanceOcrResult = await readDarkPanelText(
      canvasBuffer,
      pixelsToCropPercent(210, 595, 200, 28, canvasWidth, canvasHeight),
      'resources/screenshots/initial-balance-area'
    );
    const balance = Array.isArray(initBalanceOcrResult)
      ? initBalanceOcrResult[0]
      : initBalanceOcrResult;
    console.log('UI Balance:', balance);

    const filteredBalances = balance
      .split(/\s+/)
      .map((v: string) => v.replace(/[^0-9.]/g, '').trim())
      .filter((v: string) => /^\d+\.\d{2}$/.test(v));
    const initalBalance = Number(filteredBalances[0]).toFixed(2);

    console.log('[GamePage] getInitialBalanceFromUI:', initalBalance);
    return initalBalance ?? null;  // ✅ return first match, not the array
  }

  async getInitialBetFromUI(): Promise<string | null> {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    const canvasBounds = await frame.locator('canvas').boundingBox();
    const canvasWidth = canvasBounds?.width ?? 1280;
    const canvasHeight = canvasBounds?.height ?? 610;
    const canvasBuffer = await captureCanvasBuffer(this.page);
    const initBetOcrResult = await readDarkPanelText(
      canvasBuffer,
      pixelsToCropPercent(845, 595, 140, 28, canvasWidth, canvasHeight),
      'resources/screenshots/initial-bet-area'
    );
    const bet = Array.isArray(initBetOcrResult)
      ? initBetOcrResult[0]
      : initBetOcrResult;
    console.log('UI Bet:', bet);

    const filteredBet = bet
      .split(/\s+/)
      .map((v: string) => v.replace(/[^0-9.]/g, '').trim())
      .filter((v: string) => /^\d+\.\d{2}$/.test(v));
    const defaultBet = Number(filteredBet[0]/20).toFixed(2);

    console.log('[GamePage] getInitialBetFromUI:', defaultBet);
    return defaultBet;  // ✅ return first match, not the array
  }

  async getTotalBetFromUI(): Promise<string[] | null> {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    const canvasBounds = await frame.locator('canvas').boundingBox();
    const canvasWidth = canvasBounds?.width ?? 1280;
    const canvasHeight = canvasBounds?.height ?? 610;
    const canvasBuffer = await captureCanvasBuffer(this.page);
    const initBetOcrResult = await readDarkPanelText(
      canvasBuffer,
      pixelsToCropPercent(347, 540, 140, 62, canvasWidth, canvasHeight),
      'resources/screenshots/total-bet-area'
    );
    const totalbet = Array.isArray(initBetOcrResult)
      ? initBetOcrResult[0]
      : initBetOcrResult;
    console.log('UI Total Bet:', totalbet);

    const filteredBet = totalbet
      .split(/\s+/)
      .map((v: string) => v.replace(/[^0-9.]/g, '').trim())
      .filter((v: string) => /^\d+\.\d{2}$/.test(v));

    console.log('[GamePage] getTotalBetFromUI:', filteredBet);
    return filteredBet[0] ?? null;  // ✅ return first match, not the array
  }

  async captureRegion(
    fileName: string,
    clip: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) {
    await this.page.screenshot({
      path: fileName,
      clip
    });
  }


  async muteSound() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({ position: { x: 1104, y: 16 }, force: true });
    await this.page.waitForTimeout(1000);
    //await canvas.screenshot({ path: 'resources/screenshots/help-screen.png', type: 'png' });
  }

  async clickAutoplayButton() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({ position: { x: 988, y: 577 }, force: true });
    await this.page.waitForTimeout(1000);
    //await canvas.screenshot({ path: 'resources/screenshots/autplay-control-screen.png', type: 'png' });
  }


  async compareWithBaseline(
    actualBuffer: Buffer,          // cropped region buffer
    baselinePath: string,          // path to baseline PNG
    debugPrefix?: string,          // optional debug file prefix
    tolerance: number = 50         // default tolerance
  ): Promise<boolean> {
    const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
    const actualImg   = PNG.sync.read(actualBuffer);

    if (baselineImg.width !== actualImg.width || baselineImg.height !== actualImg.height) {
      throw new Error(`Image sizes differ: baseline=${baselineImg.width}x${baselineImg.height}, actual=${actualImg.width}x${actualImg.height}`);
    }

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
      fs.writeFileSync(debugPrefix + '_actual.png', actualBuffer);
    }

    console.log(`Mismatched pixels: ${mismatchedPixels}`);
    return mismatchedPixels <= tolerance;
  }
}

