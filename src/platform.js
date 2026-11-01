import { createAdventure, updateAdventure, pressJump, releaseJump, advanceWorld, WORLDS } from './platform-engine.js';
import { renderAdventure, adventureViewWidth, spriteFrame } from './platform-renderer.js';
import { missionStatus, missionHint, nearbyNeighbor, answerNeighbor, BADGES } from './platform-missions.js';
const spriteURL = new URL('../assets/characters/jabongi-front-motion.png', import.meta.url).href;
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ } };
let best = Number(read('jabongi-adventure-best', 0));
if (!Number.isFinite(best) || best < 0) best = 0;
let sound = read('jabongi-sound', false) === true;
let mode = 'home', game = createAdventure(), camera = 0, ambient = 0, last = 0, messageUntil = 0, audio;
const keys = new Set(), touches = new Map();
let tapDirection = 0, tapUntil = 0;
const app = document.querySelector('#app');
app.innerHTML = `<div class="site"><header class="header"><a class="brand" href="./"><span class="brand-icon">♥</span><span>자봉이의 동네 구하기<small>A LITTLE NEIGHBORHOOD ADVENTURE</small></span></a><div class="header-right"><span class="best">BEST <b id="best">${best.toLocaleString()}</b></span><button id="sound" class="icon-button" aria-label="사운드 켜기" aria-pressed="false">♪</button></div></header><main><div class="game-shell"><canvas id="game" tabindex="0" role="img" aria-label="자봉이 가로 스크롤 모험. 좌우 방향키로 이동하고 스페이스로 점프합니다." aria-describedby="instructions"></canvas><div class="hud hidden" id="hud"><div class="hud-group"><div class="hud-pill"><small>SCORE</small><b id="score">0000</b></div><div class="hud-pill hearts"><small>LIFE</small><b id="hearts" aria-label="남은 하트 3개">♥♥♥</b></div></div><div class="hud-group hud-right"><div class="world-label"><span id="world-number">WORLD 01</span><b id="world-name">초록 공원</b></div><button class="icon-button" id="pause" aria-label="일시정지">Ⅱ</button></div></div><div class="progress hidden" id="progress"><small id="checkpoint-label">깃발을 향해 출발!</small><div class="progress-track" role="progressbar" aria-label="동네 탐험 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="progress-fill"></span></div></div><div class="quest-panel hidden" id="quest-panel"><span id="quest-icon">♧</span><div><strong id="quest-title"></strong><small id="quest-detail"></small></div><b id="stars" aria-label="별 0개">☆☆☆</b></div><button id="interact" class="interact-button hidden" aria-label="이웃과 대화하기">E · 대화하기</button><div class="game-message hidden" id="message"><span></span></div><div class="controls hidden" id="controls"><div class="direction"><button class="control" data-direction="left" aria-label="왼쪽으로 이동">←</button><button class="control" data-direction="right" aria-label="오른쪽으로 이동">→</button></div><span class="control-note">← → MOVE · SPACE JUMP · E TALK</span><button class="control jump" data-direction="jump" aria-label="점프">JUMP ↑</button></div><div class="overlay" id="overlay"></div></div><section class="worlds" id="instructions" aria-label="모험과 조작 방법">${WORLDS.map((w,i) => `<div class="world-card"><span>${['♧','◇','✦'][i]}</span><div><small>WORLD 0${i+1} · ${['WALK & JUMP','SHARE & DISCOVER','TOGETHER, WE SHINE'][i]}</small><strong>${w.name}</strong><p>${['쓰레기를 모아 지킴이와 분리배출해요.','책·생활·간식 꾸러미를 세 집에 전해요.','세 이웃의 이야기를 듣고 마음을 존중해요.'][i]}</p></div></div>`).join('')}</section></main><footer><span>한국중앙자원봉사센터 · 작은 행동이 모이면 우리 동네가 달라져요!</span><span><a href="./retro.html">레트로 러너 ↗</a> &nbsp; / &nbsp; <a href="./classic.html">차근차근 미션 ↗</a></span></footer></div>`;
const $ = id => document.getElementById(id), canvas = $('game'), ctx = canvas.getContext('2d'), overlay = $('overlay');
const sprite = new Image(); sprite.src = spriteURL;
let width = 0, height = 0;
function resize() {
  const r = canvas.getBoundingClientRect(); width = r.width; height = r.height;
  const dpr = Math.min(2, devicePixelRatio || 1); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
new ResizeObserver(resize).observe(canvas); resize();
function soundUI() { $('sound').textContent = sound ? '♫' : '♪'; $('sound').setAttribute('aria-label', sound ? '사운드 끄기' : '사운드 켜기'); $('sound').setAttribute('aria-pressed', String(sound)); }
function tone(type) {
  if (!sound) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume().catch(() => {});
    const o = audio.createOscillator(), gain = audio.createGain(); o.connect(gain); gain.connect(audio.destination); o.type = 'triangle';
    o.frequency.setValueAtTime(type === 'hurt' ? 180 : type === 'jump' ? 380 : 850, audio.currentTime); o.frequency.exponentialRampToValueAtTime(type === 'hurt' ? 90 : 1150, audio.currentTime + .13);
    gain.gain.setValueAtTime(.045, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .2); o.start(); o.stop(audio.currentTime + .2);
  } catch { /* The game is fully playable without audio. */ }
}
soundUI(); $('sound').onclick = () => { sound = !sound; write('jabongi-sound', sound); soundUI(); tone('collect'); };
function announce(text) { $('announcement').textContent = text; }
function message(text, seconds = 3) { $('message').classList.remove('hidden'); $('message').firstElementChild.textContent = text; messageUntil = game.time + seconds; announce(text); }
function ui(visible) { if(!visible)$('interact').classList.add('hidden'); for (const id of ['hud','progress','controls','quest-panel']) $(id).classList.toggle('hidden', !visible); }
function clearInput() { keys.clear(); touches.clear(); tapDirection = 0; releaseJump(game); app.querySelectorAll('.pressed').forEach(b => b.classList.remove('pressed')); }
function home() {
  clearInput(); mode = 'home'; game = createAdventure(); camera = 0; ui(false); $('message').classList.add('hidden'); overlay.className = 'overlay';
  overlay.innerHTML = `<div class="home-copy"><span class="eyebrow">JABONGI WORLD · STORY ADVENTURE</span><h1>폴짝,<em>한 걸음 더.</em></h1><p>작은 발판을 넘어, 더 따뜻한 동네로.<br><strong>공원 청소, 나눔 배달, 이웃의 부탁까지!</strong></p><button class="primary" id="start">모험 시작하기 <span>→</span></button><div class="home-meta"><span>← → 직접 이동</span><span>↑ 꾹 눌러 점프</span><span>⚑ 세 동네 탐험</span></div></div><div class="speech">동네에서 부탁이 왔어! 같이 가볼까? ♥</div><div class="hero-sticker transparent motion-sticker"><img src="${spriteURL}" alt="정면이 보이는 3D 자봉이"></div><span class="edition">SMALL STEPS / A WARMER WORLD</span>`;
  $('start').onclick = start;
}
function start() { clearInput(); game = createAdventure(); camera = 0; mode = 'playing'; overlay.className = 'overlay hidden'; ui(true); message('공원 지킴이의 부탁! 쓰레기 3개를 모아 전해 주세요.', 5); updateHUD(); canvas.focus({preventScroll:true}); }
function pause() {
  if (mode !== 'playing') return;
  clearInput(); mode = 'paused'; game.phase = 'paused'; overlay.className = 'overlay modal-overlay';
  overlay.innerHTML = `<div class="modal"><span class="eyebrow">A LITTLE BREAK</span><h2>천천히 가도 괜찮아요.</h2><p>쉬는 동안 자봉이와 동네도 기다려요.</p><button class="primary" id="resume">이어서 모험하기 →</button><button class="secondary text-link" id="restart">처음부터 다시 하기</button></div>`;
  $('resume').onclick = () => { clearInput(); mode = 'playing'; game.phase = 'playing'; overlay.className = 'overlay hidden'; canvas.focus({preventScroll:true}); };
  $('restart').onclick = start; $('resume').focus({preventScroll:true});
}
$('pause').onclick = pause;
function worldClear() {
  clearInput(); mode = 'worldClear'; ui(false); $('message').classList.add('hidden'); overlay.className = 'overlay modal-overlay';
  overlay.innerHTML = `<div class="modal"><span class="eyebrow">WORLD 0${game.world+1} COMPLETE</span><h2>${WORLDS[game.world].name}에<br>온기를 더했어요!</h2><p>${BADGES[game.world]} 배지를 받았어요!<br>숨은 별 ${game.level.mission.stars}/3개 · 다음 동네에서 하트 +1</p><div class="world-stars">${"★".repeat(game.level.mission.stars)}${"☆".repeat(3-game.level.mission.stars)}</div><div class="result-score">${game.score}<small>점</small></div><button class="primary" id="next-world">${WORLDS[game.world+1].name}으로 출발 →</button></div>`;
  $('next-world').onclick = () => { advanceWorld(game); camera = 0; mode = 'playing'; overlay.className = 'overlay hidden'; ui(true); updateHUD(); message(`WORLD 0${game.world+1} · ${WORLDS[game.world].tag}`, 4); canvas.focus({preventScroll:true}); };
  $('next-world').focus({preventScroll:true}); announce('깃발에 도착했어요! 다음 동네로 이동할 수 있어요.');
}
function result() {
  clearInput(); mode = 'result'; ui(false); $('message').classList.add('hidden'); const record = game.score > best;
  if (record) { best = game.score; write('jabongi-adventure-best', best); $('best').textContent = best.toLocaleString(); }
  overlay.className = 'overlay modal-overlay';
  overlay.innerHTML = `<div class="modal"><span class="eyebrow">${record?'NEW BEST ADVENTURE ✦':game.phase==='clear'?'OUR NEIGHBORHOOD, TOGETHER':'EVERY LITTLE STEP COUNTS'}</span><h2>${game.phase==='clear'?'세 동네, 모험 성공!':'한 번 더, 폴짝!'}</h2><p>${game.phase==='clear'?'자봉이의 작은 실천이 세 동네를 바꿨어요.':'지금까지 모은 온기도 동네에 남아 있어요.'}</p><div class="result-score">${game.score.toLocaleString()}<small>점</small></div><div class="stats"><div><small>모은 온기</small><b>${game.collected}개</b></div><div><small>먼지 퇴치</small><b>${game.stomps}번</b></div><div><small>도착한 동네</small><b>${game.phase==='clear'?3:game.world} / 3</b></div></div><div class="earned-badges">${game.worldResults.map(r=>`<span>✓ ${r.badge}<small>${"★".repeat(r.stars)}${"☆".repeat(3-r.stars)}</small></span>`).join('')}</div><button class="primary" id="retry">다시 모험하기 ↻</button><div class="secondary-row"><button class="secondary" id="download">↓ 결과 이미지 저장</button><button class="secondary" id="share">↗ 게임 링크 공유</button></div><div id="share-fallback"></div><a class="text-link" href="https://www.1365.go.kr" target="_blank" rel="noopener noreferrer">우리 동네에서 자원봉사 찾아보기 ↗</a><p id="result-status" role="status"></p></div>`;
  $('retry').onclick = start; $('download').onclick = download; $('share').onclick = share; $('retry').focus({preventScroll:true}); announce(`모험 종료. ${game.score}점, 온기 ${game.collected}개.`);
}
function updateHUD() {
  $('score').textContent = String(game.score).padStart(4,'0'); $('hearts').textContent = '♥'.repeat(game.hearts) + '♡'.repeat(3-game.hearts); $('hearts').setAttribute('aria-label',`남은 하트 ${game.hearts}개`);
  $('world-number').textContent = `WORLD 0${game.world+1}`; $('world-name').textContent = WORLDS[game.world].name;
  const progress = Math.min(100,Math.max(0,Math.floor(game.player.x / game.level.spec.goal*100)));
  $('progress-fill').style.width = `${progress}%`; app.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',progress);
  $('checkpoint-label').textContent = game.checkpointActive ? '중간 깃발 저장됨 ⚑' : '목적지 깃발로 →';
  const quest=missionStatus(game);$('quest-title').textContent=quest.title;$('quest-detail').textContent=quest.detail;$('quest-icon').textContent=quest.complete?'✓':['♧','▣','♡'][game.world];$('stars').textContent='★'.repeat(quest.stars)+'☆'.repeat(3-quest.stars);$('stars').setAttribute('aria-label',`숨은 별 ${quest.stars}개`);
  const npc=nearbyNeighbor(game);$('interact').classList.toggle('hidden',!npc||mode!=='playing');if(npc)$('interact').textContent=`E · ${npc.name}`;
  canvas.dataset.facing=game.player.facing;canvas.dataset.spriteFrame=spriteFrame(game.player,ambient);canvas.dataset.world=game.world;canvas.dataset.missionComplete=String(quest.complete);
  canvas.dataset.playerX = Math.round(game.player.x); canvas.dataset.playerY = Math.round(game.player.y); canvas.dataset.grounded = String(game.player.grounded);
}
function jumpDown() { if (mode === 'playing') pressJump(game); }
function directionInput() { const values = [...touches.values()]; return {left:keys.has('ArrowLeft')||keys.has('KeyA')||values.includes('left')||(tapDirection<0&&game.time<tapUntil),right:keys.has('ArrowRight')||keys.has('KeyD')||values.includes('right')||(tapDirection>0&&game.time<tapUntil)}; }
for (const b of app.querySelectorAll('[data-direction]')) {
  b.addEventListener('pointerdown', e => { if (mode !== 'playing') return; e.preventDefault(); touches.set(e.pointerId,b.dataset.direction); b.setPointerCapture(e.pointerId); b.classList.add('pressed'); if(b.dataset.direction==='jump')jumpDown(); });
  const end = e => { const d = touches.get(e.pointerId); touches.delete(e.pointerId); b.classList.remove('pressed'); if(d==='jump')releaseJump(game); };
  b.addEventListener('pointerup',end); b.addEventListener('pointercancel',end); b.addEventListener('lostpointercapture',end);
  b.addEventListener('click', e => { if (e.detail === 0 && mode === 'playing') { if(b.dataset.direction==='jump')jumpDown(); else {tapDirection=b.dataset.direction==='left'?-1:1;tapUntil=game.time+.2;} } });
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
  overlay.innerHTML=`<div class="modal neighbor-dialog"><span class="eyebrow">${npc.name}</span><h2>${game.world===0?'초록 공원을 부탁해요!':game.world===1?'나눔이 도착했어요!':'어떤 마음으로 도울까요?'}</h2><p>${npc.question}</p><div class="dialogue-choices">${npc.choices.map((text,i)=>`<button class="dialogue-choice" data-answer="${i}"><span>0${i+1}</span>${text}</button>`).join('')}</div><p id="dialogue-feedback" role="status"></p><button class="text-link secondary" id="later">잠깐, 주변을 더 살펴볼게요</button></div>`;
  app.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
    const result=answerNeighbor(game,npc.id,Number(b.dataset.answer));
    if(!result.ok){$('dialogue-feedback').textContent=result.text;tone('hurt');return;}
    tone('collect');overlay.innerHTML=`<div class="modal"><span class="eyebrow">작은 실천 성공 · +150</span><h2>${missionStatus(game).complete?BADGES[game.world]+'!':'따뜻한 마음이 전해졌어요.'}</h2><p>${result.text}</p><button class="primary" id="continue-story">계속 모험하기 →</button></div>`;$('continue-story').onclick=closeDialogue;$('continue-story').focus({preventScroll:true});announce(result.text);updateHUD();
  });
  $('later').onclick=closeDialogue;app.querySelector('[data-answer]').focus({preventScroll:true});
}
function closeDialogue(){clearInput();mode='playing';game.phase='playing';overlay.className='overlay hidden';updateHUD();canvas.focus({preventScroll:true});}
$('interact').onclick=interact;
document.addEventListener('keydown', e => {
  if (mode !== 'playing') return;
  if (['ArrowLeft','ArrowRight','KeyA','KeyD','Space','ArrowUp','KeyW','Escape','KeyP','KeyE'].includes(e.code)) {
    if (e.target instanceof HTMLButtonElement && ['Space','Enter'].includes(e.code)) return;
    e.preventDefault(); if(e.repeat)return;
    if(['Escape','KeyP'].includes(e.code)) pause(); else if(e.code==='KeyE')interact(); else {keys.add(e.code);if(['Space','ArrowUp','KeyW'].includes(e.code))jumpDown();}
  }
});
document.addEventListener('keyup',e => { keys.delete(e.code); if(['Space','ArrowUp','KeyW'].includes(e.code))releaseJump(game); });
document.addEventListener('visibilitychange',() => { if(document.hidden)pause(); });
window.addEventListener('blur',pause);
app.querySelector('.brand').onclick = e => {e.preventDefault();if(mode==='playing')pause();else home();};
function frame(now) {
  const dt=last?Math.min(.05,(now-last)/1000):0; last=now; ambient+=dt;
  if(mode==='playing') {
    updateAdventure(game,dt,directionInput());
    for(const e of game.events) {
      if(e.type==='jump')tone('jump'); else if(['collect','gift','stomp'].includes(e.type)){tone('collect');game.particles.push({...e,life:1});if(e.type==='gift')message(e.text,1.5);} else if(e.type==='hurt'){tone('hurt');message(e.text);} else if(e.type==='checkpoint'){tone('collect');message(e.text,3);} else if(['missionItem','spring','objective','shield'].includes(e.type)){if(e.type!=='objective')tone('collect');message(e.text,3);}
    }
    game.particles.forEach(p=>p.life-=dt); game.particles=game.particles.filter(p=>p.life>0);
    const view=adventureViewWidth(width,height),target=Math.max(0,Math.min(game.level.spec.length-view,game.player.x-view*.32)); camera+=(target-camera)*Math.min(1,dt*7);
    if(game.time>messageUntil)$('message').classList.add('hidden'); updateHUD();
    if(game.phase==='worldClear')worldClear();else if(['clear','over'].includes(game.phase))result();
  }
  renderAdventure(ctx,width,height,game,sprite,camera,ambient,mode==='home'); requestAnimationFrame(frame);
}
async function download() {
  try {
    const output=document.createElement('canvas');output.width=1000;output.height=1100;const c=output.getContext('2d');c.fillStyle='#f5f3e4';c.fillRect(0,0,1000,1100);
    const scene=document.createElement('canvas');scene.width=1000;scene.height=550;renderAdventure(scene.getContext('2d'),1000,550,game,sprite,camera,ambient,false);c.drawImage(scene,0,230);
    c.fillStyle='#5b8062';c.textAlign='center';c.font='bold 25px sans-serif';c.fillText('자봉이의 동네 구하기 · 작은 동네의 모험',500,85);c.font='bold 51px sans-serif';c.fillText(game.phase==='clear'?'세 동네, 모험 성공!':'작은 발판을 넘어, 더 따뜻한 동네로.',500,170);
    c.font='bold 80px sans-serif';c.fillText(`${game.score}점`,500,890);c.font='26px sans-serif';c.fillText(`온기 ${game.collected}개 · 먼지 퇴치 ${game.stomps}번`,500,955);c.font='20px sans-serif';c.fillText('작은 행동이 모이면 우리 동네가 달라져요!',500,1040);
    const blob=await new Promise(r=>output.toBlob(r,'image/png'));if(!blob)throw Error();const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='자봉이-동네모험-결과.png';a.textContent='결과 이미지 다운로드';a.className='text-link';$('share-fallback').replaceChildren(a);a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);$('result-status').textContent='모험의 기록을 저장했어요.';
  } catch { $('result-status').textContent='저장이 어려우면 화면 캡처로 모험을 남겨 주세요.'; }
}
async function share() {
  const url=new URL('./',location.href).href,text=`자봉이와 동네 모험 ${game.score}점! 함께 폴짝 뛰어볼까요?`;
  try { if(navigator.share){await navigator.share({title:'자봉이의 동네 구하기',text,url});return;}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);$('result-status').textContent='게임 링크를 복사했어요!';return;} } catch(e) {if(e.name==='AbortError')return;}
  const input=document.createElement('input');input.value=url;input.readOnly=true;input.className='share-field';input.setAttribute('aria-label','공유할 게임 링크');$('share-fallback').replaceChildren(input);input.select();$('result-status').textContent='이 링크를 복사해 함께 모험해요.';
}
home(); requestAnimationFrame(frame);
