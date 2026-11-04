import {test,expect} from '@playwright/test';
async function gameOver(page){await page.getByRole('button',{name:/모험 시작하기/}).click();await page.keyboard.down('ArrowRight');await page.clock.runFor(13000);await page.keyboard.up('ArrowRight');await expect(page.getByRole('heading',{level:2})).toContainText('한 번 더');}
test('서버 연결 전에는 기기 랭킹에 닉네임·소속으로 등록하고 순위를 봄',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto('/');await gameOver(page);
 await expect(page.locator('.grade')).toBeVisible();
 await page.getByLabel('닉네임').fill('010-1234-5678');await page.getByRole('button',{name:/기록 등록/}).click();await expect(page.locator('#rank-status')).toContainText('연락처');
 await page.getByLabel('닉네임').fill('폴짝왕');await page.getByLabel(/소속/).fill('햇살봉사단');await page.getByRole('button',{name:/기록 등록/}).click();
 await expect(page.locator('#rank-status')).toContainText('이 기기 1위');await expect(page.getByRole('button',{name:/등록 완료/})).toBeDisabled();
 await page.getByRole('button',{name:/랭킹 보기/}).click();await expect(page.locator('.rank-row.me')).toContainText('폴짝왕');await expect(page.locator('.rank-modal .eyebrow')).toHaveText('THIS DEVICE RANKING');
 await page.getByRole('button',{name:'소속'}).click();await expect(page.locator('.rank-row')).toContainText('햇살봉사단');
 await page.getByRole('button',{name:'돌아가기'}).click();await expect(page.getByRole('button',{name:/다시 모험하기/})).toBeVisible();await expect(page.getByRole('button',{name:/등록 완료/})).toBeDisabled();
 await page.getByRole('button',{name:/다시 모험하기/}).click();await page.getByRole('button',{name:'일시정지'}).click();await page.getByRole('button',{name:/처음부터/}).click();
 expect(errors).toEqual([]);
});
test('랭킹 서버가 설정되면 시트의 실시간 순위를 불러오고 탭으로 바꿔 봄',async({page})=>{
 const requests=[];
 await page.addInitScript(()=>{window.JABONGI_RANKING_ENDPOINT='https://script.google.com/macros/s/test/exec';});
 await page.route('https://script.google.com/**',route=>{const url=new URL(route.request().url());requests.push(route.request().method()+' '+url.search);
  const view=url.searchParams.get('view');route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(view==='group'?{ok:true,view,total:1,rows:[{rank:1,group:'별빛단',score:9000,members:4}]}:{ok:true,view:'player',total:2,rows:[{rank:1,nickname:'일등',group:'별빛단',score:6100},{rank:2,nickname:'이등',group:'',score:4000}]})});});
 await page.goto('/');await page.getByRole('button',{name:/랭킹 보기/}).click();
 await expect(page.locator('.rank-modal .eyebrow')).toHaveText('LIVE RANKING');await expect(page.locator('.rank-row').first()).toContainText('일등');
 await page.getByRole('button',{name:'소속'}).click();await expect(page.locator('.rank-row')).toContainText('4명 참여');
 await page.getByRole('button',{name:'도전'}).click();expect(requests.at(-1)).toContain('mode=challenge');
 await page.getByRole('button',{name:'돌아가기'}).click();await expect(page.getByRole('button',{name:/모험 시작하기/})).toBeVisible();
});
