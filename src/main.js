import { townSVG, placeholder } from './art.js';
import { CHARACTER_PATH, MISSIONS, ITEMS, QUESTIONS } from './config.js';
import { timedScore, neighborScore } from './scoring.js';
const app = document.querySelector('#app');
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
let best = Number(read('jabongi-best', 0));
if (!Number.isFinite(best) || best < 0 || best > 300) best = 0;
let sound = read('jabongi-sound', false) === true;
let lastCompleted = 0;
let screen = 'home', scores = [null, null, null], active = null, interval, audio;
let officialImage = null;
if (CHARACTER_PATH) {
 const img = new Image();
 img.onload = () => { officialImage = img; render(); };
 img.src = new URL(`../assets/characters/${CHARACTER_PATH}`, import.meta.url).href;
}
const total = () => scores.reduce((sum, s) => sum + (s?.total || 0), 0);
const warmth = () => Math.round(scores.filter(Boolean).length / 3 * 100);
const character = () => officialImage ? `<img src="${officialImage.src}" alt="자봉이" class="official-character">` : placeholder();
function announce(message) { document.querySelector('#announcement').textContent = message; }
function beep(success = true) {
 if (!sound) return;
 try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume().catch(() => {}); const o = audio.createOscillator(), gain = audio.createGain(); o.connect(gain); gain.connect(audio.destination); o.frequency.setValueAtTime(success ? 650 : 240, audio.currentTime); o.frequency.exponentialRampToValueAtTime(success ? 1000 : 180, audio.currentTime + .13); gain.gain.setValueAtTime(.055, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .2); o.start(); o.stop(audio.currentTime + .2); } catch { /* Sound is optional. */ }
}
function shell(content) {
 app.innerHTML = `<div class="site"><header class="topbar"><a href="./" class="brand" aria-label="자봉이의 동네 구하기 처음으로"><span class="brand-icon">♥</span><span>자봉이의 동네 구하기<small>우리 동네에 온기를 더하는 작은 모험</small></span></a><div class="header-actions"><span class="best">♛ 최고 기록 <b>${best}</b></span><button class="sound" data-action="sound" aria-pressed="${sound}" aria-label="사운드 ${sound ? '끄기' : '켜기'}">${sound ? '♫' : '♪'}<span>소리 ${sound ? 'ON' : 'OFF'}</span></button></div></header><main id="main" tabindex="-1">${content}</main><footer><span>한국중앙자원봉사센터 · 자봉이와 함께하는 자원봉사</span><span>작은 행동, 커다란 변화 <i>♥</i></span></footer></div>`;
 app.querySelector('.brand').onclick = e => { e.preventDefault(); if (active) pause(); else go('home'); };
 app.querySelector('[data-action="sound"]').onclick = () => { sound = !sound; write('jabongi-sound', sound); render(); beep(); };
}
function go(next) { clearInterval(interval); screen = next; render(); document.querySelector('#main')?.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
function meter() { return `<div class="warmth"><div><span>♥ 동네 온기</span><b>${warmth()}<small>%</small></b></div><div class="meter" role="progressbar" aria-label="동네 온기" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${warmth()}"><span style="width:${warmth()}%"></span></div></div>`; }
function missionCards(selectable = false) {
 return MISSIONS.map((m, i) => `<${selectable ? 'button' : 'div'} class="mission-card ${m.color} ${scores[i] ? 'finished' : ''}" ${selectable ? `data-mission="${i}" ${scores[i] ? 'disabled' : ''}` : ''}><span class="mission-icon">${scores[i] ? '✓' : m.icon}</span><span class="mission-copy"><small>LEVEL 0${i + 1} <span>· ${m.target ? `${m.target}초 목표` : '천천히 함께'}</span></small><strong>${m.title}</strong><span>${selectable && scores[i] ? `${scores[i].total}점 · 온기를 더했어요` : m.sub}</span></span><span class="card-arrow">${scores[i] ? '✓' : '↗'}</span></${selectable ? 'button' : 'div'}>`).join('');
}
function renderHome() {
 shell(`<section class="hero"><div class="hero-copy"><span class="eyebrow"><span></span> 우리 동네를 바꾸는 3가지 미션</span><h1>자봉이의<br>동네 <span>구하기<i>✦</i></span></h1><p class="hero-description">작은 행동이 모이면<br><strong>우리 동네가 달라져요!</strong></p><p class="intro">쓰레기를 줍고, 마음을 나누고, 이웃을 도와요.<br>자봉이와 함께 따뜻한 동네를 만들어 볼까요?</p><button class="primary start" data-action="start">자봉이와 시작하기 <span>→</span></button><div class="play-meta"><span>◷ 약 2–3분</span><span>♧ 누구나 함께</span><span>✓ 가입 없이 바로</span></div></div><div class="hero-visual"><div class="sky-tag">오늘도, 좋은 일이 생길 거예요 ☀</div>${townSVG(false, 'hero')}<div class="place-tag park-tag">♧ 초록 공원</div><div class="place-tag share-tag">▣ 나눔센터</div><div class="hero-character"><div class="speech">우리 같이 해볼까? <span>♥</span></div><div class="mascot">${character()}</div></div><span class="art-note">${officialImage ? '자봉이와 함께 출발!' : '임시 캐릭터 · 공식 이미지 적용 예정'}</span></div></section><section class="missions-preview"><div class="section-heading"><h2>세 번의 작은 실천, 하나의 따뜻한 동네</h2><span>어떤 모험이 기다릴까요?</span></div><div class="cards">${missionCards()}</div></section><div class="bottom-note"><span>♡</span> 잘하지 않아도 괜찮아요. 함께하는 마음이 가장 중요하니까요.</div>`);
 app.querySelector('[data-action="start"]').onclick = () => { beep(); go('map'); };
}
function renderMap() {
 shell(`<section class="page-heading"><div><span class="eyebrow">OUR LITTLE NEIGHBORHOOD</span><h1>우리 동네에 온기를 더해요</h1><p>마음이 가는 곳부터, 작은 실천을 시작해 보세요.</p></div>${meter()}</section><div class="map-layout"><div class="map-scene">${townSVG(warmth() === 100, 'map')}<div class="map-caption">${warmth() === 100 ? '우리 동네가 따뜻해졌어요! ♥' : '당신의 작은 손길을 기다리고 있어요'}</div></div><div class="map-missions">${missionCards(true)}<p class="muted">✓ 완료한 미션의 점수는 이번 도전에 한 번만 반영돼요.</p>${warmth() === 100 ? '<button class="primary" data-action="result">우리 동네 결과 보기 →</button>' : ''}</div></div>`);
 app.querySelectorAll('[data-mission]').forEach(b => b.onclick = () => startMission(Number(b.dataset.mission)));
 app.querySelector('[data-action="result"]')?.addEventListener('click', () => go('result'));
}
function startMission(index) {
 if (scores[index]) return;
 active = { index, done: new Set(), selected: null, started: performance.now(), paused: 0, last: null, streak: 0, combo: 0, question: 0, correct: 0, answered: false, message: '', wrong: false };
 beep(); screen = 'play'; render(); tick(); clearInterval(interval); interval = setInterval(tick, 250); document.querySelector('#main').focus({ preventScroll: true });
}
function elapsed() { return Math.max(0, (performance.now() - active.started - active.paused) / 1000); }
function tick() {
 if (!active || screen !== 'play' || active.index === 2) return;
 const target = MISSIONS[active.index].target, seconds = elapsed();
 const el = document.querySelector('#timer');
 if (el) { el.textContent = seconds >= target ? `+${Math.floor(seconds - target)}초 · 계속할 수 있어요` : `목표까지 ${Math.ceil(target - seconds)}초`; el.classList.toggle('overtime', seconds >= target); }
}
function chain() {
 const now = elapsed(); active.streak = active.last !== null && now - active.last <= 4 ? active.streak + 1 : 1; active.last = now; active.combo = Math.max(active.combo, active.streak - 1);
}
function playFrame(body) {
 const m = MISSIONS[active.index], count = active.index === 2 ? active.question : active.done.size;
 shell(`<section class="play-heading"><button class="text-button" data-action="pause">← 잠시 쉬기</button><span>LEVEL 0${active.index + 1} / 03</span>${meter()}</section><section class="mission-heading"><span class="eyebrow">${m.place}에 온기를 더해요</span><h1>${m.title}</h1><p>${active.index === 0 ? '공원에 떨어진 쓰레기 6개를 톡톡 터치해 주세요.' : active.index === 1 ? '물건을 먼저 선택하고, 알맞은 상자를 터치해 주세요.' : '도움의 시작은 먼저 묻는 마음이에요.'}</p></section><div class="play-toolbar"><span id="timer">${m.target ? '목표시간 ' + m.target + '초' : '◷ 시간제한 없이, 천천히'}</span><span>${active.index === 2 ? '이웃' : '미션'} <b>${count}</b> / ${active.index === 2 ? 3 : 6}</span></div>${body}<div class="feedback ${active.wrong ? 'hint' : ''}" role="status">${active.message || (active.index === 0 ? '✨ 4초 안에 연속으로 주우면 콤보!' : active.index === 1 ? '♡ 나누는 물건은 깨끗하고 안전하게 준비해요.' : '♡ 이웃의 선택을 존중하는 도움을 골라 보세요.')}</div>`);
 app.querySelector('[data-action="pause"]').onclick = pause;
 tick();
}
function renderPark() {
 const trash = [['🥤','종이컵',21,51],['🧃','음료 팩',67,40],['🗞️','신문지',39,65],['🥡','빈 포장 용기',78,69],['🧴','빈 플라스틱병',55,80],['📃','종잇조각',17,79]];
 playFrame(`<div class="park-board ${active.done.size === 6 ? 'restored' : ''}">${townSVG(false, 'park')}${trash.map(([icon,label,x,y],i) => `<button class="trash ${active.done.has(i) ? 'collected' : ''}" style="left:${x}%;top:${y}%" data-trash="${i}" aria-label="${label} 수거" ${active.done.has(i) ? 'disabled' : ''}>${icon}<span>${active.done.has(i) ? '✓' : '+'}</span></button>`).join('')}<span class="board-sign">초록 공원</span></div>`);
 app.querySelectorAll('[data-trash]').forEach(b => b.onclick = () => {
 const i = Number(b.dataset.trash); if (active.done.has(i)) return;
 active.done.add(i); chain(); active.message = `+10점 · ${active.done.size}/6 수거 완료! ${active.streak > 1 ? `${active.streak} COMBO ♥` : '좋은 시작이에요!'}`; beep(); announce(active.message);
 if (active.done.size === 6) finish(); else { render(); const next = app.querySelector('.trash:not(:disabled)'); next?.focus({ preventScroll: true }); }
 });
}
function renderBoxes() {
 playFrame(`<div class="sorting-board"><div class="items">${ITEMS.map((item, i) => `<button class="item ${active.selected === i ? 'selected' : ''}" data-item="${i}" aria-pressed="${active.selected === i}" ${active.done.has(i) ? 'disabled' : ''}><span>${active.done.has(i) ? '✓' : item.icon}</span>${item.name}</button>`).join('')}</div><div class="sorting-arrow">${active.selected === null ? '물건을 선택해 주세요' : `${ITEMS[active.selected].name} → 어느 상자에 넣을까요?`} ↓</div><div class="boxes"><button class="box study" data-box="study"><span>📚</span><strong>공부 상자</strong><small>배움에 쓰는 물건</small></button><button class="box life" data-box="life"><span>🧼</span><strong>생활 상자</strong><small>생활과 위생에 쓰는 물건</small></button></div></div>`);
 app.querySelectorAll('[data-item]').forEach(b => b.onclick = () => { active.selected = Number(b.dataset.item); active.message = ''; active.wrong = false; render(); app.querySelector('[data-box]')?.focus({ preventScroll: true }); });
 app.querySelectorAll('[data-box]').forEach(b => b.onclick = () => {
 if (active.selected === null) { active.message = '먼저 나눌 물건을 선택해 주세요.'; active.wrong = true; render(); return; }
 const item = ITEMS[active.selected];
 if (item.box !== b.dataset.box) { active.streak = 0; active.last = null; active.message = `${item.name}${item.name === '수건' ? '은' : '은(는)'} ${item.box === 'study' ? '배움에 사용하는 물건이에요. 공부' : '생활과 위생에 필요한 물건이에요. 생활'} 상자에 넣어 볼까요?`; active.wrong = true; beep(false); render(); app.querySelector(`[data-box="${item.box}"]`)?.focus({ preventScroll: true }); return; }
 active.done.add(active.selected); active.selected = null; chain(); active.wrong = false; active.message = `+10점 · ${item.name} 나눔 완료! ${active.streak > 1 ? `${active.streak} COMBO ♥` : '마음이 차곡차곡 쌓여요.'}`; beep();
 if (active.done.size === 6) finish(); else { render(); app.querySelector('[data-item]:not(:disabled)')?.focus({ preventScroll: true }); }
 });
}
function renderNeighbors() {
 const q = QUESTIONS[active.question];
 playFrame(`<div class="neighbor-board"><div class="neighbor-portrait">${q.icon}<span>♥</span></div><small>${q.who}</small><h2>${q.line}</h2><p>${q.prompt}</p><div class="choices">${q.options.map((o,i) => `<button class="choice ${active.answered && i === q.answer ? 'correct' : ''}" data-choice="${i}" ${active.answered ? 'disabled' : ''}><span>${String(i+1).padStart(2,'0')}</span>${o}${active.answered && i === q.answer ? ' ✓' : ''}</button>`).join('')}</div>${active.answered ? `<button class="primary next-neighbor" data-action="next">${active.question === 2 ? '이웃 미션 완료하기' : '다음 이웃 만나기'} →</button>` : ''}</div>`);
 app.querySelectorAll('[data-choice]').forEach(b => b.onclick = () => {
 if (active.answered) return;
 if (Number(b.dataset.choice) !== q.answer) { active.message = q.hint; active.wrong = true; beep(false); render(); app.querySelector('[data-choice]')?.focus({ preventScroll: true }); return; }
 active.correct++; active.answered = true; active.wrong = false; active.message = q.feedback; beep(); render(); app.querySelector('[data-action="next"]').focus({ preventScroll: true });
 });
 app.querySelector('[data-action="next"]')?.addEventListener('click', () => { if (active.question === 2) finish(); else { active.question++; active.answered = false; active.message = ''; render(); app.querySelector('[data-choice]')?.focus({ preventScroll: true }); } });
}
function finish() {
 const i = active.index; lastCompleted = i;
 scores[i] = i === 2 ? neighborScore(active.correct, true) : timedScore({ completed: 6, combo: active.combo, elapsed: elapsed(), target: MISSIONS[i].target });
 active = null; go('complete'); beep();
}
function renderComplete() {
 const index = lastCompleted, s = scores[index], m = MISSIONS[index];
 shell(`<section class="completion"><span class="success-medal">✓</span><span class="eyebrow">MISSION COMPLETE</span><h1>${m.title}<br><em>함께 해냈어요!</em></h1><p>${['쓰레기 없는 공원이 다시 반짝여요.', '나눔 상자에 따뜻한 마음이 가득해요.', '먼저 묻고 존중하는 마음이 이웃에게 닿았어요.'][index]}</p><div class="completed-art">${townSVG(true, 'complete')}</div><div class="score-card"><span>이번 미션 점수</span><strong>${s.total}<small> / 100점</small></strong><div class="score-detail"><span>${index === 2 ? '적절한 선택' : '수행'} <b>${s.performance}</b></span><span>완료 <b>${s.completion}</b></span>${index < 2 ? `<span>콤보 <b>${s.combo}</b></span><span>속도 <b>${s.speed}</b></span>` : ''}</div></div>${meter()}<button class="primary" data-action="continue">${warmth() === 100 ? '완성된 우리 동네 보기' : '다음 온기 더하러 가기'} →</button></section>`);
 app.querySelector('[data-action="continue"]').onclick = () => go(warmth() === 100 ? 'result' : 'map');
}
function renderResult() {
 const isNew = total() > best;
 if (isNew) { best = total(); write('jabongi-best', best); }
 shell(`<section class="result"><span class="eyebrow">A LITTLE KINDNESS, A BIG CHANGE</span><h1>우리가 함께 만든<br><em>100% 따뜻한 동네</em></h1><p>작은 행동이 모이면 우리 동네가 달라져요!</p><div class="result-visual">${townSVG(true, 'result')}<div class="result-character">${character()}</div></div><div class="result-score"><span>${isNew ? '✦ 새로운 최고 기록!' : '♥ 우리 동네 지킴이'}</span><strong>${total()}<small> / 300점</small></strong><div class="result-breakdown">${scores.map((s,i) => `<span>LEVEL 0${i+1}<b>${s.total}점</b></span>`).join('')}</div></div><p class="result-message">게임 속 따뜻함을, 이제 우리 동네에서도 이어가요.</p><div class="result-actions"><button class="secondary" data-action="save">↓ 결과 이미지 저장</button><button class="secondary" data-action="share">↗ 게임 링크 공유</button></div><div id="share-fallback"></div><a class="primary volunteer" href="https://www.1365.go.kr" target="_blank" rel="noopener noreferrer">자원봉사 찾아보기 <span>↗</span></a><button class="text-button retry" data-action="retry">↻ 다시 도전하기</button><div class="feedback" id="result-status" role="status"></div></section>`);
 app.querySelector('[data-action="retry"]').onclick = () => { scores = [null,null,null]; go('map'); };
 app.querySelector('[data-action="save"]').onclick = saveImage;
 app.querySelector('[data-action="share"]').onclick = share;
}
async function saveImage() {
 const status = document.querySelector('#result-status');
 try {
 await document.fonts.ready;
 const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 1200;
 const c = canvas.getContext('2d'); c.fillStyle = '#f8f7ee'; c.fillRect(0,0,1000,1200); c.textAlign = 'center';
 c.fillStyle = '#34846c'; c.font = 'bold 24px sans-serif'; c.fillText('자봉이의 동네 구하기',500,90);
 c.fillStyle = '#294d40'; c.font = 'bold 52px sans-serif'; c.fillText('우리가 함께 만든',500,180); c.fillText('100% 따뜻한 동네',500,250);
 const blob = new Blob([townSVG(true,'export')], {type:'image/svg+xml'}), url = URL.createObjectURL(blob);
 try { const img = new Image(); img.src = url; await img.decode(); c.drawImage(img,110,280,780,585); } finally { URL.revokeObjectURL(url); }
 if (officialImage) { const ratio = Math.min(180/officialImage.width,210/officialImage.height); c.drawImage(officialImage,730,680,officialImage.width*ratio,officialImage.height*ratio); }
 else { c.fillStyle='#edbd57'; c.beginPath(); c.arc(800,760,45,0,Math.PI*2); c.fill(); c.fillStyle='#294d40'; c.font='24px sans-serif'; c.fillText('• ᴗ •',800,765); }
 c.fillStyle='#34846c'; c.font='bold 90px sans-serif'; c.fillText(`${total()} / 300`,500,930);
 c.fillStyle='#466454'; c.font='26px sans-serif'; c.fillText('작은 행동이 모이면 우리 동네가 달라져요!',500,1010); c.font='20px sans-serif'; c.fillText('한국중앙자원봉사센터 · 자원봉사로 이어지는 마음',500,1080);
 const png = await new Promise(resolve => canvas.toBlob(resolve,'image/png')); if (!png) throw new Error('PNG');
 const downloadURL = URL.createObjectURL(png); const a = document.createElement('a'); a.href=downloadURL; a.download='자봉이-따뜻한-우리동네.png'; a.textContent='결과 이미지 다운로드'; a.className='download-link'; document.querySelector('#share-fallback').replaceChildren(a); a.click(); setTimeout(()=>URL.revokeObjectURL(downloadURL),60000); status.textContent='결과 이미지를 준비했어요. 다운로드가 안 되면 위 링크를 눌러 주세요.';
 } catch { status.textContent='이미지를 저장하지 못했어요. 화면 캡처로 따뜻한 순간을 남겨 주세요.'; }
}
async function share() {
 const url = new URL('./', location.href).href, text = `자봉이와 ${total()}점! 작은 행동으로 우리 동네를 따뜻하게 만들었어요.`;
 try { if (navigator.share) { await navigator.share({ title:'자봉이의 동네 구하기', text, url }); return; } if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); document.querySelector('#result-status').textContent='게임 링크를 복사했어요!'; return; } } catch(e) { if(e.name === 'AbortError') return; }
 const input=document.createElement('input'); input.value=url; input.readOnly=true; input.setAttribute('aria-label','공유할 게임 링크'); document.querySelector('#share-fallback').replaceChildren(input); input.select(); document.querySelector('#result-status').textContent='이 링크를 복사해서 공유해 주세요.';
}
function pause() {
 if (!active || screen !== 'play') return;
 active.pauseStart = performance.now(); go('pause');
}
function renderPause() {
 shell(`<section class="pause-screen"><span class="success-medal">☕</span><h1>잠깐, 쉬어 가도 괜찮아요</h1><p>쉬는 동안 목표시간도 잠시 멈춰요.</p><button class="primary" data-action="resume">이어서 플레이 →</button><button class="text-button" data-action="leave">이번 미션을 나중에 하기</button></section>`);
 app.querySelector('[data-action="resume"]').onclick = () => { active.paused += performance.now()-active.pauseStart; screen='play'; render(); interval=setInterval(tick,250); };
 app.querySelector('[data-action="leave"]').onclick = () => { active=null; go('map'); };
}
document.addEventListener('visibilitychange', () => { if (document.hidden && active && screen==='play') pause(); });
function render() {
 if(screen==='home') renderHome(); else if(screen==='map') renderMap(); else if(screen==='complete') renderComplete(); else if(screen==='result') renderResult(); else if(screen==='pause') renderPause(); else if(active) [renderPark,renderBoxes,renderNeighbors][active.index]();
}
render();
