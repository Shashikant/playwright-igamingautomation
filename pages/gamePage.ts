// pages/GamePage.ts
import type { Page } from '@playwright/test';
import { captureCanvasBuffer, preprocessCrop, parseMoney, CropDef, readTextFromCrop, readDarkPanelText } from '../helpers/ocrHelper';
import { pixelsToCropPercent } from '../utils/cropHelper';

export class GamePage {
  readonly page: Page;
  readonly iframeSelector = '#gamefileEmbed1';
  readonly playLinkSelector = '#game_link';
  readonly fullscreenToggle = '.games-box-header-switch.games-box-header-switch-fullscreen';

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
    await this.page.locator('#game_link').getByText('Play for Free').click();
    await this.page.locator('.games-box-header-switch.games-box-header-switch-fullscreen').click();

    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    await canvas.waitFor();
    await this.page.waitForTimeout(8000);
    await canvas.click({ button: 'left', position: { x: 640, y: 505 }, force: true });

    const box = await canvas.boundingBox();
    console.log(box);
    await this.page.waitForTimeout(1000);
  }

  // Click the SPIN button by computing absolute coords from canvas bounding box.
  async clickSpin() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({ button: 'left', position: { x: 1055, y: 575 }, force: true });
    //await this.page.waitForTimeout(1000);
  }

  async hoverInfo() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.hover({ position: { x: 200, y: 560 }, force: true });
    await this.page.waitForTimeout(1000);
  }

   async clickPaytableIcon() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({ position: { x: 200, y: 560 }, force: true });
    await this.page.waitForTimeout(1000);
    //await canvas.screenshot({ path: 'resources/screenshots/paytable-screen.png', type: 'png' });
  }

  async clickHelpIcon() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({ position: { x: 200, y: 525 }, force: true });
    await this.page.waitForTimeout(1000);
    //await canvas.screenshot({ path: 'resources/screenshots/help-screen.png', type: 'png' });
  }

  async clickTotalBet() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({ position: { x: 420, y: 575 }, force: true });
    await this.page.waitForTimeout(1000);
    //await canvas.screenshot({ path: 'resources/screenshots/betOptions-screen.png', type: 'png' });
  }

  async getbetOptionsFromUI(): Promise<string[] | null> {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
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
      pixelsToCropPercent(350, 90, 130, 455, canvasWidth, canvasHeight),
      'resources/screenshots/betOption1-area'
    );
    const values1 = betOcrResult
      .split(/\s+/)
      .map(v => v.replace(/[^0-9.]/g, '').trim())
      .filter(v => /^\d+\.\d{2}$/.test(v));
    await this.page.waitForTimeout(1000);
    await canvas.hover({ position: { x: 420, y: 400 }, force: true });
    await this.page.waitForTimeout(1000);
    await this.page.mouse.wheel(0, -300); // Scroll down to reveal below bet options
    await this.page.waitForTimeout(1000);
    const canvasBuffer2 = await captureCanvasBuffer(this.page);
    console.log('Before OCR');
    const betOcrResult2 = await readDarkPanelText(
      canvasBuffer2,
      pixelsToCropPercent(350, 90, 130, 455, canvasWidth, canvasHeight),
      'resources/screenshots/betOption2-area'
    );
    console.log('After OCR');
    const values2 = betOcrResult2
      .split(/\s+/)
      .map(v => v.replace(/[^0-9.]/g, '').trim())
      .filter(v => /^\d+\.\d{2}$/.test(v));
    const uniqueValues = Array.from(new Set([...values1, ...values2]));
    const sortedUiBets = [...uniqueValues].sort((a, b) => parseFloat(a) - parseFloat(b));
    console.log('[GamePage] getBetOptionsFromUI:', sortedUiBets);
    return sortedUiBets;
  }

  async getInitialBalanceFromUI(): Promise<string[] | null> {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    const canvasBounds = await frame.locator('canvas').boundingBox();
    const canvasWidth = canvasBounds?.width ?? 1280;
    const canvasHeight = canvasBounds?.height ?? 610;
    const canvasBuffer = await captureCanvasBuffer(this.page);
    const initBalanceOcrResult = await readDarkPanelText(
      canvasBuffer,
      pixelsToCropPercent(185, 576, 160, 25, canvasWidth, canvasHeight),
      'resources/screenshots/initial-balance-area'
    );
    const balance = Array.isArray(initBalanceOcrResult)
      ? initBalanceOcrResult[0]
      : initBalanceOcrResult;
    console.log('UI Balance:', balance);

    const filteredBalances = balance
    .split(/\s+/)
    .map((v:string) => v.replace(/[^0-9.]/g, '').trim())
    .filter((v:string) => /^\d+\.\d{2}$/.test(v));

    console.log('[GamePage] getInitialBalanceFromUI:', filteredBalances);
    return filteredBalances[0] ?? null;  // ✅ return first match, not the array
  }

  async getInitialBetFromUI(): Promise<string[] | null> {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    const canvasBounds = await frame.locator('canvas').boundingBox();
    const canvasWidth = canvasBounds?.width ?? 1280;
    const canvasHeight = canvasBounds?.height ?? 610;
    const canvasBuffer = await captureCanvasBuffer(this.page);
    const initBetOcrResult = await readDarkPanelText(
      canvasBuffer,
      pixelsToCropPercent(370, 570, 130, 455, canvasWidth, canvasHeight),
      'resources/screenshots/initial-bet-area'
    );
    const bet = Array.isArray(initBetOcrResult)
      ? initBetOcrResult[0]
      : initBetOcrResult;
    console.log('UI Bet:', bet);

    const filteredBet = bet
    .split(/\s+/)
    .map((v:string) => v.replace(/[^0-9.]/g, '').trim())
    .filter((v:string) => /^\d+\.\d{2}$/.test(v));

    console.log('[GamePage] getInitialBetFromUI:', filteredBet);
    return filteredBet[0] ?? null;  // ✅ return first match, not the array
  }

}