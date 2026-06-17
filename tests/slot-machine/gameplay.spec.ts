import { test, expect, Page } from '@playwright/test';
import { GamePage } from '../../pages/gamePage';
import { GameApiHelper } from '../../helpers/gameApiHelper';
import { captureCanvasBuffer, preprocessCrop, runOcr, readTextFromCrop } from '../../helpers/ocrHelper';
import { pixelsToCropPercent } from '../../utils/cropHelper';


let gamePage: GamePage;
let gameApiHelper: GameApiHelper;

test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    gameApiHelper = new GameApiHelper(page);
    await gamePage.openGame();
});

test('Game Play Test', async ({ page }) => {

    await gamePage.clickSpin();

});

test("Bet options match API response", async ({ page }) => {
    await gamePage.clickTotalBet();
    await page.waitForTimeout(4000); // Wait for the bet options to be displayed
    // Fix #3: read actual canvas dimensions
    const frame = page.frameLocator('#gamefileEmbed1');
    const canvasBounds = await frame.locator('canvas').boundingBox();
    const canvasWidth = canvasBounds?.width ?? 1280;
    const canvasHeight = canvasBounds?.height ?? 610;
    const canvasBuffer = await captureCanvasBuffer(page);
    const betOcrResult = await readTextFromCrop(
        canvasBuffer,
        pixelsToCropPercent(325, 90, 155, 452, canvasWidth, canvasHeight),
        false,
        'resources/screenshots/betOption-area'
    );
    console.log('Bet OCR Text:', betOcrResult.text);
    // Fix #1: intercept init response BEFORE page load
    const initDataPromise = gameApiHelper.waitForApiResponse('init');
    const initData = await initDataPromise;

    // Fix #5: guard against missing API shape
    const availableBets = initData?.options?.available_bets;
    expect(availableBets, 'API response missing available_bets').toBeDefined();

    // Fix #4: handle comma-formatted numbers
    const betOptionsFromUI = betOcrResult.text
        .split(/\s+/)
        .map(v => v.replace(/[^0-9.]/g, '').trim())
        .filter(v => /^\d+\.\d{2}$/.test(v));
    console.log('[Test] Parsed UI bet options:', betOptionsFromUI);

    console.log('Init API data:', availableBets);

    // Fix #7: assertion with context message
    expect(
        betOptionsFromUI,
        `UI bets [${betOptionsFromUI}] do not match API bets [${availableBets}]`
    ).toEqual(availableBets);
});