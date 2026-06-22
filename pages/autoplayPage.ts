import { GamePage } from './gamePage';
import { captureCanvasBuffer, cropCanvasRegion } from '../helpers/ocrHelper';

export class AutoplayPage extends GamePage {
  private autoplayIconCrop = { left: 963, top: 544, width: 52, height: 64 };

  async captureAutoplayIcon(debugPrefix?: string): Promise<Buffer> {
    const canvasBuffer = await captureCanvasBuffer(this.page);
    return await cropCanvasRegion(canvasBuffer, this.autoplayIconCrop, debugPrefix);
  }
}

