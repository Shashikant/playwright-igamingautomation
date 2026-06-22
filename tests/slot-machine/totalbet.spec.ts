import { test, expect, Page } from '@playwright/test';
import { GamePage } from '../../pages/gamePage';
import { GameApiCollector } from '../../helpers/gameApiHelper';
import { captureCanvasBuffer, preprocessCrop, readTextFromCrop } from '../../helpers/ocrHelper';
import { pixelsToCropPercent } from '../../utils/cropHelper';
import { TotalBetPage } from '../../pages/totalBetPage';
import { ImageComparator,ensureScreenshotFolders } from '../../utils/ImageComparator';

let gamePage: GamePage;
let gameApiCollector: GameApiCollector;
let totalBetPage: TotalBetPage;
let imageComparator: ImageComparator;

test.beforeEach(async ({ page }) => {
  gamePage = new GamePage(page);
  gameApiCollector = new GameApiCollector(page);
  totalBetPage = new TotalBetPage(page);
  imageComparator = new ImageComparator();
  await ensureScreenshotFolders();
  // Start listening FIRST
  gameApiCollector.start();
  await gamePage.openGame();
  //await page.waitForTimeout(1000);
  gameApiCollector.printCapturedCommands();
});

test('Verify total bet decrement button (Down Arrow) is active and displayed correctly', async ({ page }) => {

  totalBetPage = new TotalBetPage(page);

  const actualBuffer = await totalBetPage.captureTotalBetDownArrow('resources/screenshots/actual/totalBetDownArrow');
  const isDisplayed = await totalBetPage.compareWithBaseline(
    actualBuffer,
    'resources/screenshots/baseline/totalBet-decrement-active.png',
    'resources/screenshots/actual/totalBetDecrement',
  );

  expect(isDisplayed).toBeTruthy();

  if (isDisplayed) {
    await totalBetPage.clickTotalBetDownArrow();
  }
  else
  {
    console.error('Total Bet Down Arrow is not displayed correctly or not enabled.');
  }

});


test('Verify total bet increment button (Up Arrow) is active and displayed correctly', async ({ page }) => {

  totalBetPage = new TotalBetPage(page);

  const actualBuffer = await totalBetPage.captureTotalBetUpArrow('resources/screenshots/actual/totalBetUpArrow');
  const isDisplayed = await totalBetPage.compareWithBaseline(
    actualBuffer,
    'resources/screenshots/baseline/totalbet-increment-active.png',
    'resources/screenshots/actual/totalBetIncrement',
  );

  expect(isDisplayed).toBeTruthy();

  if (isDisplayed) {
    await totalBetPage.clickTotalBetUpArrow();
  }
  else
  {
    console.error('Total Bet Up Arrow is not displayed correctly or not enabled.');
  }
});


test("Total bet during game play match API response", async ({ page }) => {
    test.setTimeout(120000);

    
    //console.log('[Test] Parsed UI initial bet:', initialBet);
    await totalBetPage.clickTotalBetUpArrow();
    await gamePage.clickSpin();
    await gamePage.page.waitForTimeout(5000); // Wait for the spin to complete
    const totalUIBet = await gamePage.getTotalBetFromUI();
    gameApiCollector.printCapturedCommands();

    // Replace 'init' with actual command once identified
    const initData =
        await gameApiCollector.waitForCommand(
            'spin',
            10000
        );

    console.log(
        'Init API Response:',
        JSON.stringify(
            initData,
            null,
            2
        )
    );

    const initialApiBet =
        initData?.outcome?.bet;

    const normalizedApiInitialBet = initialApiBet != null
        ? (Number(initialApiBet) / 100).toFixed(2)
        : null;


    expect(
        normalizedApiInitialBet,
        'API response missing initial bet'
    ).not.toBeNull();

    console.log('UI Total Bet  :', totalUIBet);
    console.log('API Bet :', normalizedApiInitialBet);

    expect(
        totalUIBet,
        `UI total bet [${totalUIBet}] do not match API Total Bet [${normalizedApiInitialBet}]`
    ).toEqual(
        normalizedApiInitialBet
    );
});
