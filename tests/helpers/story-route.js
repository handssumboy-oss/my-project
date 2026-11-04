import {createAdventure,updateAdventure,pressJump,releaseJump,advanceWorld} from '../../src/platform-engine.js';
import {nearbyNeighbor,answerNeighbor} from '../../src/platform-missions.js';
import {autopilot} from './autopilot.js';
// Produce real key timings from the deterministic physics. No browser game state is injected.
// FRAME matches the 16ms animation frames of Playwright's fake clock, so replays follow the same physics.
const FRAME=.016;
export function storyRoute(){
 const g=createAdventure(),route=[];
 for(let world=0;world<3;world++){
  const actions=[],start=g.time;let frames=0,dir=1;
  const at=()=>Math.round((g.time-start)*1000);
  while(g.phase==='playing'&&frames++<8000){
   const npc=nearbyNeighbor(g);
   if(npc){const r=answerNeighbor(g,npc.id,npc.answer);if(r.ok){releaseJump(g);actions.push({at:at(),type:'talk',id:npc.id,answer:npc.answer,dir});}}
   const d=autopilot(g);
   if(d.dir!==dir){dir=d.dir;actions.push({at:at(),type:'move',dir});}
   if(d.jump){releaseJump(g);pressJump(g);actions.push({at:at(),type:'jump'});}
   updateAdventure(g,FRAME,{left:dir<0,right:dir>0});
  }
  if(!['worldClear','clear'].includes(g.phase))throw Error(`Route failed: world ${world} phase ${g.phase} x ${g.player.x}`);
  route.push({world,actions,duration:Math.round((g.time-start)*1000)});
  if(world<2)advanceWorld(g);
 }
 return route;
}
