import { test, expect } from '@playwright/test';
test('세 미션, 오답 재도전, 순서 변경, PNG, 최고기록, 다시 도전', async ({page}, testInfo) => {
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/classic.html');
 await expect(page.getByRole('heading',{level:1})).toContainText('구하기');
 await expect(page.getByRole('img',{name:'자봉이',exact:true})).toBeVisible();
 expect(await page.locator('.official-character').evaluate(img=>img.naturalWidth>0 && img.naturalHeight>0)).toBe(true);
 await page.screenshot({path:`test-results/home-${testInfo.project.name}.png`,fullPage:true});
 await page.getByRole('button',{name:/시작하기/}).click();
 await page.locator('[data-mission="1"]').click();
 await page.locator('[data-box="life"]').click();
 await expect(page.getByRole('status').first()).toContainText('먼저');
 await page.locator('[data-item="0"]').click();
 await page.locator('[data-box="life"]').click();
 await expect(page.locator('.feedback')).toContainText('공부');
 for(const [i,box] of ['study','life','study','life','study','life'].entries()) {
  await page.locator(`[data-item="${i}"]`).click(); await page.locator(`[data-box="${box}"]`).click();
 }
 await expect(page.getByRole('heading',{level:1})).toContainText('나눔');
 await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','33');
 await page.getByRole('button',{name:/다음 온기/}).click();
 await expect(page.locator('[data-mission="1"]')).toBeDisabled();
 await page.locator('[data-mission="0"]').click();
 await page.getByRole('button',{name:/잠시 쉬기/}).click();
 await expect(page.getByRole('heading',{level:1})).toContainText('쉬어');
 await page.getByRole('button',{name:/이어서/}).click();
 for(let i=0;i<6;i++) await page.locator(`[data-trash="${i}"]`).click();
 await expect(page.getByRole('heading',{level:1})).toContainText('공원');
 await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','67');
 await page.getByRole('button',{name:/다음 온기/}).click();
 await page.locator('[data-mission="2"]').click();
 await page.locator('[data-choice="0"]').click();
 await expect(page.locator('.feedback')).toContainText('먼저');
 for(const answer of [1,0,2]) {
  await page.locator(`[data-choice="${answer}"]`).click();
  await expect(page.locator('.choice.correct')).toBeDisabled();
  await page.locator('[data-action="next"]').click();
 }
 await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','100');
 await page.getByRole('button',{name:/완성된/}).click();
 await expect(page.locator('.result-score>strong')).toContainText('300점');
 await expect(page.getByRole('img',{name:'자봉이',exact:true})).toBeVisible();
 const current=await page.locator('.result-score>strong').textContent();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:/결과 이미지 저장/}).click();
 const file=await download; expect(file.suggestedFilename()).toContain('.png');
 const path=await file.path(); const {readFile}=await import('node:fs/promises'); const buffer=await readFile(path);
 expect(buffer.subarray(1,4).toString()).toBe('PNG');
 await page.screenshot({path:`test-results/result-${testInfo.project.name}.png`,fullPage:true});
 await expect(page.getByRole('link',{name:/자원봉사 찾아보기/})).toHaveAttribute('href','https://www.1365.go.kr');
 const score=Number(current.match(/\d+/)[0]);
 expect(score).toBeGreaterThanOrEqual(260); expect(score).toBeLessThanOrEqual(300);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('jabongi-best')))).toBe(score);
 await page.getByRole('button',{name:/다시 도전/}).click();
 await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','0');
 await expect(page.locator('[data-mission="0"]')).toBeEnabled();
 await page.reload(); expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('jabongi-best')))).toBe(score);
 expect(errors).toEqual([]);
});
test('시간 초과 후에도 완료 가능, 화면 넘침 없음, 소리 설정 유지',async({page})=>{
 await page.clock.install(); await page.goto('/classic.html');
 await page.getByRole('button',{name:'사운드 켜기'}).click();
 await page.reload(); await expect(page.getByRole('button',{name:'사운드 끄기'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:/시작하기/}).click(); await page.locator('[data-mission="0"]').click();
 await page.clock.fastForward(40000); await expect(page.locator('#timer')).toContainText('계속');
 for(let i=0;i<6;i++) await page.locator(`[data-trash="${i}"]`).click();
 await expect(page.getByRole('heading',{level:1})).toContainText('함께 해냈어요');
 const speed=page.locator('.score-detail span').filter({hasText:'속도'}); await expect(speed).toHaveText('속도 0');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('저장소 접근 불가 상태와 320px에서도 플레이 시작',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})});
 await page.setViewportSize({width:320,height:700}); await page.goto('/classic.html');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:/시작하기/}).click(); await page.locator('[data-mission="2"]').click();
 await expect(page.locator('.choices button')).toHaveCount(3);
});
test('공유 API가 없어도 주소를 직접 복사할 수 있음',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:undefined})});
 await page.goto('/classic.html'); await page.getByRole('button',{name:/시작하기/}).click();
 for(let stage=0;stage<3;stage++) {
  await page.locator(`[data-mission="${stage}"]`).click();
  if(stage===0) for(let i=0;i<6;i++) await page.locator(`[data-trash="${i}"]`).click();
  if(stage===1) for(const [i,box] of ['study','life','study','life','study','life'].entries()){await page.locator(`[data-item="${i}"]`).click();await page.locator(`[data-box="${box}"]`).click();}
  if(stage===2) for(const answer of [1,0,2]){await page.locator(`[data-choice="${answer}"]`).click();await page.locator('[data-action="next"]').click();}
  await page.locator('[data-action="continue"]').click();
 }
 await page.getByRole('button',{name:/게임 링크 공유/}).click();
 await expect(page.getByRole('textbox',{name:'공유할 게임 링크'})).toHaveValue('http://127.0.0.1:5173/');
});
