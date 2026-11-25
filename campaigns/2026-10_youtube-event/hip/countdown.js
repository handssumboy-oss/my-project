const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1080, height: 1400 } });
  await p.goto('file://' + process.cwd() + '/cards.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const wk = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  for (let d = 2; d <= 14; d++) {
    const left = 14 - d;
    const date = new Date(2026, 9, d);
    const label = left === 0 ? 'D-DAY' : `D-${left}`;
    const tag = `10.${String(d).padStart(2,'0')} ${wk[date.getDay()]} · ` + (left === 0 ? 'LAST DAY' : left <= 3 ? 'LAST CALL' : 'COUNTDOWN');
    const sticker = left === 0 ? '오늘 마감' : left <= 3 ? '마감 임박' : '지금 참여 가능';
    const size = left === 0 ? 300 : left >= 10 ? 380 : 420;
    await p.evaluate(([label, tag, sticker, size]) => {
      const c = document.querySelector('#c4');
      c.querySelector('.dday').textContent = label;
      c.querySelector('.dday').style.fontSize = size + 'px';
      c.querySelector('.dday').style.top = (150 + (420 - size) * 0.5) + 'px';
      c.querySelector('.tag').textContent = tag;
      c.querySelector('.sticker').textContent = sticker;
    }, [label, tag, sticker, size]);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600); await p.evaluate(() => document.fonts.ready);
    const name = `countdown/${String(d).padStart(2,'0')}_${label}.png`;
    await p.locator('#c4').screenshot({ path: name });
    console.log(name);
  }
  await b.close();
})();
