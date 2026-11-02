import {test,expect} from '@playwright/test';
import {storyRoute} from './helpers/story-route.js';
test('실제 획득으로 성장·꽃빛 진화, 하트 발사·일시정지·먼지 정화',async({page},info)=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-01-01T09:00:00')});await page.goto('/');await page.clock.pauseAt(new Date('2026-01-01T09:10:00'));await page.getByRole('button',{name:/모험 시작하기/}).click();
 const canvas=page.locator('#game');await expect(page.getByRole('button',{name:'정화 하트 발사'})).toBeHidden();
 await page.keyboard.down('ArrowRight');await page.clock.runFor(250);await expect(canvas).toHaveAttribute('data-power-level','1');await expect(page.locator('#power-name')).toHaveText('든든 자봉이');
 let time=250;for(const action of storyRoute()[0].actions.filter(a=>a.type==='jump'&&a.at<=2500)){await page.clock.runFor(action.at-time);time=action.at;await page.keyboard.up('Space');await page.keyboard.down('Space');}
 await page.clock.runFor(2500-time);await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');await page.clock.runFor(180);await expect(canvas).toHaveAttribute('data-power-level','2');await expect(page.locator('#power-name')).toHaveText('꽃빛 자봉이');
 const before=Number(await page.locator('#score').textContent());await page.getByRole('button',{name:'정화 하트 발사'}).click();await page.clock.runFor(50);await expect(canvas).toHaveAttribute('data-projectile-count','1');
 await page.screenshot({path:`test-results/power-flower-${info.project.name}.png`});
 await page.getByRole('button',{name:'일시정지'}).click();await page.clock.fastForward(5000);await expect(canvas).toHaveAttribute('data-projectile-count','1');await page.getByRole('button',{name:/이어서 모험하기/}).click();await page.clock.runFor(1250);await expect(canvas).toHaveAttribute('data-projectile-count','0');expect(Number(await page.locator('#score').textContent())).toBe(before+30);
 if(info.project.name==='mobile'){
  const rect=await page.getByRole('button',{name:'정화 하트 발사'}).boundingBox(),client=await page.context().newCDPSession(page);await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width/2,y:rect.y+rect.height/2,id:1}]});await page.clock.runFor(600);expect(Number(await canvas.getAttribute('data-projectile-count'))).toBeGreaterThan(0);await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.clock.runFor(1400);await expect(canvas).toHaveAttribute('data-projectile-count','0');
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
