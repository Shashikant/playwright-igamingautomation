import fs from 'fs';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

export class ImageComparator {

    static compareImages(
        baselinePath: string,
        actualPath: string,
        diffPath: string
    ): number {

        const baseline = PNG.sync.read(
            fs.readFileSync(baselinePath)
        );

        const actual = PNG.sync.read(
            fs.readFileSync(actualPath)
        );

        const diff = new PNG({
            width: baseline.width,
            height: baseline.height
        });

        const mismatchedPixels = pixelmatch(
            baseline.data,
            actual.data,
            diff.data,
            baseline.width,
            baseline.height,
            {
                threshold: 0.1
            }
        );

        fs.writeFileSync(
            diffPath,
            PNG.sync.write(diff)
        );

        return mismatchedPixels;
    }
}