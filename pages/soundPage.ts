import { GamePage } from './gamePage';
import { captureCanvasBuffer, cropCanvasRegion } from '../helpers/ocrHelper';

export class SoundPage extends GamePage {
  private soundIconCrop = { left: 1086, top: 1, width: 32, height: 32 };

  async captureSoundIcon(debugPrefix?: string): Promise<Buffer> {
    const canvasBuffer = await captureCanvasBuffer(this.page);
    return await cropCanvasRegion(canvasBuffer, this.soundIconCrop, debugPrefix);
  }
}
