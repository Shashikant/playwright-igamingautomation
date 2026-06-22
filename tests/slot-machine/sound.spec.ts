import { test, expect, Page } from '@playwright/test';
import { GamePage } from '../../pages/gamePage';
import { GameApiCollector } from '../../helpers/gameApiHelper';
import { captureCanvasBuffer, preprocessCrop, readTextFromCrop } from '../../helpers/ocrHelper';
import { pixelsToCropPercent } from '../../utils/cropHelper';
import { SoundPage } from '../../pages/soundPage';
import { ImageComparator,ensureScreenshotFolders } from '../../utils/ImageComparator';

let gamePage: GamePage;
let gameApiCollector: GameApiCollector;
let soundPage: SoundPage;
let imageComparator: ImageComparator;

test.beforeEach(async ({ page }) => {
  gamePage = new GamePage(page);
  gameApiCollector = new GameApiCollector(page);
  imageComparator = new ImageComparator();
  await ensureScreenshotFolders();
  // Start listening FIRST
  gameApiCollector.start();
  await gamePage.openGame();
  //await page.waitForTimeout(1000);
  gameApiCollector.printCapturedCommands();
});

test('Verify sound control is visible and active at top right', async ({ page }) => {

  soundPage = new SoundPage(page);

  const actualBuffer = await soundPage.captureSoundIcon('resources/screenshots/actual/soundIconOn');
  const isActive = await soundPage.compareWithBaseline(
    actualBuffer,
    'resources/screenshots/baseline/sound-active.png',
    'resources/screenshots/actual/soundIconActive',
  );

  expect(isActive).toBeTruthy();
});


test('Verify sound control is visible and muted at top right', async ({ page }) => {
  test.setTimeout(60000); // increase timeout for this test
  await gamePage.muteSound();
  soundPage = new SoundPage(page);

  const actualBuffer = await soundPage.captureSoundIcon('resources/screenshots/actual/soundIconMuted');
  const isMuted = await soundPage.compareWithBaseline(
    actualBuffer,
    'resources/screenshots/baseline/sound-muted.png',
    'resources/screenshots/actual/soundIconMuted',
  );

  expect(isMuted).toBeTruthy();
});