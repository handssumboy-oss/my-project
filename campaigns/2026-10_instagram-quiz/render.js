// 사용법: 이 폴더에서 `node render.js` → quiz_1_question.png, quiz_2_answer.png(기본), quiz_meme_1_question.png, quiz_meme_2_answer.png(밈 버전) 생성
// 서체는 fonts/ 폴더의 서브셋(Noto Sans KR, Black Han Sans, SIL OFL)을 쓴다. 문구를 바꾸면 새 글자가 빠질 수 있으니 서브셋을 다시 받아야 한다.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1400 }, deviceScaleFactor: 1 });
  await p.goto('file://' + __dirname + '/quiz.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const loaded = await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family));
  console.log('loaded fonts:', [...new Set(loaded)].join(', '));
  await p.locator('#q1').screenshot({ path: __dirname + '/quiz_1_question.png' });
  await p.locator('#a1').screenshot({ path: __dirname + '/quiz_2_answer.png' });
  await p.locator('#q2').screenshot({ path: __dirname + '/quiz_meme_1_question.png' });
  await p.locator('#a2').screenshot({ path: __dirname + '/quiz_meme_2_answer.png' });
  await b.close();
})();
