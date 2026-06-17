import { test, expect, Page } from '@playwright/test';
import {GamePage} from '../../pages/gamePage';
import { HelpPage } from '../../pages/helpPage';

let gamePage : GamePage;
let helpPage : HelpPage;

test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    helpPage = new HelpPage(page);
    await gamePage.openGame();
});

test('Game_Help_Page_TC_001', async ({ page }) => {

   await gamePage.hoverInfo();
   await page.waitForTimeout(2000);
   await gamePage.clickHelpIcon();
   await page.waitForTimeout(2000);
   await helpPage.closeHelpScreen();
   
});