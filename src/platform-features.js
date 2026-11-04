// Neighborhood gimmicks, new dust types, mini bosses, combos and challenge tuning.
// Everything here is deterministic so automated routes can replay real key timings.
export const CHALLENGE = {hearts:2,enemySpeed:1.35,bossHp:5,bossSpeed:1.3};
export const BOSSES = [
 {name:'큰 먼지 구름',subj:'큰 먼지 구름이',obj:'큰 먼지 구름을',x0:2290,gate:2600,hp:3,speed:70,hopEvery:2.3},
 {name:'뭉친 먼지 덩어리',subj:'뭉친 먼지 덩어리가',obj:'뭉친 먼지 덩어리를',x0:2560,gate:2800,hp:3,speed:80,hopEvery:2},
 {name:'밤안개 먼지왕',subj:'밤안개 먼지왕이',obj:'밤안개 먼지왕을',x0:2640,gate:2900,hp:4,speed:85,hopEvery:1.8},
];
export const GIMMICKS = ['민들레 바람','흔들 상자 다리','가로등 별빛 발판'];
const ENEMIES = [
 [{x:570},{x:1170},{x:2010},{x:1300,kind:'hopper'},{x:2235,kind:'flyer',y:150}],
 [{x:590},{x:1340},{x:2180},{x:1480,kind:'hopper'},{x:2000,kind:'flyer',y:255}],
 [{x:590},{x:1340},{x:2210},{x:1110,kind:'hopper'},{x:1610,kind:'flyer',y:170}],
];
// Extra dust that joins as the difficulty rises (challenge mode starts with the first one).
const EXTRA_ENEMIES = [
 [{x:1880,kind:'hopper'},{x:1230,kind:'flyer',y:200},{x:2150,kind:'hopper'}],
 [{x:2240,kind:'hopper'},{x:1150,kind:'flyer',y:230},{x:1060,kind:'hopper'}],
 [{x:2020,kind:'hopper'},{x:900,kind:'flyer',y:220},{x:2330,kind:'hopper'}],
];
// Lv.1 is the first loop through the three neighborhoods; every further loop gets harder and pays more.
export function difficulty(lap=1,challenge=false) {
 const d=Math.max(0,Math.min(20,lap-1));
 return {lap:d+1,d,enemySpeed:(challenge?CHALLENGE.enemySpeed:1)*(1+.15*d),extra:Math.min(3,d+(challenge?1:0)),bossHpBonus:d,bossSpeed:(challenge?CHALLENGE.bossSpeed:1)*(1+.1*d),hopScale:Math.max(.5,1-.08*d),crumbleShake:Math.max(.16,.32-.04*d),lampTime:Math.max(5,10-1.25*d),parScale:Math.max(.6,1-.1*d),reward:d+1};
}
const LEDGES = [[[1430,1580]],[[1620,1755]],[[1700,1820]]];

export function buildEnemies(world,challenge=false,lap=1) {
 const level=difficulty(lap,challenge),list=[...ENEMIES[world],...EXTRA_ENEMIES[world].slice(0,level.extra)],speed=level.enemySpeed;
 return list.map(({x,kind='dust',y},i)=>{
  const flyer=kind==='flyer',w=flyer?36:34,h=flyer?30:30,baseY=flyer?y:400;
  return {kind,x,y:baseY,baseY,w,h,origin:x,min:x-(flyer?70:48),max:x+(flyer?70:62),vx:(i%2?1:-1)*(35+world*8)*(flyer?1.3:1)*speed,vy:0,hop:1+i*.3,grounded:true,alive:true};
 });
}

export function addFeatures(level,world,challenge=false,lap=1) {
 const {solids,items}=level,tune=difficulty(lap,challenge);let id=2000;
 level.tune=tune;
 for(const [a,b] of LEDGES[world])solids.push({x:a,y:386,w:b-a,h:44,type:'ledge'});
 // Items that would sit inside raised ground are lifted onto its surface.
 for(const item of items)for(const s of solids)if(s.type==='ledge'&&item.x>s.x-item.r&&item.x<s.x+s.w+item.r&&item.y>s.y-item.r)item.y=s.y-item.r-14;
 level.winds=[];level.lamps=[];
 if(world===0){
  level.winds.push({x:1650,w:115,top:150},{x:940,w:70,top:120});
  for(const [x,y] of [[1680,240],[1705,205],[1730,240]])items.push({id:id++,x,y,r:12,type:'heart',taken:false});
  for(const y of [170,215,260])items.push({id:id++,x:975,y,r:12,type:'leaf',taken:false});
 }
 if(world===1)for(const [a,b] of [[1790,1930],[2400,2530]]){const n=3,w=(b-a)/n;for(let i=0;i<n;i++)solids.push({x:a+i*w,y:430,w,h:22,type:'crumble',baseY:430,state:'idle',timer:0,vy:0});}
 if(world===2){
  level.lamps.push({x:1430,lit:0,used:false},{x:2380,lit:0,used:false});
  for(const [x,y,w] of [[1480,355,74],[1575,295,74],[1670,235,74]])solids.push({x,y,w,h:16,type:'glow',lamp:0});
  solids.push({x:2470,y:412,w:140,h:16,type:'glow',lamp:1});
  for(const [x,y] of [[1517,322],[1612,262],[1707,202],[1740,202]])items.push({id:id++,x,y,r:12,type:'heart',taken:false});
  items.push({id:id++,x:1772,y:170,r:12,type:'leaf',taken:false});
 }
 const spec=BOSSES[world],hp=(challenge?CHALLENGE.bossHp:spec.hp)+tune.bossHpBonus,w=84,h=68,hopEvery=spec.hopEvery*tune.hopScale;
 level.boss={name:spec.name,subj:spec.subj,obj:spec.obj,x:spec.gate-w-24,y:430-h,w,h,vx:0,vy:0,hp,maxHp:hp,hurt:0,hop:hopEvery,hopEvery,speed:spec.speed*tune.bossSpeed,grounded:true,state:'sleep',x0:spec.x0,gate:spec.gate};
 solids.push({x:spec.gate,y:-400,w:34,h:830,type:'gate'});
}

export const bossCleared = level => !level.boss || level.boss.hp<=0;
export const solidActive = (level,s) => !(s.type==='crumble'&&s.state==='falling')&&!(s.type==='glow'&&!(level.lamps[s.lamp]?.lit>0));

export function addCombo(game,base,x,y,label) {
 game.combo=game.comboTimer>0?game.combo+1:1;game.comboTimer=2.5;game.maxCombo=Math.max(game.maxCombo,game.combo);
 const bonus=game.combo>1?Math.min(50,10*(game.combo-1)):0;game.score+=base+bonus;
 return {x,y,text:bonus?`${label} +${base} · 콤보 x${game.combo} +${bonus}`:`${label} +${base}`,combo:game.combo};
}

export function moveEnemy(e,dt,time) {
 e.x+=e.vx*dt;if(e.x<e.min){e.x=e.min;e.vx=Math.abs(e.vx);}if(e.x>e.max){e.x=e.max;e.vx=-Math.abs(e.vx);}
 if(e.kind==='hopper'){e.hop-=dt;if(e.grounded&&e.hop<=0){e.vy=-430;e.hop=1.5;e.grounded=false;}e.vy+=1850*dt;e.y+=e.vy*dt;if(e.y>=e.baseY){e.y=e.baseY;e.vy=0;e.grounded=true;}}
 if(e.kind==='flyer')e.y=e.baseY+Math.sin(time*2.2+e.origin)*18;
}

export function updateGimmicks(game,dt) {
 const p=game.player,l=game.level;
 for(const wind of l.winds)if(p.x+p.w>wind.x&&p.x<wind.x+wind.w&&p.y+p.h>wind.top&&p.y<640){p.vy=Math.max(-420,p.vy-3000*dt);if(!p.inWind)game.events.push({type:'wind',text:'민들레 바람을 타고 두둥실!'});p.inWind=wind;}else if(p.inWind===wind)p.inWind=null;
 for(const s of l.solids){
  if(s.type!=='crumble')continue;
  if(s.state==='idle'&&p.support===s){s.state='shaking';s.timer=l.tune?.crumbleShake??.32;}
  else if(s.state==='shaking'){s.timer-=dt;if(s.timer<=0){s.state='falling';s.timer=3;s.vy=0;}}
  else if(s.state==='falling'){s.vy+=1400*dt;s.y+=s.vy*dt;s.timer-=dt;if(s.timer<=0){s.state='idle';s.y=s.baseY;s.vy=0;}}
 }
 for(const lamp of l.lamps){
  lamp.lit=Math.max(0,lamp.lit-dt);
  if(p.x+p.w>lamp.x-16&&p.x<lamp.x+16&&p.y+p.h>300){if(lamp.lit<(l.tune?.lampTime??10)-1)game.events.push({type:'lamp',x:lamp.x,y:300,text:lamp.used?'가로등을 다시 켰어요!':'가로등 점등! 별빛 발판이 나타나요 +20'});if(!lamp.used){lamp.used=true;game.score+=20;}lamp.lit=l.tune?.lampTime??10;}
 }
}

function damageBoss(game,source) {
 const b=game.level.boss;b.hp--;b.hurt=.9;b.vy=-300;b.grounded=false;
 const done=b.hp<=0,reward=game.level.tune?.reward??1,event=addCombo(game,(done?300:50)*reward,b.x+b.w/2,b.y,done?`${b.name} 정화!`:source==='heart'?'정화 하트 명중!':'꾹 밟기!');
 game.events.push({type:done?'bossDown':'bossHit',...event});
 if(done){game.bossesCleared++;game.level.solids=game.level.solids.filter(s=>s.type!=='gate');game.events.push({type:'gate',text:'먼지 장벽이 걷혔어요! 깃발로 가요.'});}
}

export function shotHitsBoss(game,shot) {
 const b=game.level.boss;
 if(!b||b.state!=='awake'||b.hp<=0||b.hurt>0)return false;
 if(shot.x+shot.r>b.x&&shot.x-shot.r<b.x+b.w&&shot.y+shot.r>b.y&&shot.y-shot.r<b.y+b.h){damageBoss(game,'heart');return true;}
 return false;
}

// Returns true when the player was hurt so the caller can stop this physics step.
export function updateBoss(game,dt,oldBottom,hit) {
 const b=game.level.boss,p=game.player;if(!b||b.hp<=0)return false;
 if(b.state==='sleep'){if(p.x+p.w>b.x0+30){b.state='awake';b.hop=1.2;game.events.push({type:'bossWake',text:`${b.subj} 깨어났어요! 밟거나 정화 하트로 ${b.hp}번 맞혀요.`});}return false;}
 b.hurt=Math.max(0,b.hurt-dt);b.hop-=dt;
 const dir=Math.sign(p.x+p.w/2-(b.x+b.w/2))||1;
 b.vx=b.hurt>0?-dir*150:dir*b.speed;
 if(b.grounded&&b.hop<=0&&b.hurt===0){b.vy=-480;b.hop=b.hopEvery;b.grounded=false;}
 b.vy+=1850*dt;b.x=Math.max(b.x0,Math.min(b.gate-b.w,b.x+b.vx*dt));b.y+=b.vy*dt;
 if(b.y>=430-b.h){b.y=430-b.h;b.vy=0;b.grounded=true;}
 if(b.hurt>0||!(p.x<b.x+b.w&&p.x+p.w>b.x&&p.y<b.y+b.h&&p.y+p.h>b.y))return false;
 if(p.vy>60&&oldBottom<=b.y+18){damageBoss(game,'stomp');p.vy=-560;p.grounded=false;return false;}
 hit(game);return true;
}

// 1 while every dust is left, 0 once the whole neighborhood is purified.
export function dustLeft(level) {
 const total=level.enemies.length+(level.boss?1:0),left=level.enemies.filter(e=>e.alive).length+(level.boss&&level.boss.hp>0?1:0);
 return total?left/total:0;
}
