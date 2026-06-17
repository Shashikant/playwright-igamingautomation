// pages/GamePage.ts
import type { Page } from '@playwright/test';
import { captureCanvasBuffer, preprocessCrop, runOcr, parseMoney, CropDef } from '../helpers/ocrHelper';
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
    await canvas.hover({position: { x: 200, y: 560 }, force: true });
    await this.page.waitForTimeout(1000);
  }

  async clickHelpIcon() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({position: { x: 200, y: 525 }, force: true });
    await this.page.waitForTimeout(1000);
    await canvas.screenshot({ path: 'resources/screenshots/help-screen.png', type: 'png' });
  }

  async clickTotalBet() {
    await this.page.waitForTimeout(2000);
    const frame = this.page.frameLocator('#gamefileEmbed1');
    const canvas = frame.locator('canvas');
    await this.page.waitForTimeout(1000);
    await canvas.click({position: { x: 420, y: 575 }, force: true });
    await this.page.waitForTimeout(1000);
    //await canvas.screenshot({ path: 'resources/screenshots/betOptions-screen.png', type: 'png' });
  }

}
