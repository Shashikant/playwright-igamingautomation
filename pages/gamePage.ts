// pages/GamePage.ts
import type { Page } from '@playwright/test';
import { captureCanvasBuffer, preprocessCrop, runOcr, parseMoney, CropDef } from '../helpers/ocrHelper';

export class GamePage {
  readonly page: Page;
  readonly iframeSelector = '#gamefileEmbed1';
  readonly playLinkSelector = '#game_link';
  readonly fullscreenToggle = '.games-box-header-switch.games-box-header-switch-fullscreen';

  // percent-based crops tuned for Balance and Total bet (adjust if needed)
  readonly balanceCrop: CropDef = { leftPct: 0.04, topPct: 0.86, widthPct: 0.30, heightPct: 0.10 };
  readonly totalBetCrop: CropDef = { leftPct: 0.34, topPct: 0.86, widthPct: 0.30, heightPct: 0.10 };

  // spin button percent coords relative to canvas (adjust if needed)
  readonly spinPct = { xPct: 0.87, yPct: 0.90 };

  constructor(page: Page) {
    this.page = page;
  }

  async openGame() {
    await this.page.goto('https://casino.guru/free-casino-games/slots/slot-machine-slot-play-free', { waitUntil: 'networkidle' });
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

  /**
   * Return the canvas locator inside the iframe.
   * Use frameLocator so we can call locator.screenshot() on it.
   */
  canvasLocator() {
    return this.page.frameLocator(this.iframeSelector).locator('canvas');
  }

  /**
   * Capture canvas as Buffer using the canvas locator.
   */
  async captureCanvasBuffer(): Promise<Buffer> {
    const canvas = this.canvasLocator();
    return captureCanvasBuffer(canvas);
  }

  /**
   * Read Balance and Total Bet from canvas using OCR helper.
   */
  async readBalanceAndBetFromCanvas() {
    const canvasBuffer = await this.captureCanvasBuffer();

    const balanceBuf = await preprocessCrop(canvasBuffer, this.balanceCrop, 'balance');
    const totalBetBuf = await preprocessCrop(canvasBuffer, this.totalBetCrop, 'totalbet');

    const balanceText = await runOcr(balanceBuf);
    const totalBetText = await runOcr(totalBetBuf);

    const balanceParsed = parseMoney(balanceText);
    const totalBetParsed = parseMoney(totalBetText);

    const balance = balanceParsed ? parseFloat(balanceParsed.replace(/,/g, '')) : null;
    const totalBet = totalBetParsed ? parseFloat(totalBetParsed.replace(/,/g, '')) : null;

    return {
      balanceRaw: balanceText,
      balance,
      totalBetRaw: totalBetText,
      totalBet
    };
  }

  // Click the SPIN button by computing absolute coords from canvas bounding box.
  async clickSpin() {
    await this.page.waitForTimeout(5000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    
    await canvas.click({ button: 'left', position: { x: 1055, y: 575 }, force: true });
  }
}
