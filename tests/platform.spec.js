import { test, expect } from '@playwright/test';
test('가로 스크롤 이동·높이 조절 점프·일시정지·결과와 재도전', async ({page},info) => {
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toContainText('한 걸음 더');await expect(page.getByRole('img',{name:'점프하는 3D 자봉이'})).toBeVisible();
 await page.screenshot({path:`test-results/platform-home-${info.project.name}.png`,fullPage:true});
 await page.getByRole('button',{name:/모험 시작하기/}).click();const canvas=page.locator('#game');
 await page.keyboard.down('ArrowRight');await page.clock.runFor(600);await page.keyboard.up('ArrowRight');expect(Number(await canvas.getAttribute('data-player-x'))).toBeGreaterThan(180);
 await page.keyboard.down('Space');await page.clock.runFor(180);expect(Number(await canvas.getAttribute('data-player-y'))).toBeLessThan(300);await page.keyboard.up('Space');await page.clock.runFor(700);
 await expect(canvas).toHaveAttribute('data-grounded','true');
 await page.getByRole('button',{name:'일시정지'}).click();const x=await canvas.getAttribute('data-player-x');await page.clock.fastForward(6000);await expect(canvas).toHaveAttribute('data-player-x',x);
 await page.getByRole('button',{name:/이어서 모험하기/}).click();await page.screenshot({path:`test-results/platform-play-${info.project.name}.png`});
 await page.keyboard.down('ArrowRight');await page.clock.runFor(13000);await page.keyboard.up('ArrowRight');
 await expect(page.getByRole('heading',{level:2})).toContainText('한 번 더');
 const d=page.waitForEvent('download');await page.getByRole('button',{name:/결과 이미지 저장/}).click();expect((await d).suggestedFilename()).toContain('.png');
 await page.getByRole('button',{name:/다시 모험하기/}).click();await expect(page.locator('#hearts')).toHaveAttribute('aria-label','남은 하트 3개');expect(Number(await canvas.getAttribute('data-player-x'))).toBeLessThan(90);
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('터치 버튼을 함께 누르면 이동하며 점프, 손을 떼면 멈춤',async({page},info)=>{
 if(info.project.name!=='mobile'){test.skip();return;}
 await page.clock.install();await page.goto('/');await page.getByRole('button',{name:/모험 시작하기/}).click();
 const right=await page.getByRole('button',{name:'오른쪽으로 이동'}).boundingBox(),jump=await page.getByRole('button',{name:'점프',exact:true}).boundingBox();
 const client=await page.context().newCDPSession(page);const touch=(r,id)=>({x:r.x+r.width/2,y:r.y+r.height/2,id});
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(right,1)]});await page.clock.runFor(450);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(right,1),touch(jump,2)]});await page.clock.runFor(180);
 expect(Number(await page.locator('#game').getAttribute('data-player-x'))).toBeGreaterThan(180);expect(Number(await page.locator('#game').getAttribute('data-player-y'))).toBeLessThan(300);
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.clock.runFor(450);const x=Number(await page.locator('#game').getAttribute('data-player-x'));await page.clock.runFor(400);expect(Math.abs(Number(await page.locator('#game').getAttribute('data-player-x'))-x)).toBeLessThan(2);
});
test('저장소 차단·320px·소리 전환과 기존 게임 링크',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));await page.setViewportSize({width:320,height:760});await page.goto('/');
 await page.getByRole('button',{name:'사운드 켜기'}).click();await expect(page.getByRole('button',{name:'사운드 끄기'})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole('link',{name:/레트로 러너/})).toHaveAttribute('href','./retro.html');await expect(page.getByRole('link',{name:/차근차근 미션/})).toHaveAttribute('href','./classic.html');
});
