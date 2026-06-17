import { test, expect, Page } from '@playwright/test';
import { GamePage } from '../../pages/gamePage';
import { GameApiCollector } from '../../helpers/gameApiHelper';
import { captureCanvasBuffer, preprocessCrop, readTextFromCrop } from '../../helpers/ocrHelper';
import { pixelsToCropPercent } from '../../utils/cropHelper';


let gamePage: GamePage;
let gameApiCollector: GameApiCollector;

test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    gameApiCollector = new GameApiCollector(page);
    // Start listening FIRST
    gameApiCollector.start();
    await gamePage.openGame();
    await page.waitForTimeout(1000);
    gameApiCollector.printCapturedCommands();
});

test('Game Play Test', async ({ page }) => {

    await gamePage.clickSpin();

});

test("Bet options match API response", async ({ page }) => {
    test.setTimeout(120000);
    await gamePage.clickTotalBet();
    //await page.waitForTimeout(4000); // Wait for the bet options to be displayed
    // Fix #3: read actual canvas dimensions
    const betOptionsFromUI = await gamePage.getbetOptionsFromUI();
    //console.log('[Test] Parsed UI bet options:', betOptionsFromUI);
    // Check available commands
    gameApiCollector.printCapturedCommands();

    // Replace 'init' with actual command once identified
    const initData =
        await gameApiCollector.waitForCommand(
            'init',
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

    const availableBets =
        initData?.options?.available_bets;
    const normalizedApiBets =
        availableBets.map(
            (bet: number) =>
                (bet / 100).toFixed(2)
        );

    const sortedApiBets = [...normalizedApiBets]
        .sort((a, b) => parseFloat(a) - parseFloat(b));
    expect(
        sortedApiBets,
        'API response missing available_bets'
    ).toBeDefined();

    console.log(
        'API Bet Options:',
        sortedApiBets
    );

    expect(
        betOptionsFromUI,
        `UI bets [${betOptionsFromUI}] do not match API bets [${sortedApiBets}]`
    ).toEqual(
        sortedApiBets
    );
});