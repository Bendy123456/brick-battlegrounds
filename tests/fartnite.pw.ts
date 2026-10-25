import {test,expect} from '@playwright/test';

test('FartNite opens as the active game with an original battle royale menu',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page).toHaveTitle(/FartNite/);
 await expect(page.locator('#home')).toBeVisible();
 await expect(page.locator('#play')).toHaveText(/PLAY SOLO/);
 await expect(page.locator('#world canvas')).toBeVisible();
 await page.waitForTimeout(900);
 await page.screenshot({path:'artifacts/fartnite-lobby.png',animations:'disabled'});
 await page.locator('#how').click();
 await expect(page.locator('#instructions')).toBeVisible();
 await expect(page.locator('#instructions')).toContainText('BUILDING');
 await page.locator('#backFromHow').click();
 await expect(page.locator('#home')).toBeVisible();
 expect(errors).toEqual([]);
});

test('solo match starts, renders the HUD, toggles building, map and pause',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await page.locator('#play').click();
 await expect(page.locator('#hud')).toBeVisible();
 await page.waitForTimeout(1100);
 await page.screenshot({path:'artifacts/fartnite-glider-gameplay.png',animations:'disabled'});
 await expect(page.locator('#aliveText')).toHaveText('20');
 await expect(page.locator('#hotbar .slot')).toHaveCount(6);
 await page.keyboard.press('KeyV');
 await expect(page.locator('#buildBar')).toBeVisible();
 await page.screenshot({path:'artifacts/fartnite-build-ui.png',animations:'disabled'});
 await page.keyboard.press('KeyG');
 await expect(page.locator('#buildChoice')).toHaveText('RAMP');
 await page.keyboard.press('KeyV');
 await expect(page.locator('#buildBar')).toBeHidden();
 await page.keyboard.press('KeyM');
 await expect(page.locator('#bigmap')).toBeVisible();
 await expect(page.locator('#fullmap')).toBeVisible();
 await page.screenshot({path:'artifacts/fartnite-map.png',animations:'disabled'});
 await page.locator('#closeMap').click();
 await expect(page.locator('#hud')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('#pause')).toBeVisible();
 await page.locator('#resume').click();
 await expect(page.locator('#hud')).toBeVisible();
 expect(errors).toEqual([]);
});
