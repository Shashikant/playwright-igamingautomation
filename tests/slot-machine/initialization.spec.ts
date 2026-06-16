// spec: test-plans/slot-machine-basic-operations.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { captureCanvasBuffer, preprocessCrop, runOcr } from '../../helpers/ocrHelper';

test.describe('Game Initialization and UI Controls', () => {
  test('Verify game loads successfully with initial balance and all UI controls', async ({ page }) => {
    // 1. Navigate to the Slot Machine game URL with retries
    let navigationSuccess = false;
    let navigationAttempts = 0;

    while (!navigationSuccess && navigationAttempts < 3) {
      try {
        await page.goto('https://casino.guru/free-casino-games/slots/slot-machine-slot-play-free', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        navigationSuccess = true;
      } catch (err) {
        navigationAttempts++;
        console.log(`Navigation attempt ${navigationAttempts} failed:`, err);
        if (navigationAttempts < 3) {
          await page.waitForTimeout(2000);
        }
      }
    }
    expect(navigationSuccess).toBe(true);

    // 2. Click on the 'Play for Free' button
    const playButton = page.locator('#game_link');
    await expect(playButton).toBeVisible();
    await playButton.click();

    // 3. Enter fullscreen mode if available
    const fullscreenButton = page.locator('.games-box-header-switch.games-box-header-switch-fullscreen');
    if (await fullscreenButton.isVisible()) {
      await fullscreenButton.click();
    }

    // 4. Wait for the game iframe and canvas
    const gameIframe = page.frameLocator('#gamefileEmbed1');
    const canvas = gameIframe.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Use mouse click at specific coordinates on the canvas
    await canvas.click({ button: 'left', position: { x: 640, y: 505 }, force: true });

    // Fallback: click at canvas center if needed
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Screenshots for debugging
    await page.screenshot({ path: 'resources/screenshots/after-click.png' });
    await page.waitForTimeout(15000);
    await page.screenshot({ path: 'resources/screenshots/game-initialized.png' });

    // 5. OCR verification
    const canvasBuffer = await captureCanvasBuffer(page.locator('iframe#gamefileEmbed1'));
    await page.screenshot({ path: 'resources/screenshots/full-canvas.png' });

    // Balance
    const balanceCrop = await preprocessCrop(canvasBuffer, {
      leftPct: 0.02,
      topPct: 0.75,
      widthPct: 0.2,
      heightPct: 0.2
    }, 'resources/screenshots/balance-area');
    const balanceOcrText = await runOcr(balanceCrop);
    const hasBalance = /1000|1,000|FUN/i.test(balanceOcrText);
    expect(hasBalance).toBeTruthy();

    // Bet
    const betCrop = await preprocessCrop(canvasBuffer, {
      leftPct: 0.2,
      topPct: 0.75,
      widthPct: 0.2,
      heightPct: 0.2
    }, 'resources/screenshots/bet-area');
    const betOcrText = await runOcr(betCrop);
    const hasBet = /bet|0\.1|0\.10/i.test(betOcrText);
    expect(hasBet).toBeTruthy();

    // Spin button
    const spinButtonCrop = await preprocessCrop(canvasBuffer, {
      leftPct: 0.7,
      topPct: 0.35,
      widthPct: 0.25,
      heightPct: 0.2
    }, 'resources/screenshots/spin-button-area');
    const spinOcrText = await runOcr(spinButtonCrop);
    const hasSpin = /SPIN|SPUN/i.test(spinOcrText);
    expect(hasSpin).toBeTruthy();

    // Autoplay button
    const autoplayButtonCrop = await preprocessCrop(canvasBuffer, {
      leftPct: 0.6,
      topPct: 0.8,
      widthPct: 0.35,
      heightPct: 0.15
    }, 'resources/screenshots/autoplay-button-area');
    const autoplayOcrText = await runOcr(autoplayButtonCrop);
    const hasAutoplay = /AUTO/i.test(autoplayOcrText);
    expect(hasAutoplay).toBeTruthy();

    // Summary log
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Balance detected: ${hasBalance}`);
    console.log(`Bet detected: ${hasBet}`);
    console.log(`Spin button detected: ${hasSpin}`);
    console.log(`Autoplay detected: ${hasAutoplay}`);
    console.log('=====================\n');

    // Final assertion: ensure OCR returned some content
    const fullGameContent = await runOcr(canvasBuffer);
    expect(fullGameContent.length).toBeGreaterThan(0);
  });
});
