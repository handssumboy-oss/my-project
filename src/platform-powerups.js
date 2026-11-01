export const POWER_FORMS = [
 {name:'기본 자봉이',icon:'♡',tip:'성장 하트를 찾아보세요',color:'#8eac81'},
 {name:'든든 자봉이',icon:'♥',tip:'커진 몸집 · 충돌 한 번 보호',color:'#73a77e'},
 {name:'꽃빛 자봉이',icon:'✿',tip:'X / F 또는 ♡ 버튼으로 먼지 정화',color:'#d396a5'},
];
export function collectPower(game,type) {
 const target=type==='bloom'?2:1,old=game.power;
 game.power=Math.max(old,target);game.maxPower=Math.max(game.maxPower,game.power);game.powerFlash=1;
 if(game.power===old)game.score+=30;
 game.events.push({type:'powerup',text:game.power===old?'힘은 그대로! 추가 보너스 +30':game.power===2?'꽃빛 자봉이! ♡ 정화 하트를 발사해 보세요.':'든든 자봉이! 커진 몸집이 충돌 한 번을 막아요.'});
}
export function shootHeart(game) {
 if(game.phase!=='playing'||game.power!==2||game.shotCooldown>0||game.shots.length>=3)return false;
 const p=game.player;game.shots.push({x:p.x+p.w/2+p.facing*28,y:p.y+p.h*.48,baseY:p.y+p.h*.48,vx:p.facing*460,age:0,r:9});game.shotCooldown=.38;return true;
}
const touches=(a,b)=>a.x+a.r>b.x&&a.x-a.r<b.x+b.w&&a.y+a.r>b.y&&a.y-a.r<b.y+b.h;
export function updateHearts(game,dt) {
 game.shotCooldown=Math.max(0,game.shotCooldown-dt);game.powerFlash=Math.max(0,game.powerFlash-dt);
 for(const shot of game.shots){
  shot.age+=dt;shot.x+=shot.vx*dt;shot.y=shot.baseY+Math.sin(shot.age*8)*6;
  if(shot.age>1.3||shot.x<0||shot.x>game.level.spec.length){shot.dead=true;continue;}
  if(game.level.solids.some(s=>touches(shot,s))){shot.dead=true;continue;}
  const enemy=game.level.enemies.find(e=>e.alive&&touches(shot,e));
  if(enemy){enemy.alive=false;enemy.purified=true;shot.dead=true;game.purified++;game.score+=30;game.events.push({type:'purify',x:enemy.x+17,y:enemy.y,text:'먼지 정화 +30'});}
 }
 game.shots=game.shots.filter(s=>!s.dead);
}
