import { test, expect, Page } from '@playwright/test';
import { GamePage } from '../../pages/gamePage';
import { PaytablePage } from '../../pages/paytablePage';

let gamePage: GamePage;
let paytablePage: PaytablePage;

test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    paytablePage = new PaytablePage(page);
    await gamePage.openGame();
});

test('Game_Paytable_Page_Open_and_Close_TC_001', async ({ page }) => {
    test.setTimeout(120000);
    await gamePage.clickPaytableIcon();
    await page.waitForTimeout(2000);
    await paytablePage.closePaytableScreen();

});

test('Game_Paytable_Page_read_text_TC_002', async ({ page }) => {
    test.setTimeout(120000);
    await gamePage.clickPaytableIcon();
    await page.waitForTimeout(2000);
    const paytableText = await paytablePage.getPaytableText();
    console.log(paytableText);
    await paytablePage.closePaytableScreen();

});
