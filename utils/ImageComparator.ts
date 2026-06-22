import fs from 'fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { captureCanvasBuffer, cropCanvasRegion } from '../helpers/ocrHelper';

export class ImageComparator {

    static compareImages(
        baselinePath: string,
        actualPath: string,
        diffPath: string,
        tolerance: number = 20 // default tolerance
    ): boolean {

        const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
        const actual = PNG.sync.read(fs.readFileSync(actualPath));

        // Ensure same dimensions
        if (baseline.width !== actual.width || baseline.height !== actual.height) {
            throw new Error(`Image sizes differ: baseline=${baseline.width}x${baseline.height}, actual=${actual.width}x${actual.height}`);
        }

        const diff = new PNG({ width: baseline.width, height: baseline.height });

        const mismatchedPixels = pixelmatch(
            baseline.data,
            actual.data,
            diff.data,
            baseline.width,
            baseline.height,
            { threshold: 0.1 }
        );

        fs.writeFileSync(diffPath, PNG.sync.write(diff));

        console.log(`Mismatched pixels: ${mismatchedPixels}`);
        return mismatchedPixels <= tolerance;
    }
   
}
export function ensureScreenshotFolders() {
  fs.mkdirSync('resources/screenshots/actual', { recursive: true });
  fs.mkdirSync('resources/screenshots/baseline', { recursive: true });
  fs.mkdirSync('resources/screenshots/diff', { recursive: true });
}