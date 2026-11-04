import {WORLDS} from '../../src/platform-engine.js';
import {solidActive} from '../../src/platform-features.js';
// Chooses one frame of real input (direction + jump) from what is visible on screen.
export function autopilot(g){
 const p=g.player,edge=p.x+p.w,spec=WORLDS[g.world],b=g.level.boss;
 if(b&&b.state==='awake'&&b.hp>0){
  const dx=b.x+b.w/2-(p.x+p.w/2);
  if(b.hurt>0)return {dir:0,jump:false};
  return {dir:Math.abs(dx)<8?0:Math.sign(dx),jump:p.grounded&&Math.abs(dx)<120};
 }
 const gap=spec.gaps.some(([a,c])=>edge>=a-20&&p.x<c&&edge<a+15);
 const enemy=g.level.enemies.some(e=>e.alive&&e.kind!=='flyer'&&e.x-edge<68&&e.x-edge>-15);
 const block=g.level.solids.some(s=>!['ground','moving','gate','crumble'].includes(s.type)&&solidActive(g.level,s)&&s.x-edge<85&&s.x-edge>-1&&p.y+p.h-s.y>5&&p.y+p.h-s.y<140);
 return {dir:1,jump:p.grounded&&(gap||enemy||block)};
}
