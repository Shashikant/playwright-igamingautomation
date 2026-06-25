// pages/HelpPage.ts
import type { Page } from '@playwright/test';
import { captureCanvasBuffer, preprocessCrop, readDarkPanelText, readTextFromCrop, parseMoney, CropDef } from '../helpers/ocrHelper';
import { pixelsToCropPercent } from '../utils/cropHelper';
import * as fs from 'fs';
import * as path from 'path';

export class PaytablePage {
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

    async closePaytableScreen() {
        //await this.page.waitForTimeout(2000);
        const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
        const canvas = frame.locator('canvas');
        //await this.page.waitForTimeout(1000);
        await canvas.click({ position: { x: 1127, y: 50 }, force: true });
        await this.page.waitForTimeout(1000);
    }

    async getPaytableText(): Promise<string[] | null> {
        await this.page.waitForTimeout(2000);
        const frame = this.page.frameLocator('//iframe[@data-behaviour="play-demo-iframe"]');
        const canvas = frame.locator('canvas');
        await canvas.hover({ position: { x: 420, y: 400 }, force: true });

        await this.page.waitForTimeout(1000);
        const canvasBounds = await frame.locator('canvas').boundingBox();
        const canvasWidth = canvasBounds?.width ?? 1280;
        const canvasHeight = canvasBounds?.height ?? 610;
        const canvasBuffer = await captureCanvasBuffer(this.page);

        const paytableOcrResult = await readTextFromCrop(
            canvasBuffer,
            pixelsToCropPercent(236, 0, 800, 530, canvasWidth, canvasHeight),
            false,
            'resources/screenshots/paytable-area'
        );
        const lines = paytableOcrResult.text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
        // ✅ Write extracted text to file

        if (lines.length > 0) {
            const filePath = path.join(__dirname, '../resources/textfiles/paytable-text.txt');
            // ✅ Create directory if it doesn't exist
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.appendFileSync(filePath, lines.join('\n'), 'utf-8');
        }
        console.log('File written successfully');
        console.log('Writing to:', path.join(__dirname, '../resources/textfiles/paytable-text.txt'));
        return lines.length > 0 ? lines : null;
    }

}
