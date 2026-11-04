import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdventure,updateAdventure,advanceWorld} from '../src/platform-engine.js';
import {collectPower,shootHeart,updateHearts} from '../src/platform-powerups.js';
import {CHALLENGE,BOSSES,solidActive,dustLeft} from '../src/platform-features.js';
const clearItems=g=>g.level.items.forEach(i=>i.taken=true);
const tick=(g,n=1,input={})=>{for(let i=0;i<n;i++)updateAdventure(g,1/120,input);};
const place=(g,x,y=370)=>Object.assign(g.player,{x,y,vx:0,vy:0,grounded:true});
const toWorld=(g,w)=>{while(g.world<w){g.level.mission.npcs.forEach(n=>n.done=true);g.level.boss.hp=0;place(g,g.level.spec.goal);tick(g);advanceWorld(g);}};
const wake=g=>{const b=g.level.boss;place(g,b.x0+40);tick(g);assert.equal(b.state,'awake');g.invincible=0;return b;};

test('통통 먼지는 제자리에서 뛰고 비닐봉지는 공중에서 흔들리며, 밟으면 수거',()=>{
 const g=createAdventure(),hopper=g.level.enemies.find(e=>e.kind==='hopper'),flyer=g.level.enemies.find(e=>e.kind==='flyer');
 place(g,80);let top=hopper.y;const ys=new Set();for(let i=0;i<240;i++){tick(g);top=Math.min(top,hopper.y);ys.add(Math.round(flyer.y));}
 assert.ok(top<hopper.baseY-30,'hopper jumps');assert.ok(ys.size>10,'flyer bobs');
 clearItems(g);const score=g.score;Object.assign(g.player,{x:flyer.x,y:flyer.y-g.player.h-2,vy:200,grounded:false});tick(g,2);
 assert.equal(flyer.alive,false);assert.equal(g.stomps,1);assert.equal(g.score,score+30);
});
test('2.5초 안에 연속 정화하면 콤보 보너스, 시간이 지나거나 다치면 초기화',()=>{
 const g=createAdventure(),[a,b]=g.level.enemies;clearItems(g);
 for(const e of [a,b]){Object.assign(g.player,{x:e.x,y:e.y-g.player.h-2,vy:200,grounded:false});tick(g,2);}
 assert.equal(g.combo,2);assert.equal(g.score,30+40);assert.equal(g.maxCombo,2);
 tick(g,330);assert.equal(g.combo,0);
 g.combo=3;g.comboTimer=2;g.invincible=0;const e=g.level.enemies.find(e=>e.alive&&e.kind==='dust');place(g,e.x);tick(g);assert.equal(g.combo,0);
});
test('보스는 경기장에 들어오면 깨어나고, 밟기·정화 하트로만 체력이 줄며 맞은 직후엔 무적',()=>{
 const g=createAdventure(),b=g.level.boss;place(g,600);tick(g);assert.equal(b.state,'sleep');
 wake(g);const hp=b.hp;
 Object.assign(g.player,{x:b.x+20,y:b.y-g.player.h-2,vy:200,grounded:false});tick(g,2);assert.equal(b.hp,hp-1);assert.ok(g.player.vy<0);
 Object.assign(g.player,{x:b.x+20,y:b.y-g.player.h-2,vy:200,grounded:false});tick(g,2);assert.equal(b.hp,hp-1,'hurt boss is briefly invulnerable');
 tick(g,120);collectPower(g,'bloom');place(g,b.x-140);g.player.facing=1;g.invincible=5;shootHeart(g);for(let i=0;i<60&&b.hp===hp-1;i++)updateHearts(g,1/120);assert.equal(b.hp,hp-2);
});
test('보스에게 옆으로 닿으면 다치고, 정화하면 장벽이 걷혀 깃발로 갈 수 있음',()=>{
 const g=createAdventure(),h=createAdventure(),boss=wake(h);place(h,boss.x+10);h.invincible=0;h.power=0;tick(h);assert.equal(h.hearts,2);
 g.level.mission.npcs.forEach(n=>n.done=true);const gate=g.level.solids.find(s=>s.type==='gate');place(g,gate.x-60);tick(g,120,{right:true});assert.ok(g.player.x+g.player.w<=gate.x+1);assert.equal(g.phase,'playing');
 const boss2=wake(g);boss2.hp=1;boss2.hurt=0;Object.assign(g.player,{x:boss2.x+20,y:boss2.y-g.player.h-2,vy:200,grounded:false});const score=g.score;tick(g,2);
 assert.equal(boss2.hp,0);assert.ok(g.score>=score+300);assert.equal(g.bossesCleared,1);assert.equal(g.level.solids.some(s=>s.type==='gate'),false);
 place(g,g.level.spec.goal);tick(g);assert.equal(g.phase,'worldClear');
});
test('공원 민들레 바람은 자봉이를 위로 띄움',()=>{
 const g=createAdventure(),wind=g.level.winds[0];Object.assign(g.player,{x:wind.x+30,y:380,vx:0,vy:0,grounded:false});tick(g,30);
 assert.ok(g.player.y<360&&g.player.vy<0);
});
test('골목 흔들 상자는 서 있으면 떨어지고 잠시 뒤 제자리로 돌아옴',()=>{
 const g=createAdventure();toWorld(g,1);const box=g.level.solids.find(s=>s.type==='crumble');
 Object.assign(g.player,{x:box.x+2,y:box.y-g.player.h,vx:0,vy:0,grounded:true});tick(g,30);assert.equal(box.state,'shaking');
 tick(g,30);assert.equal(box.state,'falling');assert.equal(solidActive(g.level,box),false);
 tick(g,400);assert.equal(box.state,'idle');assert.equal(box.y,box.baseY);
});
test('별빛 가로등을 켜면 발판이 생기고, 꺼지면 사라지며 점수는 한 번만',()=>{
 const g=createAdventure();toWorld(g,2);const lamp=g.level.lamps[0],step=g.level.solids.find(s=>s.type==='glow'&&s.lamp===0);
 clearItems(g);assert.equal(solidActive(g.level,step),false);const score=g.score;place(g,lamp.x-20);tick(g);
 assert.ok(lamp.lit>9);assert.equal(solidActive(g.level,step),true);assert.equal(g.score,score+20);
 tick(g,10);assert.equal(g.score,score+20);place(g,lamp.x+300);tick(g,1210);assert.equal(solidActive(g.level,step),false);
});
test('도전 모드: 하트 2개, 빠른 먼지, 추가 적, 강한 보스, 충전도 최대 2개',()=>{
 const normal=createAdventure(),hard=createAdventure({challenge:true});
 assert.equal(hard.hearts,CHALLENGE.hearts);assert.equal(hard.maxHearts,2);assert.equal(hard.challenge,true);
 assert.ok(hard.level.enemies.length>normal.level.enemies.length);assert.ok(Math.abs(hard.level.enemies[0].vx)>Math.abs(normal.level.enemies[0].vx));
 assert.equal(hard.level.boss.hp,CHALLENGE.bossHp);assert.ok(hard.level.boss.speed>normal.level.boss.speed);assert.equal(normal.level.boss.hp,BOSSES[0].hp);
 toWorld(hard,1);assert.equal(hard.hearts,2);assert.equal(hard.level.boss.hp,CHALLENGE.bossHp);
});
test('먼지를 정화할수록 동네 먼지 안개가 걷힘',()=>{
 const g=createAdventure();assert.equal(dustLeft(g.level),1);g.level.enemies.forEach(e=>e.alive=false);assert.ok(dustLeft(g.level)>0);g.level.boss.hp=0;assert.equal(dustLeft(g.level),0);
});
test('세 동네를 깨면 점수를 이어 Lv.2로, 레벨마다 먼지·보스·장치가 어려워지고 보상은 커짐',async()=>{
 const {nextLap,PAR_TIMES}=await import('../src/platform-engine.js');const {difficulty}=await import('../src/platform-features.js');
 const one=difficulty(1),two=difficulty(2),five=difficulty(5);
 assert.ok(two.enemySpeed>one.enemySpeed&&five.enemySpeed>two.enemySpeed);assert.ok(five.crumbleShake<two.crumbleShake&&two.crumbleShake<one.crumbleShake);assert.ok(five.lampTime<one.lampTime);assert.ok(five.parScale<one.parScale);assert.equal(five.extra,3);assert.equal(two.reward,2);
 const g=createAdventure();assert.equal(nextLap(g),false);toWorld(g,2);g.level.mission.npcs.forEach(n=>n.done=true);g.level.boss.hp=0;place(g,g.level.spec.goal);tick(g);assert.equal(g.phase,'clear');
 const score=g.score,enemies=createAdventure().level.enemies.length,bossHp=createAdventure().level.boss.maxHp;
 assert.equal(nextLap(g),true);assert.deepEqual([g.lap,g.world,g.phase,g.score],[2,0,'playing',score]);
 assert.equal(g.level.enemies.length,enemies+1);assert.equal(g.level.boss.maxHp,bossHp+1);assert.ok(Math.abs(g.level.enemies[0].vx)>Math.abs(createAdventure().level.enemies[0].vx));
 // Lv.2 pays double for clearing a neighborhood.
 clearItems(g);g.level.mission.npcs.forEach(n=>n.done=true);g.level.boss.hp=0;g.time=g.worldStartTime+PAR_TIMES[0];place(g,g.level.spec.goal);const before=g.score;tick(g);assert.equal(g.score-before,200+g.worldResults.at(-1).timeBonus);assert.equal(g.worldResults.at(-1).lap,2);
});
