import { GamePage } from './gamePage';
import { captureCanvasBuffer, cropCanvasRegion } from '../helpers/ocrHelper';

export class TotalBetPage extends GamePage {


    async captureTotalBetDownArrow(debugPrefix?: string): Promise<Buffer> {
        const totalBetCrop = { left: 482, top: 578, width: 28, height: 30 };
        const canvasBuffer = await captureCanvasBuffer(this.page);
        return await cropCanvasRegion(canvasBuffer, totalBetCrop, debugPrefix);
    }

    async captureTotalBetUpArrow(debugPrefix?: string): Promise<Buffer> {
        const totalBetCrop = { left: 482, top: 542, width: 25, height: 34 };
        const canvasBuffer = await captureCanvasBuffer(this.page);
        return await cropCanvasRegion(canvasBuffer, totalBetCrop, debugPrefix);
    }

    async clickTotalBetDownArrow() {
        await this.page.waitForTimeout(2000);
        const frame = this.page.frameLocator('#gamefileEmbed1');
        const canvas = frame.locator('canvas');
        await this.page.waitForTimeout(1000);
        await canvas.click({ position: { x: 496, y: 592 }, force: true });
        await this.page.waitForTimeout(1000);
    }

    async clickTotalBetUpArrow() {
        await this.page.waitForTimeout(2000);
        const frame = this.page.frameLocator('#gamefileEmbed1');
        const canvas = frame.locator('canvas');
        await this.page.waitForTimeout(1000);
        await canvas.click({ position: { x: 496, y: 562 }, force: true });
        await this.page.waitForTimeout(1000);
    }
}
