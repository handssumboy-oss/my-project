import {createAdventure,updateAdventure,pressJump,releaseJump,advanceWorld,WORLDS} from '../../src/platform-engine.js';
import {nearbyNeighbor,answerNeighbor} from '../../src/platform-missions.js';
// Produce real key timings from the deterministic physics. No browser game state is injected.
export function storyRoute(){
 const g=createAdventure(),route=[];
 for(let world=0;world<3;world++){
  const actions=[],start=g.time;let frames=0;
  while(g.phase==='playing'&&frames++<10000){
   const npc=nearbyNeighbor(g);
   if(npc){const r=answerNeighbor(g,npc.id,npc.answer);if(r.ok){releaseJump(g);actions.push({at:Math.round((g.time-start)*1000),type:'talk',id:npc.id,answer:npc.answer});}}
   const p=g.player,edge=p.x+p.w,spec=WORLDS[world];
   const gap=spec.gaps.some(([a,b])=>edge>=a-20&&p.x<b&&edge<a+15);
   const enemy=g.level.enemies.some(e=>e.alive&&e.x-edge<68&&e.x-edge>-15);
   const block=g.level.solids.some(s=>!['ground','moving'].includes(s.type)&&s.x-edge<85&&s.x-edge>0&&p.y+p.h-s.y>5&&p.y+p.h-s.y<140);
   if(p.grounded&&(gap||enemy||block)){releaseJump(g);pressJump(g);actions.push({at:Math.round((g.time-start)*1000),type:'jump'});}
   updateAdventure(g,1/120,{right:true});
  }
  if(!['worldClear','clear'].includes(g.phase))throw Error(`Route failed: world ${world} phase ${g.phase} x ${g.player.x}`);
  route.push({world,actions,duration:Math.round((g.time-start)*1000)});
  if(world<2)advanceWorld(g);
 }
 return route;
}
