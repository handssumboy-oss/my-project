import {test,expect} from '@playwright/test';
test('도전 모드는 완주 전엔 잠겨 있고, 완주 기록이 있으면 하트 2개로 시작',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.getByText('세 동네를 완주하면 도전 모드가 열려요')).toBeVisible();await expect(page.getByRole('button',{name:/도전 모드/})).toHaveCount(0);
 await page.evaluate(()=>localStorage.setItem('jabongi-adventure-cleared','true'));await page.reload();
 await page.getByRole('button',{name:/도전 모드/}).click();
 await expect(page.locator('#hearts')).toHaveAttribute('aria-label','남은 하트 2개');await expect(page.locator('#challenge-tag')).toBeVisible();await expect(page.locator('#best-label')).toHaveText('CHALLENGE BEST');
 await expect(page.locator('#game')).toHaveAttribute('data-boss-state','sleep');
 await page.getByRole('button',{name:'일시정지'}).click();await page.getByRole('button',{name:/처음부터 다시 하기/}).click();await expect(page.locator('#challenge-tag')).toBeVisible();
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
