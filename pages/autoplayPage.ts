import { GamePage } from './gamePage';
import { captureCanvasBuffer, cropCanvasRegion } from '../helpers/ocrHelper';

export class AutoplayPage extends GamePage {
  private autoplayIconCrop = { left: 1045, top: 162, width: 77, height: 74 };

  async captureAutoplayIcon(debugPrefix?: string): Promise<Buffer> {
    const canvasBuffer = await captureCanvasBuffer(this.page);
    return await cropCanvasRegion(canvasBuffer, this.autoplayIconCrop, debugPrefix);
  }
}

