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
    //await page.waitForTimeout(1000);
    gameApiCollector.printCapturedCommands();
});

test('Game Play Test', async ({ page }) => {
    test.setTimeout(120000);
    await gamePage.clickSpin();

});

test("UI Bet options match API response", async ({ page }) => {
    test.setTimeout(120000);
    await gamePage.clickBetSettingsButton();
    const sortedUiBets = await gamePage.getBetOptionsFromUI();
    //console.log('[Test] Parsed UI bet options:', sortedUiBets);

    gameApiCollector.printCapturedCommands();

    // Replace 'init' with actual command once identified
    const initData =
        await gameApiCollector.waitForCommand(
            'init',
            10000
        );

    // //console.log(
    //     'Init API Response:',
    //     JSON.stringify(
    //         initData,
    //         null,
    //         2
    //     )
    // );

    const availableBetsStr =
        initData?.oga?.parameters?.stakeValues ?? "";
    const availableBets = availableBetsStr.split(" ").map(Number);
    const normalizedApiBets = availableBets.map(
        (bet: number) => bet.toFixed(2)
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
        sortedUiBets,
        `UI bets [${sortedUiBets}] do not match API bets [${sortedApiBets}]`
    ).toEqual(
        sortedApiBets
    );
});


test("Initial balance match API response", async ({ page }) => {
    test.setTimeout(120000);

    const initialUIBalance = await gamePage.getInitialBalanceFromUI();
    //console.log('[Test] Parsed UI initial balance:', initialBalance);

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

    const initialApiBalance =
        initData?.oga?.player?.balance?.amount;
    const normalizedApiInitialBalance = initialApiBalance != null
        ? Number(initialApiBalance).toFixed(2)
        : null;

    expect(
        normalizedApiInitialBalance,
        'API response missing initial balance'
    ).not.toBeNull();

    console.log('UI Balance  :', initialUIBalance);
    console.log('API Balance :', normalizedApiInitialBalance);

    expect(
        initialUIBalance,
        `UI initial balance [${initialUIBalance}] do not match API Initial Balance [${normalizedApiInitialBalance}]`
    ).toEqual(
        normalizedApiInitialBalance
    );
});


test("Initial bet match API response", async ({ page }) => {
    test.setTimeout(120000);

    const initialUIBet = await gamePage.getInitialBetFromUI();
    //console.log('[Test] Parsed UI initial bet:', initialBet);

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

    const initialApiBet =
        initData?.oga?.parameters?.defaultStake;

    const normalizedApiInitialBet = initialApiBet != null
        ? Number(initialApiBet).toFixed(2)
        : null;


    expect(
        normalizedApiInitialBet,
        'API response missing initial bet'
    ).not.toBeNull();

    console.log('UI Inital Bet  :', initialUIBet);
    console.log('API Bet :', normalizedApiInitialBet);

    expect(
        initialUIBet,
        `UI initial bet [${initialUIBet}] do not match API Initial Bet [${normalizedApiInitialBet}]`
    ).toEqual(
        normalizedApiInitialBet
    );
});