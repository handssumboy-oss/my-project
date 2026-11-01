import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdventure, pressJump, releaseJump, updateAdventure, advanceWorld, WORLDS } from '../src/platform-engine.js';
import { nearbyNeighbor, answerNeighbor } from '../src/platform-missions.js';
const step = (g, seconds, input={}) => { for(let i=0;i<Math.ceil(seconds*120);i++) updateAdventure(g,1/120,input); };
test('좌우 이동·점프·착지와 짧은 점프, 공중 재점프 방지',()=>{
 const high=createAdventure();pressJump(high);step(high,.2);const highY=high.player.y;pressJump(high);step(high,.1);assert.ok(high.player.vy<0);step(high,1);assert.ok(high.player.grounded);assert.equal(high.player.y,370);
 const low=createAdventure();pressJump(low);step(low,.07);releaseJump(low);step(low,.13);assert.ok(low.player.y>highY);
 step(low,1,{left:true});assert.equal(low.player.x,0);
});
test('나눔 블록 아래 충돌은 한 번만 보너스를 제공',()=>{
 const g=createAdventure();const gift=g.level.solids.find(s=>s.type==='gift');g.player.x=gift.x+1;pressJump(g);step(g,.12);assert.equal(gift.used,true);assert.equal(g.score,50);step(g,1);pressJump(g);step(g,.3);assert.equal(g.score,50);
});
test('발판에 착지하고 아래로 빠지지 않음',()=>{
 const g=createAdventure();const s=g.level.solids.find(s=>s.type==='brick');Object.assign(g.player,{x:s.x+1,y:s.y-90,vy:150,grounded:false});step(g,.3);assert.equal(g.player.y,s.y-g.player.h);assert.equal(g.player.grounded,true);
});
test('몬스터를 밟으면 제거와 튕김, 측면 충돌은 하트 감소·무적',()=>{
 const g=createAdventure(),e=g.level.enemies[0];Object.assign(g.player,{x:e.x,y:e.y-g.player.h-2,vy:180,grounded:false});step(g,.05);assert.equal(e.alive,false);assert.equal(g.stomps,1);assert.equal(g.hearts,3);
 const h=createAdventure(),enemy=h.level.enemies[0];h.player.x=enemy.x;step(h,.01);assert.equal(h.hearts,2);step(h,.05);assert.equal(h.hearts,2);
});
test('추락은 중간 깃발에서 재시작, 마지막 하트 소진 시 종료',()=>{
 const g=createAdventure();g.player.x=g.level.spec.checkpoint;step(g,.01);assert.equal(g.checkpointActive,true);g.player.y=640;step(g,.01);assert.equal(g.hearts,2);assert.equal(g.player.x,g.checkpoint);assert.ok(g.player.y<400);g.hearts=1;g.player.y=640;step(g,.01);assert.equal(g.phase,'over');
});
test('자동 정지가 진행을 멈추고, 세 동네와 결과를 연결',()=>{
 const g=createAdventure();g.phase='paused';step(g,1,{right:true});assert.equal(g.time,0);g.phase='playing';
 for(let world=0;world<3;world++){g.level.mission.npcs.forEach(n=>n.done=true);g.player.x=g.level.spec.goal;step(g,.03);assert.equal(g.phase,world===2?'clear':'worldClear');if(world<2){assert.equal(advanceWorld(g),true);assert.equal(g.world,world+1);assert.equal(g.player.x,80);}}
 assert.ok(g.score>=300);assert.equal(advanceWorld(g),false);
});
test('세 동네는 실제 이동·점프 물리로 완주 가능',()=>{
 const g=createAdventure();let frames=0;
 while(!['clear','over'].includes(g.phase)&&frames<120*140){
  if(g.phase==='worldClear'){advanceWorld(g);continue;}
  const npc=nearbyNeighbor(g);if(npc)answerNeighbor(g,npc.id,npc.answer);
  const p=g.player,edge=p.x+p.w,spec=WORLDS[g.world];
  const gap=spec.gaps.some(([a,b])=>edge>=a-20&&p.x<b&&edge<a+15);
  const enemy=g.level.enemies.some(e=>e.alive&&e.x-edge<68&&e.x-edge>-15);
  const block=g.level.solids.some(s=>s.type!=='ground'&&s.x-edge<85&&s.x-edge>0&&p.y+p.h-s.y>5&&p.y+p.h-s.y<140);
  if(p.grounded&&(gap||enemy||block))pressJump(g);
  updateAdventure(g,1/120,{right:true});frames++;
 }
 assert.equal(g.phase,'clear',`world ${g.world}, x ${g.player.x}, hearts ${g.hearts}, mission ${JSON.stringify(g.level.mission)}`);
 assert.ok(g.score>300);
});
