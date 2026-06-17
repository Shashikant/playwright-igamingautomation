// utils/cropHelper.ts

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
