import { test, expect, Page } from '@playwright/test';
import { GamePage } from '../../pages/gamePage';
import { GameApiCollector } from '../../helpers/gameApiHelper';
import { captureCanvasBuffer, preprocessCrop, readTextFromCrop } from '../../helpers/ocrHelper';
import { pixelsToCropPercent } from '../../utils/cropHelper';
import { SoundPage } from '../../pages/soundPage';

let gamePage: GamePage;
let gameApiCollector: GameApiCollector;
let soundPage: SoundPage;

test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    gameApiCollector = new GameApiCollector(page);
    // Start listening FIRST
    gameApiCollector.start();
    await gamePage.openGame();
    //await page.waitForTimeout(1000);
    gameApiCollector.printCapturedCommands();
});

test('Verify sound control is visible and active at top right', async ({ page }) => {

    soundPage = new SoundPage(page);
    const isActive = await soundPage.compareWithBaseline(
    'resources/screenshots/baseline/sound-active.png',
    'resources/actual/soundIcon'
  );

  expect(isActive).toBeTruthy();
});


test('Verify sound control is visible and muted at top right', async ({ page }) => {
    
    await gamePage.muteSound();
    soundPage = new SoundPage(page);
    
    const isActive = await soundPage.compareWithBaseline(
    'resources/screenshots/baseline/sound-muted.png',
    'resources/actual/soundIcon'
  );

  expect(isActive).toBeTruthy();
});