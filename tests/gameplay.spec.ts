import { test, expect, Page } from '@playwright/test';
import {GamePage} from '../pages/gamePage';

let gamePage : GamePage;

test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.openGame();
});

test('Game Play Test', async ({ page }) => {

   await gamePage.clickSpin();
   
});