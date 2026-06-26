// utils/cropHelper.ts
import sharp from 'sharp';

export function pixelsToCropPercent(
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number
) {
  return {
    leftPct: x / canvasWidth,
    topPct: y / canvasHeight,
    widthPct: width / canvasWidth,
    heightPct: height / canvasHeight
  };
}

export async function debugCrops(canvasBuffer: Buffer, crops: {x:number,y:number,w:number,h:number}[]) {
  const overlays = crops.map(c => ({
    input: Buffer.from(
      `<svg width="${c.x + c.w}" height="${c.y + c.h}">
         <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}"
           fill="none" stroke="red" stroke-width="3"/>
       </svg>`
    ),
    top: 0,
    left: 0
  }));
  await sharp(canvasBuffer)
    .composite(overlays)
    .toFile('debug-crops.png');
}