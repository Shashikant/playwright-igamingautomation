// pages/HelpPage.ts
import type { Page } from '@playwright/test';
import { captureCanvasBuffer, preprocessCrop, runOcr, parseMoney, CropDef } from '../helpers/ocrHelper';
import { pixelsToCropPercent } from '../helpers/cropHelper';

export class HelpPage {
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

    async closeHelpScreen() {
        //await this.page.waitForTimeout(2000);
        const frame = this.page.frameLocator('#gamefileEmbed1');
        const canvas = frame.locator('canvas');
        //await this.page.waitForTimeout(1000);
        await canvas.click({ position: { x: 1127, y: 50 }, force: true });
        await this.page.waitForTimeout(1000);
    }

}
