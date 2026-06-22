import { test, expect, Page } from '@playwright/test';
import { GamePage } from '../../pages/gamePage';
import { GameApiCollector } from '../../helpers/gameApiHelper';
import { captureCanvasBuffer, preprocessCrop, readTextFromCrop } from '../../helpers/ocrHelper';
import { pixelsToCropPercent } from '../../utils/cropHelper';
import { AutoplayPage } from '../../pages/autoplayPage';
import { SoundPage } from '../../pages/soundPage';
import { ensureScreenshotFolders, ImageComparator } from '../../utils/ImageComparator';

let gamePage: GamePage;
let gameApiCollector: GameApiCollector;
let autoplayPage: AutoplayPage;
let imageComparator: ImageComparator;

test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    autoplayPage = new AutoplayPage(page);
    gameApiCollector = new GameApiCollector(page);
    await ensureScreenshotFolders();
    // Start listening FIRST
    gameApiCollector.start();
    await gamePage.openGame();
    //await page.waitForTimeout(1000);
    gameApiCollector.printCapturedCommands();
});

test('Verify if autoplay button is visible and active', async ({ page }) => {

    await gamePage.clickAutoplayButton();

});



test('Verify autoplay control button is visible and acitve at bottom right', async ({ page }) => {
    const actualBuffer = await autoplayPage.captureAutoplayIcon('resources/screenshots/actual/autoplayIconOn');
    const isActive = await autoplayPage.compareWithBaseline(
        actualBuffer,
        'resources/screenshots/baseline/autoplay-active.png',
        'resources/screenshots/actual/autoplayIconActive',
    );

    expect(isActive).toBeTruthy();
    await page.waitForTimeout(2000);
    if (isActive) {
       await gamePage.clickAutoplayButton();
    }
});