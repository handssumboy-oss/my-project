import {test,expect} from '@playwright/test';
import {MAKER_PLANS,playMakerWeeks} from './helpers/maker-plans.js';
import {createMaker,setActivity,beginWeek,chooseEvent,currentEvent,continueDay,nextWeek} from '../src/maker-engine.js';
test('일정 12칸·네 주 성장·마지막 프로젝트·엔딩 PNG와 도감·공유',async({page},info)=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:undefined});});
 await page.goto('/maker.html');await expect(page.getByRole('heading',{level:1})).toContainText('좋은 이웃');await page.screenshot({path:`test-results/maker-home-${info.project.name}.png`,fullPage:true});
 await page.getByRole('button',{name:/자봉이 키우기 시작/}).click();await expect(page.locator('#begin-week')).toBeDisabled();
 const project=info.project.name==='mobile'?'story':'green';await playMakerWeeks(page,MAKER_PLANS[project]);
 await expect(page.locator(`[data-project-card="${project}"]`)).toHaveClass(/ready/);await page.screenshot({path:`test-results/maker-projects-${info.project.name}.png`,fullPage:true});
 await page.locator(`[data-project="${project}"]`).click();await page.locator('[data-strategy="0"]').click();await expect(page.locator('.ending')).toBeVisible();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('jabongi-maker-save')));expect(stored.logs).toHaveLength(12);expect(stored.ending.project).toBe(project);expect(stored.ending.tier).toBeGreaterThanOrEqual(2);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:/엔딩 이미지 저장/}).click();const file=await download;expect(file.suggestedFilename()).toContain('.png');const {readFile}=await import('node:fs/promises');const data=await readFile(await file.path());expect(data.subarray(1,4).toString()).toBe('PNG');
 await page.getByRole('button',{name:/게임 링크 공유/}).click();await expect(page.getByRole('textbox',{name:'공유할 메이커 게임 링크'})).toHaveValue('http://127.0.0.1:5173/maker.html');
 await page.getByRole('button',{name:'활동 일지 보기',exact:true}).click();await expect(page.locator('.diary-entry')).toHaveCount(12);await page.getByRole('button',{name:'닫기',exact:true}).click();
 await page.getByRole('button',{name:'엔딩 도감 보기'}).click();await expect(page.locator('.stamp.earned')).toHaveCount(1);await page.keyboard.press('Escape');
 await page.screenshot({path:`test-results/maker-ending-${info.project.name}.png`,fullPage:true});
 await page.getByRole('button',{name:/다른 4주 키워보기/}).click();await expect(page.locator('#begin-week')).toBeDisabled();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('jabongi-maker-endings')))).toHaveProperty(project);expect(errors).toEqual([]);
});
test('사건·피드백 저장 후 재개, 기술 선택 잠금과 일정 비우기',async({page})=>{
 await page.goto('/maker.html');await page.getByRole('button',{name:/자봉이 키우기 시작/}).click();
 await page.locator('[data-activity="talk"]').click();await page.locator('[data-activity="cleanup"]').click();await page.locator('[data-slot="1"]').click();await expect(page.locator('[data-slot="1"]')).not.toHaveClass(/filled/);await page.locator('[data-activity="cleanup"]').click();await page.locator('[data-activity="rest"]').click();await page.locator('#begin-week').click();
 await expect(page.locator('.choice.special:not(:disabled)')).toHaveCount(1);const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('jabongi-maker-save')).stats);
 await page.reload();await page.getByRole('button',{name:/이어서 키우기/}).click();await expect(page.locator('#panel-title')).toHaveText('모임방의 빈자리');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('jabongi-maker-save')).stats)).toEqual(before);
 await page.locator('[data-choice="0"]').click();await page.reload();await page.getByRole('button',{name:/이어서 키우기/}).click();await expect(page.locator('#continue-day')).toBeVisible();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('jabongi-maker-save')).logs.length)).toBe(1);await page.locator('#continue-day').click();await expect(page.locator('.choice.special')).toBeDisabled();
 await page.setViewportSize({width:320,height:760});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('나머지 두 프로젝트 저장 상태로 재개하여 엔딩 분기 확인',async({page})=>{
 for(const project of ['festival','companion']){
  const s=createMaker();for(const week of MAKER_PLANS[project]){week.forEach(id=>setActivity(s,id));beginWeek(s);for(let day=0;day<3;day++){chooseEvent(s,currentEvent(s).choices.filter(c=>c.available).at(-1).index);continueDay(s);}nextWeek(s);}
  await page.goto('/maker.html');await page.evaluate(raw=>localStorage.setItem('jabongi-maker-save',JSON.stringify(raw)),s);await page.reload();await page.getByRole('button',{name:/이어서 키우기/}).click();await page.locator(`[data-project="${project}"]`).click();await page.locator('[data-strategy="1"]').click();await expect(page.locator('.ending')).toBeVisible();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('jabongi-maker-save')).ending.project)).toBe(project);
 }
});
test('저장소 차단과 320px에서도 시작·선택·소리·기존 모드 링크 동작',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));await page.setViewportSize({width:320,height:760});await page.goto('/maker.html');await page.getByRole('button',{name:'사운드 켜기'}).click();await expect(page.getByRole('button',{name:'사운드 끄기'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:/자봉이 키우기 시작/}).click();for(let i=0;i<3;i++)await page.locator('[data-activity="rest"]').click();await page.locator('#begin-week').click();await page.locator('.choice:not(:disabled)').first().click();await expect(page.locator('#continue-day')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole('link',{name:/자봉이 점프 모험/})).toHaveAttribute('href','./');expect(errors).toEqual([]);
});
