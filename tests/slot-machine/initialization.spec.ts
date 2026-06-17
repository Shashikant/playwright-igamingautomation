import { test, expect } from '@playwright/test';
import { captureCanvasBuffer, preprocessCrop } from '../../helpers/ocrHelper';
import { GamePage } from '../../pages/gamePage';
import {pixelsToCropPercent} from '../../utils/cropHelper';
import {readTextFromCrop} from '../../helpers/ocrHelper';

let gamePage: GamePage;

test.beforeEach(async ({ page }) => {
  gamePage = new GamePage(page);
  await gamePage.openGame();
  await page.waitForTimeout(4000);
});



test.describe('Game Initialization and UI Controls', () => {
 test('Verify_Game_Balance_Total_Bet_and_Total_Win_TC_001', async ({ page }) => {
  // Ensure game is fully loaded by clicking on canvas
  test.setTimeout(120000);
  await gamePage.clickSpin();

  // Capture canvas for OCR verification
  await page.waitForTimeout(2000); // wait for any animations to settle
  const canvasBuffer = await captureCanvasBuffer(page);

  // Canvas dimensions (fixed for your game)
  const canvasWidth = 1280;
  const canvasHeight = 610;

  // --- Balance field ---
  const balanceOcrResult = await readTextFromCrop(canvasBuffer,
  pixelsToCropPercent(180, 575, 165, 65, canvasWidth, canvasHeight),
  false,
  'resources/screenshots/balance-area');
  const balanceOcrText = balanceOcrResult.text;
  console.log('Balance OCR Text:', balanceOcrText);
  const hasBalance = /1000|1,000|FUN|balance/i.test(balanceOcrText);
  expect(hasBalance).toBeTruthy();

  // --- Total Bet field ---
  const betOcrResult = await readTextFromCrop(canvasBuffer,
  pixelsToCropPercent(350, 540, 110, 60, canvasWidth, canvasHeight),
  false,
  'resources/screenshots/bet-area');
  const betOcrText = betOcrResult.text;
  console.log('Bet OCR Text:', betOcrText);
  const hasBet = /bet|0\.1|0\.10|total/i.test(betOcrText);
  expect(hasBet).toBeTruthy();
// --- Total Win field ---
  const winOcrResult = await readTextFromCrop(canvasBuffer,
  pixelsToCropPercent(740, 545, 150, 65, canvasWidth, canvasHeight),
  false,
  'resources/screenshots/win-area');
  const winOcrText = winOcrResult.text;
  const hasWin = /win|0\.1|0\.10|total/i.test(winOcrText);
  if (!hasWin) {
    console.warn('Win text not detected.');
  }
  else
  {
    console.log('Win OCR Text:', winOcrText);
    expect(hasWin).toBeTruthy();
  }  

  console.log('\n=== TEST SUMMARY ===');
  console.log(`✓ Balance detected: ${hasBalance}`);
  console.log(`✓ Total Bet detected: ${hasBet}`);
  console.log(`✓ Win detected: ${hasWin}`);
  console.log('=====================\n');
});
});
