import {test,expect} from '@playwright/test';
import {storyRoute} from './helpers/story-route.js';
test('실제 키 입력과 대화로 세 동네 목표를 수행하고 배지 획득',async({page},info)=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto('/');await page.getByRole('button',{name:/모험 시작하기/}).click();
 for(const route of storyRoute()){
  let time=0;await page.keyboard.down('ArrowRight');
  for(const action of route.actions){
   await page.clock.runFor(Math.max(0,action.at-time));time=Math.max(time,action.at);
   if(action.type==='jump'){await page.keyboard.up('Space');await page.keyboard.down('Space');}
   else{
    for(let i=0;i<6&&!(await page.locator('#interact').isVisible());i++){await page.clock.runFor(25);time+=25;}
    await expect(page.locator('#interact')).toBeVisible();await page.keyboard.up('ArrowRight');await page.keyboard.press('e');
    await expect(page.locator('[data-answer]')).toHaveCount(2);
    if(route.world===0){await page.locator('[data-answer="1"]').click();await expect(page.locator('#dialogue-feedback')).not.toBeEmpty();}
    await page.screenshot({path:`test-results/story-dialog-${route.world}-${info.project.name}.png`});
    await page.locator(`[data-answer="${action.answer}"]`).click();await expect(page.getByRole('button',{name:/계속 모험하기/})).toBeVisible();await page.getByRole('button',{name:/계속 모험하기/}).click();await page.keyboard.down('ArrowRight');
   }
  }
  await page.clock.runFor(Math.max(0,route.duration-time)+300);await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');
  if(route.world<2){await expect(page.getByRole('button',{name:/으로 출발/})).toBeVisible();await page.getByRole('button',{name:/으로 출발/}).click();}
 }
 await expect(page.getByRole('heading',{level:2})).toContainText('세 동네, 모험 성공');await expect(page.locator('.earned-badges>span')).toHaveCount(3);await page.screenshot({path:`test-results/story-complete-${info.project.name}.png`});expect(errors).toEqual([]);
});
test('오른쪽·왼쪽 시선, 걷기·점프 프레임과 스프라이트 알파',async({page})=>{
 await page.clock.install();const response=page.waitForResponse(r=>r.url().includes('jabongi-front-motion')&&r.status()===200);await page.goto('/');const sheetURL=(await response).url();
 const alpha=await page.evaluate(async url=>{const image=new Image();image.src=url;await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const d=ctx.getImageData(0,0,c.width,c.height).data;return [[0,0],[c.width/2,0],[0,c.height/2],[c.width/2,c.height/2]].map(([x,y])=>d[(y*c.width+x)*4+3]);},sheetURL);expect(alpha).toEqual([0,0,0,0]);
 await page.getByRole('button',{name:/모험 시작하기/}).click();const c=page.locator('#game');await page.keyboard.down('ArrowRight');await page.clock.runFor(180);await expect(c).toHaveAttribute('data-facing','1');expect(['1','2']).toContain(await c.getAttribute('data-sprite-frame'));await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowLeft');await page.clock.runFor(180);await expect(c).toHaveAttribute('data-facing','-1');await page.keyboard.up('ArrowLeft');await page.keyboard.down('Space');await page.clock.runFor(150);await expect(c).toHaveAttribute('data-sprite-frame','3');await page.keyboard.up('Space');
});
