import {test,expect} from '@playwright/test';
test('러너 시작, 조작, 일시정지, 충돌 결과, PNG 저장과 재도전',async({page},info)=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>Math.random=()=>.45);await page.clock.install();await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toContainText('신나는 질주');
 await expect(page.getByRole('img',{name:'점프하는 3D 자봉이'})).toBeVisible();
 await page.screenshot({path:`test-results/runner-home-${info.project.name}.png`,fullPage:true});
 await page.getByRole('button',{name:/달리기 시작/}).click();await expect(page.locator('#hud')).toBeVisible();
 await page.getByRole('button',{name:'점프',exact:true}).click();await page.clock.runFor(700);
 await page.getByRole('button',{name:'왼쪽 레인으로 이동'}).click();await page.keyboard.press('ArrowRight');
 await page.clock.runFor(1600);await page.screenshot({path:`test-results/runner-play-${info.project.name}.png`});
 await page.getByRole('button',{name:'일시정지'}).click();const timer=await page.locator('#timer').textContent();
 await page.clock.fastForward(5000);await expect(page.locator('#timer')).toHaveText(timer);
 await page.getByRole('button',{name:/계속 달리기/}).click();await page.clock.runFor(22000);
 await expect(page.getByRole('heading',{level:2})).toContainText('한 번 더');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:/결과 저장/}).click();
 expect((await download).suggestedFilename()).toContain('.png');
 await page.screenshot({path:`test-results/runner-result-${info.project.name}.png`});
 await page.getByRole('button',{name:/한 번 더 달리기/}).click();await expect(page.locator('#hearts')).toHaveAttribute('aria-label','남은 하트 3개');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
test('소리 설정, 저장소 차단, 320px 화면과 미션 모드 링크',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));await page.setViewportSize({width:320,height:760});await page.goto('/');
 await page.getByRole('button',{name:'사운드 켜기'}).click();await expect(page.getByRole('button',{name:'사운드 끄기'})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.getByRole('link',{name:/미션 모드/})).toHaveAttribute('href','./classic.html');
 await page.getByRole('button',{name:/달리기 시작/}).click();await expect(page.locator('#timer')).toContainText('02:00');
});
