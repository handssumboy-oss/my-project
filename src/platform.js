import { POWER_FORMS, shootHeart } from './platform-powerups.js';
import { createAdventure, updateAdventure, pressJump, releaseJump, advanceWorld, nextLap, WORLDS } from './platform-engine.js';
import { renderAdventure, adventureViewWidth, spriteFrame } from './platform-renderer.js';
import { missionStatus, missionHint, nearbyNeighbor, answerNeighbor, choiceOrder, BADGES } from './platform-missions.js';
import { createRanking, gradeFor } from './platform-ranking.js';
import { BOSSES, GIMMICKS } from './platform-features.js';
import { createAudio } from './platform-audio.js';
const spriteURL = new URL('../assets/characters/jabongi-front-motion.png', import.meta.url).href;
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ } };
let best = Number(read('jabongi-adventure-best', 0));
if (!Number.isFinite(best) || best < 0) best = 0;
let challengeBest = Number(read('jabongi-challenge-best', 0));
if (!Number.isFinite(challengeBest) || challengeBest < 0) challengeBest = 0;
let unlocked = read('jabongi-adventure-cleared', false) === true;
let sound = read('jabongi-sound', false) === true;
const sfx = createAudio(), reduceMotion = matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const fx = {shake:0, sparks:[]}, coarse = matchMedia?.('(pointer: coarse)').matches;
const ranking = createRanking(); let rankingSubmitted = false, rankView = {mode:'normal', period:'week', view:'player'}, rankToken = 0;
const escapeHTML = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Short vibrations help on phones; desktops and iOS simply ignore them.
const haptic = pattern => { if (coarse && navigator.vibrate) try { navigator.vibrate(pattern); } catch { /* optional */ } };
let mode = 'home', game = createAdventure(), camera = 0, ambient = 0, last = 0, messageUntil = 0;
const keys = new Set(), touches = new Map();
let tapDirection = 0, tapUntil = 0;
const app = document.querySelector('#app');
app.innerHTML = `<div class="site"><header class="header"><a class="brand" href="./"><span class="brand-icon">♥</span><span>자봉이의 동네 구하기<small>A LITTLE NEIGHBORHOOD ADVENTURE</small></span></a><div class="header-right"><span class="best"><span id="best-label">BEST</span> <b id="best">${best.toLocaleString()}</b></span><button id="sound" class="icon-button" aria-label="사운드 켜기" aria-pressed="false">♪</button></div></header><main><div class="game-shell"><canvas id="game" tabindex="0" role="img" aria-label="자봉이 가로 스크롤 모험. 좌우 방향키로 이동하고 스페이스로 점프합니다." aria-describedby="instructions"></canvas><div class="hud hidden" id="hud"><div class="hud-group"><div class="hud-pill"><small>SCORE</small><b id="score">0000</b></div><div class="hud-pill hearts"><small>LIFE</small><b id="hearts" aria-label="남은 하트 3개">♥♥♥</b></div></div><div class="hud-group hud-right"><div class="world-label"><span id="challenge-tag" class="challenge-tag hidden">CHALLENGE</span><span id="world-number">WORLD 01</span><b id="world-name">초록 공원</b></div><button class="icon-button" id="pause" aria-label="일시정지">Ⅱ</button></div></div><div class="progress hidden" id="progress"><small id="checkpoint-label">깃발을 향해 출발!</small><div class="progress-track" role="progressbar" aria-label="동네 탐험 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="progress-fill"></span></div></div><div class="quest-panel hidden" id="quest-panel"><span id="quest-icon">♧</span><div><strong id="quest-title"></strong><small id="quest-detail"></small></div><b id="stars" aria-label="별 0개">☆☆☆</b></div><button id="interact" class="interact-button hidden" aria-label="이웃과 대화하기">E · 대화하기</button><div id="power-bar" class="power-bar hidden"><span id="power-icon">♡</span><strong id="power-name">기본 자봉이</strong><small id="power-tip">성장 하트를 찾아보세요</small></div><div class="game-message hidden" id="message"><span></span></div><div class="controls hidden" id="controls"><div class="direction" id="dpad"><button class="control" data-direction="left" aria-label="왼쪽으로 이동">←</button><button class="control" data-direction="right" aria-label="오른쪽으로 이동">→</button></div><span class="control-note">← → MOVE · SPACE JUMP · X HEART · E TALK</span><div class="action-controls"><button id="attack" class="control attack hidden" data-direction="attack" aria-label="정화 하트 발사">♡ 발사</button><button class="control jump" data-direction="jump" aria-label="점프">JUMP ↑</button></div></div><div class="overlay" id="overlay"></div></div><section class="worlds" id="instructions" aria-label="모험과 조작 방법">${WORLDS.map((w,i) => `<div class="world-card"><span>${['♧','◇','✦'][i]}</span><div><small>WORLD 0${i+1} · ${['WALK & JUMP','SHARE & DISCOVER','TOGETHER, WE SHINE'][i]}</small><strong>${w.name}</strong><p>${['쓰레기를 모아 지킴이와 분리배출해요.','책·생활·간식 꾸러미를 세 집에 전해요.','세 이웃의 이야기를 듣고 마음을 존중해요.'][i]}</p><p class="world-extra">${GIMMICKS[i]} · 보스 ${BOSSES[i].name}</p></div></div>`).join('')}</section></main><footer><span>한국중앙자원봉사센터 · 작은 행동이 모이면 우리 동네가 달라져요!</span><span><a href="./maker.html">자원봉사자 메이커 RPG ↗</a> &nbsp; / &nbsp; <a href="./retro.html">레트로 러너 ↗</a> &nbsp; / &nbsp; <a href="./classic.html">차근차근 미션 ↗</a></span></footer></div>`;
const $ = id => document.getElementById(id), canvas = $('game'), ctx = canvas.getContext('2d'), overlay = $('overlay');
const sprite = new Image(); sprite.src = spriteURL;
let width = 0, height = 0;
function resize() {
  const r = canvas.getBoundingClientRect(); width = r.width; height = r.height;
  const dpr = Math.min(2, devicePixelRatio || 1); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
new ResizeObserver(resize).observe(canvas); resize();
function soundUI() { $('sound').textContent = sound ? '♫' : '♪'; $('sound').setAttribute('aria-label', sound ? '사운드 끄기' : '사운드 켜기'); $('sound').setAttribute('aria-pressed', String(sound)); }
function tone(type) { if (sound) sfx.play(type); }
function music() { if (sound && mode === 'playing') sfx.music(game.world); else sfx.stop(); }
soundUI(); $('sound').onclick = () => { sound = !sound; write('jabongi-sound', sound); soundUI(); tone('collect'); music(); };
function announce(text) { $('announcement').textContent = text; }
function message(text, seconds = 3) { $('message').classList.remove('hidden'); $('message').firstElementChild.textContent = text; messageUntil = game.time + seconds; announce(text); }
function ui(visible) { if(!visible)$('interact').classList.add('hidden'); for (const id of ['hud','progress','controls','quest-panel','power-bar']) $(id).classList.toggle('hidden', !visible); }
function showBest() { const c = game.challenge && mode !== 'home'; $('best-label').textContent = c ? 'CHALLENGE BEST' : 'BEST'; $('best').textContent = (c ? challengeBest : best).toLocaleString(); }
function clearInput() { keys.clear(); touches.clear(); tapDirection = 0; releaseJump(game); app.querySelectorAll('.pressed').forEach(b => b.classList.remove('pressed')); }
function home() {
  clearInput(); mode = 'home'; game = createAdventure(); camera = 0; ui(false); music(); showBest(); $('message').classList.add('hidden'); overlay.className = 'overlay';
  overlay.innerHTML = `<div class="home-copy"><span class="eyebrow">JABONGI WORLD · STORY ADVENTURE</span><h1>폴짝,<em>한 걸음 더.</em></h1><p>작은 발판을 넘어, 더 따뜻한 동네로.<br><strong>공원 청소, 나눔 배달, 이웃의 부탁까지!</strong></p><button class="primary" id="start">모험 시작하기 <span>→</span></button>${unlocked ? '<button class="challenge-button" id="challenge">✦ 도전 모드 <small>하트 2개 · 더 빠른 먼지 · 강한 보스</small></button>' : '<p class="challenge-lock">🔒 세 동네를 완주하면 도전 모드가 열려요</p>'}<button class="rank-open" id="rank-home">🏆 랭킹 보기</button><div class="home-meta"><span>← → 직접 이동</span><span>↑ 꾹 눌러 점프</span><span>♥ 아이템 먹고 진화</span><span>☁ 보스 정화</span></div></div><div class="speech">성장 하트와 나눔 꽃을 찾아봐! ✿</div><div class="hero-sticker transparent motion-sticker"><img src="${spriteURL}" alt="정면이 보이는 3D 자봉이"></div><span class="edition">SMALL STEPS / A WARMER WORLD</span>`;
  $('start').onclick = () => start(false); if (unlocked) $('challenge').onclick = () => start(true); $('rank-home').onclick = () => openRanking();
}
function start(challenge = game.challenge) { clearInput(); rankingSubmitted = false; game = createAdventure({challenge: challenge === true}); camera = 0; fx.sparks = []; fx.shake = 0; mode = 'playing'; overlay.className = 'overlay hidden'; ui(true); $('challenge-tag').classList.toggle('hidden', !game.challenge); showBest(); message(game.challenge ? '도전 모드! 하트 2개로 세 동네를 지켜 주세요.' : '공원 지킴이의 부탁! 쓰레기 3개를 모아 전해 주세요.', 5); updateHUD(); music(); canvas.focus({preventScroll:true}); }
function pause() {
  if (mode !== 'playing') return;
  clearInput(); mode = 'paused'; game.phase = 'paused'; music(); overlay.className = 'overlay modal-overlay';
  overlay.innerHTML = `<div class="modal"><span class="eyebrow">A LITTLE BREAK</span><h2>천천히 가도 괜찮아요.</h2><p>쉬는 동안 자봉이와 동네도 기다려요.</p><button class="primary" id="resume">이어서 모험하기 →</button><button class="secondary text-link" id="restart">처음부터 다시 하기</button></div>`;
  $('resume').onclick = () => { clearInput(); mode = 'playing'; game.phase = 'playing'; overlay.className = 'overlay hidden'; music(); canvas.focus({preventScroll:true}); };
  $('restart').onclick = () => start(); $('resume').focus({preventScroll:true});
}
$('pause').onclick = pause;
function worldClear() {
  clearInput(); mode = 'worldClear'; music(); ui(false); $('message').classList.add('hidden'); overlay.className = 'overlay modal-overlay';
  overlay.innerHTML = `<div class="modal"><span class="eyebrow">WORLD 0${game.world+1} COMPLETE</span><h2>${WORLDS[game.world].name}에<br>온기를 더했어요!</h2><p>${BADGES[game.world]} 배지를 받았어요! ${BOSSES[game.world].name}도 정화했어요.<br>숨은 별 ${game.level.mission.stars}/3개 · 다음 동네에서 하트 +1</p><div class="world-stars">${"★".repeat(game.level.mission.stars)}${"☆".repeat(3-game.level.mission.stars)}</div><p class="time-line">${Math.round(game.worldResults.at(-1).seconds)}초 완주 · ${game.worldResults.at(-1).timeBonus?`타임 보너스 +${game.worldResults.at(-1).timeBonus}`:'다음엔 더 빨리 도전해 봐요!'}</p><div class="result-score">${game.score}<small>점</small></div><button class="primary" id="next-world">${WORLDS[game.world+1].name}으로 출발 →</button></div>`;
  $('next-world').onclick = () => { advanceWorld(game); camera = 0; mode = 'playing'; overlay.className = 'overlay hidden'; ui(true); updateHUD(); message(`WORLD 0${game.world+1} · ${WORLDS[game.world].tag} · ${GIMMICKS[game.world]}`, 4); music(); canvas.focus({preventScroll:true}); };
  $('next-world').focus({preventScroll:true}); announce('깃발에 도착했어요! 다음 동네로 이동할 수 있어요.');
}
function result() {
  clearInput(); mode = 'result'; music(); ui(false); $('message').classList.add('hidden'); const record = game.score > (game.challenge ? challengeBest : best);
  if (record && game.challenge) { challengeBest = game.score; write('jabongi-challenge-best', challengeBest); } else if (record) { best = game.score; write('jabongi-adventure-best', best); }
  const cleared = game.phase === 'clear', newlyUnlocked = cleared && !unlocked; if (cleared) { unlocked = true; write('jabongi-adventure-cleared', true); } showBest();
  const grade = gradeFor(game.score), badges = game.worldResults.slice(-3);
  overlay.className = 'overlay modal-overlay';
  overlay.innerHTML = `<div class="modal"><span class="eyebrow">${game.challenge?'CHALLENGE · ':''}Lv.${game.lap} · ${record?'NEW BEST ADVENTURE ✦':cleared?'OUR NEIGHBORHOOD, TOGETHER':'EVERY LITTLE STEP COUNTS'}</span><h2>${cleared?`Lv.${game.lap} 세 동네, 모험 성공!`:'한 번 더, 폴짝!'}</h2><p>${cleared?`다음 레벨은 먼지가 더 빠르고 보스가 더 강해요. 점수는 그대로 이어져요!`:`Lv.${game.lap}까지 왔어요. 지금까지 모은 온기도 동네에 남아 있어요.`}</p>
  <div class="result-line"><span class="grade grade-${grade}" aria-label="등급 ${grade}">${grade}</span><div class="result-score">${game.score.toLocaleString()}<small>점</small></div></div>
  ${cleared?`<button class="primary next-lap" id="next-lap">🔥 Lv.${game.lap+1} 계속 도전하기 <span>→</span></button>`:''}
  ${rankingForm()}<div class="rank-top" id="rank-top" aria-live="polite"></div>
  <div class="stats"><div><small>도달 레벨</small><b>Lv.${game.lap}</b></div><div><small>모은 온기</small><b>${game.collected}개</b></div><div><small>타임 보너스</small><b>+${game.timeBonus}</b></div><div><small>첫 마음</small><b>${game.firstTry}번</b></div><div><small>최고 콤보</small><b>x${game.maxCombo}</b></div><div><small>보스 정화</small><b>${game.bossesCleared}마리</b></div></div>${newlyUnlocked ? '<p class="unlock-note">✦ 도전 모드가 열렸어요! 처음 화면에서 도전해 보세요.</p>' : ''}<p class="best-power">최고 진화 · ${POWER_FORMS[game.maxPower].name} · 정화 하트 성공 ${game.purified}번</p><div class="earned-badges">${badges.map(r=>`<span>✓ ${r.badge}<small>${"★".repeat(r.stars)}${"☆".repeat(3-r.stars)}</small></span>`).join('')}</div><button class="${cleared?'secondary retry-wide':'primary'}" id="retry">${cleared?'처음부터 다시 하기 ↻':'다시 모험하기 ↻'}</button><div class="secondary-row"><button class="secondary" id="download">↓ 결과 이미지 저장</button><button class="secondary" id="share">↗ 게임 링크 공유</button></div><div id="share-fallback"></div><a class="text-link" href="https://www.1365.go.kr" target="_blank" rel="noopener noreferrer">우리 동네에서 자원봉사 찾아보기 ↗</a><p id="result-status" role="status"></p></div>`;
  bindRankingForm(); showTopThree(); $('retry').onclick = () => start(); $('download').onclick = download; $('share').onclick = share;
  if (cleared) { $('next-lap').onclick = continueLap; $('next-lap').focus({preventScroll:true}); } else if (!coarse) $('rank-nickname').focus({preventScroll:true}); // Phones would pop the keyboard over the result.
  announce(`모험 종료. Lv.${game.lap}, ${game.score}점, 온기 ${game.collected}개.`);
}
function continueLap() {
  if (!nextLap(game)) return;
  clearInput(); rankingSubmitted = false; camera = 0; mode = 'playing'; overlay.className = 'overlay hidden'; ui(true); updateHUD(); music();
  message(`🔥 Lv.${game.lap} 시작! 먼지가 더 빨라지고 보스가 강해졌어요. 보상도 ${game.lap}배!`, 5); tone('power'); shake(.4); canvas.focus({preventScroll:true});
}
// A small live "this week's top 3" under the form gives every result a target to beat.
function showTopThree() {
  const target = $('rank-top'), token = rankToken, view = {mode:game.challenge ? 'challenge' : 'normal', period:'week', view:'player'};
  ranking.board(view).then(board => {
    if (token !== rankToken || mode !== 'result' || !target.isConnected) return;
    const rows = (board.rows ?? []).slice(0, 3);
    target.innerHTML = rows.length ? `<small>${board.online ? '이번 주 TOP 3' : '이 기기 TOP 3'} · 이 점수를 넘어 보세요!</small><ol>${rows.map(r => `<li><span>${['🥇','🥈','🥉'][r.rank - 1] ?? r.rank}</span><b>${escapeHTML(r.nickname)}</b>${r.lap > 1 ? `<em>Lv.${r.lap}</em>` : ''}<strong>${r.score.toLocaleString()}</strong></li>`).join('')}</ol>` : `<small>이번 주 첫 기록의 주인공이 되어 보세요! 🏆</small>`;
  }, () => {});
}
function updateHUD() {
  $('score').textContent = String(game.score).padStart(4,'0'); $('hearts').textContent = '♥'.repeat(game.hearts) + '♡'.repeat(game.maxHearts-game.hearts); $('hearts').setAttribute('aria-label',`남은 하트 ${game.hearts}개`);
  $('world-number').textContent = `${game.lap>1?`Lv.${game.lap} · `:''}WORLD 0${game.world+1}`; $('world-name').textContent = WORLDS[game.world].name;
  const progress = Math.min(100,Math.max(0,Math.floor(game.player.x / game.level.spec.goal*100)));
  $('progress-fill').style.width = `${progress}%`; app.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',progress);
  $('checkpoint-label').textContent = game.checkpointActive ? '중간 깃발 저장됨 ⚑' : '목적지 깃발로 →';
  const quest=missionStatus(game);$('quest-title').textContent=quest.title;$('quest-detail').textContent=quest.detail;$('quest-icon').textContent=quest.complete?'✓':['♧','▣','♡'][game.world];$('stars').textContent='★'.repeat(quest.stars)+'☆'.repeat(3-quest.stars);$('stars').setAttribute('aria-label',`숨은 별 ${quest.stars}개`);
  const npc=nearbyNeighbor(game);$('interact').classList.toggle('hidden',!npc||mode!=='playing');if(npc)$('interact').textContent=`E · ${npc.name}`;
  const form=POWER_FORMS[game.power];$('power-icon').textContent=form.icon;$('power-name').textContent=form.name;$('power-tip').textContent=form.tip;$('power-bar').dataset.level=game.power;$('attack').classList.toggle('hidden',game.power!==2);$('attack').classList.toggle('cooling',game.shotCooldown>0||game.shots.length>=3);canvas.dataset.powerLevel=game.power;canvas.dataset.projectileCount=game.shots.length;
  canvas.dataset.facing=game.player.facing;canvas.dataset.spriteFrame=spriteFrame(game.player,ambient);canvas.dataset.world=game.world;canvas.dataset.missionComplete=String(quest.complete);canvas.dataset.bossHp=game.level.boss.hp;canvas.dataset.bossState=game.level.boss.state;canvas.dataset.combo=game.combo;
  canvas.dataset.playerX = Math.round(game.player.x); canvas.dataset.playerY = Math.round(game.player.y); canvas.dataset.grounded = String(game.player.grounded);
}
function shake(amount) { if (!reduceMotion) fx.shake = Math.max(fx.shake, amount); }
// Visual-only sparkles; game rules never read them.
function burst(x, y, count, color) { if (x == null) return; for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2, v = 90 + Math.random() * 170; fx.sparks.push({x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, r: 2 + Math.random() * 3, life: .7, max: .7, color}); } if (fx.sparks.length > 160) fx.sparks.splice(0, fx.sparks.length - 160); }
function fire(){if(mode==='playing'&&shootHeart(game))tone('collect');}
function jumpDown() { if (mode === 'playing') pressJump(game); }
function directionInput() { const values = [...touches.values()]; return {left:keys.has('ArrowLeft')||keys.has('KeyA')||values.includes('left')||(tapDirection<0&&game.time<tapUntil),right:keys.has('ArrowRight')||keys.has('KeyD')||values.includes('right')||(tapDirection>0&&game.time<tapUntil)}; }
// One movement pad: the half under the finger sets the direction, so sliding switches left/right without lifting.
const pad = $('dpad');
const padDirection = e => { const r = pad.getBoundingClientRect(); return e.clientX < r.left + r.width / 2 ? 'left' : 'right'; };
const padMark = () => { const held = [...touches.values()]; for (const b of pad.querySelectorAll('[data-direction]')) b.classList.toggle('pressed', held.includes(b.dataset.direction)); };
pad.addEventListener('pointerdown', e => { if (mode !== 'playing') return; e.preventDefault(); pad.setPointerCapture(e.pointerId); touches.set(e.pointerId, padDirection(e)); padMark(); });
pad.addEventListener('pointermove', e => { if (['left','right'].includes(touches.get(e.pointerId))) { touches.set(e.pointerId, padDirection(e)); padMark(); } });
const padEnd = e => { if (['left','right'].includes(touches.get(e.pointerId))) touches.delete(e.pointerId); padMark(); };
for (const type of ['pointerup','pointercancel','lostpointercapture']) pad.addEventListener(type, padEnd);
app.querySelector('.game-shell').addEventListener('contextmenu', e => e.preventDefault());
for (const b of app.querySelectorAll('[data-direction]')) {
  if (['left','right'].includes(b.dataset.direction)) { b.addEventListener('click', e => { if (e.detail === 0 && mode === 'playing') { tapDirection = b.dataset.direction === 'left' ? -1 : 1; tapUntil = game.time + .2; } }); continue; }
  b.addEventListener('pointerdown', e => { if (mode !== 'playing') return; e.preventDefault(); touches.set(e.pointerId,b.dataset.direction); b.setPointerCapture(e.pointerId); b.classList.add('pressed'); if(b.dataset.direction==='jump')jumpDown();else if(b.dataset.direction==='attack')fire(); });
  const end = e => { const d = touches.get(e.pointerId); touches.delete(e.pointerId); b.classList.remove('pressed'); if(d==='jump')releaseJump(game); };
  b.addEventListener('pointerup',end); b.addEventListener('pointercancel',end); b.addEventListener('lostpointercapture',end);
  b.addEventListener('click', e => { if (e.detail === 0 && mode === 'playing') { if(b.dataset.direction==='attack')fire();else if(b.dataset.direction==='jump')jumpDown(); else {tapDirection=b.dataset.direction==='left'?-1:1;tapUntil=game.time+.2;} } });
}
canvas.addEventListener('pointerdown',e => { if(mode==='playing'){touches.set(e.pointerId,'jump');canvas.setPointerCapture(e.pointerId);jumpDown();} });
const canvasRelease = e => { if(touches.get(e.pointerId)==='jump')releaseJump(game);touches.delete(e.pointerId); };
canvas.addEventListener('pointerup',canvasRelease); canvas.addEventListener('pointercancel',canvasRelease);
function interact() {
  if(mode!=='playing')return;
  const npc=nearbyNeighbor(game);if(!npc){message(missionHint(game));return;}
  const m=game.level.mission;
  if((game.world===0&&m.trash<3)||(game.world===1&&!m.inventory[npc.kind])){message(missionHint(game),4);return;}
  clearInput();mode='dialogue';game.phase='dialogue';$('interact').classList.add('hidden');overlay.className='overlay modal-overlay';
  overlay.innerHTML=`<div class="modal neighbor-dialog"><span class="eyebrow">${npc.name}</span><h2>${game.world===0?'초록 공원을 부탁해요!':game.world===1?'나눔이 도착했어요!':'어떤 마음으로 도울까요?'}</h2><p>${npc.question}</p><div class="dialogue-choices">${choiceOrder(npc.choices.length).map((index,i)=>`<button class="dialogue-choice" data-answer="${index}"><span>0${i+1}</span>${npc.choices[index]}</button>`).join('')}</div><p id="dialogue-feedback" role="status"></p><button class="text-link secondary" id="later">잠깐, 주변을 더 살펴볼게요</button></div>`;
  app.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
    const result=answerNeighbor(game,npc.id,Number(b.dataset.answer));
    if(!result.ok){$('dialogue-feedback').textContent=result.text;tone('hurt');return;}
    tone('collect');haptic(20);overlay.innerHTML=`<div class="modal"><span class="eyebrow">작은 실천 성공 · +${result.points}</span>${result.bonus?'<p class="first-try">✦ 첫 마음 보너스 +50 · 한 번에 마음을 읽었어요!</p>':''}<h2>${missionStatus(game).complete?BADGES[game.world]+'!':'따뜻한 마음이 전해졌어요.'}</h2><p>${result.text}</p><button class="primary" id="continue-story">계속 모험하기 →</button></div>`;$('continue-story').onclick=closeDialogue;$('continue-story').focus({preventScroll:true});announce(result.text);updateHUD();
  });
  $('later').onclick=closeDialogue;app.querySelector('[data-answer]').focus({preventScroll:true});
}
function closeDialogue(){clearInput();mode='playing';game.phase='playing';overlay.className='overlay hidden';updateHUD();canvas.focus({preventScroll:true});}
$('interact').onclick=interact;
document.addEventListener('keydown', e => {
  if (mode !== 'playing') return;
  if (['ArrowLeft','ArrowRight','KeyA','KeyD','Space','ArrowUp','KeyW','Escape','KeyP','KeyE','KeyX','KeyF'].includes(e.code)) {
    if (e.target instanceof HTMLButtonElement && ['Space','Enter'].includes(e.code)) return;
    e.preventDefault(); if(e.repeat)return;
    if(['Escape','KeyP'].includes(e.code)) pause(); else if(e.code==='KeyE')interact(); else {keys.add(e.code);if(['Space','ArrowUp','KeyW'].includes(e.code))jumpDown();if(['KeyX','KeyF'].includes(e.code))fire();}
  }
});
document.addEventListener('keyup',e => { keys.delete(e.code); if(['Space','ArrowUp','KeyW'].includes(e.code))releaseJump(game); });
document.addEventListener('visibilitychange',() => { if(document.hidden)pause(); });
window.addEventListener('blur',pause);
app.querySelector('.brand').onclick = e => {e.preventDefault();if(mode==='playing')pause();else home();};
function frame(now) {
  const dt=last?Math.min(.05,(now-last)/1000):0; last=now; ambient+=dt;
  if(mode==='playing') {
    if(keys.has('KeyX')||keys.has('KeyF')||[...touches.values()].includes('attack'))fire();
    updateAdventure(game,dt,directionInput());
    for(const e of game.events) {
      if(e.type==='jump')tone('jump'); else if(['collect','gift','stomp','purify'].includes(e.type)){tone(e.type==='stomp'||e.type==='purify'?'stomp':'collect');game.particles.push({...e,life:1});burst(e.x,e.y,e.type==='collect'?5:10,e.type==='purify'?'#f2a9bd':'#ffe39c');if(e.type==='stomp'||e.type==='purify')haptic(12);if(e.type==='gift')message(e.text,1.5);}
      else if(e.type==='hurt'){tone('hurt');shake(.6);haptic(45);message(e.text);} else if(e.type==='checkpoint'){tone('collect');message(e.text,3);}
      else if(e.type==='bossWake'){tone('boss');shake(.4);message(e.text,4);} else if(e.type==='bossHit'){tone('bossHit');shake(.35);haptic(25);burst(e.x,e.y,14,'#c7bddb');game.particles.push({...e,life:1.2});}
      else if(e.type==='bossDown'){tone('bossDown');shake(.8);haptic([30,40,60]);burst(e.x,e.y,36,'#ffd8e3');burst(e.x,e.y,24,'#fff1b8');game.particles.push({...e,life:1.6});} else if(e.type==='gate'){message(e.text,3);}
      else if(['wind','lamp'].includes(e.type)){tone(e.type);if(e.type==='lamp')burst(e.x,e.y,12,'#fff0b0');message(e.text,2.5);}
      else if(['missionItem','spring','objective','shield','powerup','powerdown'].includes(e.type)){if(e.type!=='objective')tone(e.type==='powerup'?'power':'collect');message(e.text,3);}
    }
    game.particles.forEach(p=>p.life-=dt); game.particles=game.particles.filter(p=>p.life>0);
    fx.shake=Math.max(0,fx.shake-dt*1.8);for(const p of fx.sparks){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=520*dt;}fx.sparks=fx.sparks.filter(p=>p.life>0);
    const view=adventureViewWidth(width,height),target=Math.max(0,Math.min(game.level.spec.length-view,game.player.x-view*.32)); camera+=(target-camera)*Math.min(1,dt*7);
    if(game.time>messageUntil)$('message').classList.add('hidden'); updateHUD();
    if(game.phase==='worldClear')worldClear();else if(['clear','over'].includes(game.phase))result();
  }
  renderAdventure(ctx,width,height,game,sprite,camera,ambient,mode==='home',fx); requestAnimationFrame(frame);
}
async function download() {
  try {
    const output=document.createElement('canvas');output.width=1000;output.height=1100;const c=output.getContext('2d');c.fillStyle='#f5f3e4';c.fillRect(0,0,1000,1100);
    const scene=document.createElement('canvas');scene.width=1000;scene.height=550;renderAdventure(scene.getContext('2d'),1000,550,game,sprite,camera,ambient,false);c.drawImage(scene,0,230);
    c.fillStyle='#5b8062';c.textAlign='center';c.font='bold 25px sans-serif';c.fillText('자봉이의 동네 구하기 · 작은 동네의 모험',500,85);c.font='bold 51px sans-serif';c.fillText(game.phase==='clear'?'세 동네, 모험 성공!':'작은 발판을 넘어, 더 따뜻한 동네로.',500,170);
    c.font='bold 80px sans-serif';c.fillText(`${game.score}점`,500,890);c.font='26px sans-serif';c.fillText(`온기 ${game.collected}개 · 먼지 정화 ${game.stomps+game.purified}번`,500,955);c.font='20px sans-serif';c.fillText('작은 행동이 모이면 우리 동네가 달라져요!',500,1040);
    const blob=await new Promise(r=>output.toBlob(r,'image/png'));if(!blob)throw Error();const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='자봉이-동네모험-결과.png';a.textContent='결과 이미지 다운로드';a.className='text-link';$('share-fallback').replaceChildren(a);a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);$('result-status').textContent='모험의 기록을 저장했어요.';
  } catch { $('result-status').textContent='저장이 어려우면 화면 캡처로 모험을 남겨 주세요.'; }
}
async function share() {
  const url=new URL('./',location.href).href,text=`자봉이와 동네 모험 ${game.score}점! 함께 폴짝 뛰어볼까요?`;
  try { if(navigator.share){await navigator.share({title:'자봉이의 동네 구하기',text,url});return;}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);$('result-status').textContent='게임 링크를 복사했어요!';return;} } catch(e) {if(e.name==='AbortError')return;}
  const input=document.createElement('input');input.value=url;input.readOnly=true;input.className='share-field';input.setAttribute('aria-label','공유할 게임 링크');$('share-fallback').replaceChildren(input);input.select();$('result-status').textContent='이 링크를 복사해 함께 모험해요.';
}
function rankingForm() {
  const p = ranking.profile();
  return `<form class="rank-form" id="rank-form" novalidate><strong>🏆 랭킹에 내 기록 올리기 <span>Lv.${game.lap} · ${game.score.toLocaleString()}점</span></strong><div class="rank-fields"><label><span>닉네임</span><input id="rank-nickname" maxlength="8" autocomplete="off" enterkeyhint="next" value="${escapeHTML(p.nickname)}" placeholder="2~8자"></label><label><span>소속 <small>(선택)</small></span><input id="rank-group" maxlength="12" autocomplete="off" enterkeyhint="done" value="${escapeHTML(p.group)}" placeholder="예: 행복봉사단"></label></div><p class="rank-notice">실명·전화번호·학교 반 같은 개인정보는 쓰지 마세요. 닉네임과 소속은 랭킹에 공개돼요.</p><button class="rank-submit" type="submit" id="rank-submit">${game.challenge ? '도전 모드 ' : ''}기록 등록</button><p id="rank-status" role="status"></p></form>`;
}
function bindRankingForm() {
  const form = $('rank-form'), status = $('rank-status'), button = $('rank-submit');
  if (rankingSubmitted) { button.disabled = true; button.textContent = '등록 완료 ✓'; }
  form.onsubmit = async e => {
    e.preventDefault(); if (rankingSubmitted) return;
    button.disabled = true; status.textContent = '기록을 등록하는 중…';
    const seconds = game.worldResults.reduce((sum, r) => sum + r.seconds, 0) || game.time;
    const r = await ranking.submit({nickname:$('rank-nickname').value, group:$('rank-group').value, score:game.score, lap:game.lap, mode:game.challenge ? 'challenge' : 'normal', cleared:game.phase === 'clear', maxCombo:game.maxCombo, bosses:game.bossesCleared, seconds});
    if (!r.ok) { status.textContent = r.error; button.disabled = false; return; }
    rankingSubmitted = true; button.textContent = '등록 완료 ✓'; tone('bossDown'); haptic([20,30,20]);
    showTopThree(); status.innerHTML = `<b>${r.online ? '전체' : '이 기기'} ${r.rank}위</b> / ${r.total}명 ${r.offline ? '· 연결이 어려워 이 기기에만 저장했어요' : ''} <button type="button" class="text-link" id="rank-view">랭킹 보기 →</button>`;
    $('rank-view').onclick = () => openRanking(game.challenge ? 'challenge' : 'normal');
  };
}
// Shows the leaderboard over the current screen and restores that screen (with its handlers) on close.
function openRanking(focusMode) {
  const saved = [...overlay.childNodes], savedClass = overlay.className, token = ++rankToken;
  if (focusMode) rankView = {...rankView, mode:focusMode, view:'player'};
  overlay.className = 'overlay modal-overlay';
  const tab = (key, value, label) => `<button type="button" class="rank-tab${rankView[key] === value ? ' active' : ''}" data-key="${key}" data-value="${value}" aria-pressed="${rankView[key] === value}">${label}</button>`;
  const render = board => {
    if (token !== rankToken) return;
    const me = ranking.profile(), rows = board.rows ?? [];
    const list = rows.length ? rows.map(r => rankView.view === 'group'
      ? `<li class="rank-row"><span class="rank-no">${r.rank}</span><span class="rank-name">${escapeHTML(r.group)}<small>${r.members}명 참여</small></span><b>${r.score.toLocaleString()}</b></li>`
      : `<li class="rank-row${r.nickname === me.nickname && r.group === me.group ? ' me' : ''}"><span class="rank-no">${r.rank <= 3 ? ['🥇','🥈','🥉'][r.rank - 1] : r.rank}</span><span class="rank-name">${escapeHTML(r.nickname)}${r.lap > 1 ? ` <em class="rank-lap">Lv.${r.lap}</em>` : ''}${r.group ? `<small>${escapeHTML(r.group)}</small>` : ''}</span><b>${r.score.toLocaleString()}</b></li>`).join('')
      : `<li class="rank-empty">${rankView.view === 'group' ? '아직 소속 기록이 없어요. 소속을 적고 등록해 보세요!' : '아직 기록이 없어요. 첫 번째 주인공이 되어 보세요!'}</li>`;
    overlay.innerHTML = `<div class="modal rank-modal"><span class="eyebrow">${board.online ? 'LIVE RANKING' : 'THIS DEVICE RANKING'}</span><h2>🏆 동네 영웅 랭킹</h2><div class="rank-tabs">${tab('mode','normal','일반')}${tab('mode','challenge','도전')}</div><div class="rank-tabs">${tab('view','player','개인')}${tab('view','group','소속')}${tab('period','week','이번 주')}${tab('period','all','전체')}</div><ol class="rank-list">${list}</ol><p class="rank-notice">${board.online ? `${board.total}${rankView.view === 'group' ? '개 소속' : '명'} 참여 · 소속 점수는 구성원 최고 기록 상위 5명의 합계예요.` : board.offline ? '랭킹 서버에 연결하지 못해 이 기기 기록만 보여요.' : '지금은 이 기기에서 플레이한 기록끼리 순위를 매겨요.'}</p><button class="primary" id="rank-close">돌아가기</button></div>`;
    overlay.querySelectorAll('.rank-tab').forEach(b => b.onclick = () => { rankView = {...rankView, [b.dataset.key]:b.dataset.value}; rankToken++; overlay.replaceChildren(...saved); overlay.className = savedClass; openRanking(); });
    $('rank-close').onclick = () => { rankToken++; overlay.replaceChildren(...saved); overlay.className = savedClass; };
    $('rank-close').focus({preventScroll:true});
  };
  overlay.innerHTML = `<div class="modal rank-modal"><h2>🏆 동네 영웅 랭킹</h2><p>순위를 불러오는 중…</p></div>`;
  ranking.board(rankView).then(render, () => render({rows:[], online:false, offline:true}));
}
home(); requestAnimationFrame(frame);
