import { missionStatus } from './platform-missions.js';
const poly=(c,pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function round(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function cloud(c,x,y,s){ellipse(c,x,y,47*s,12*s,'#fff9e8bb');ellipse(c,x-13*s,y-10*s,22*s,18*s,'#fff9e8dd');ellipse(c,x+14*s,y-5*s,21*s,15*s,'#fff9e8dd');}
function tree(c,x,y,s,night){round(c,x-6*s,y-70*s,12*s,70*s,4*s,'#927e65');ellipse(c,x,y-78*s,35*s,42*s,night?'#688b98':'#89b991');ellipse(c,x-13*s,y-94*s,23*s,29*s,night?'#87a4ac':'#acd1a0');ellipse(c,x+16*s,y-65*s,21*s,22*s,night?'#7099a0':'#95c195');}
function house(c,x,y,w,h,color){round(c,x,y-h,w,h,5,color);poly(c,[[x+w,y-h],[x+w+16,y-h-9],[x+w+16,y-7],[x+w,y]],'#b0a198');poly(c,[[x-9,y-h],[x+w*.5,y-h-43],[x+w+12,y-h]],'#c38f83');round(c,x+w*.18,y-h*.66,w*.2,h*.25,3,'#b6d4ce');round(c,x+w*.62,y-h*.66,w*.2,h*.25,3,'#b6d4ce');round(c,x+w*.4,y-h*.3,w*.2,h*.3,3,'#a58d77');}
function coin(c,item,t){const bob=Math.sin(t*3+item.id)*3;const x=item.x,y=item.y+bob;ellipse(c,x,y+18,9,3,'#6c74651c');ellipse(c,x,y,12,14,item.type==='leaf'?'#6b9b7e':'#d6a565');ellipse(c,x-2,y-2,10,12,item.type==='leaf'?'#b9e3b2':'#ffe3a0');c.fillStyle=item.type==='leaf'?'#4f8265':'#c08b5f';c.textAlign='center';c.textBaseline='middle';c.font='bold 13px sans-serif';c.fillText(item.type==='leaf'?'♧':'♥',x-1,y-1);}
function block(c,s,t){if(s.type==='moving'){round(c,s.x,s.y,s.w,s.h,5,'#7fae9c');round(c,s.x,s.y,s.w,5,3,'#b8d8ad');return;}const gift=s.type==='gift'&&!s.used;round(c,s.x+2,s.y+5,s.w,s.h,5,gift?'#bc9765':'#b78d79');round(c,s.x,s.y,s.w,s.h-3,5,gift?'#f1c976':s.used?'#baa49a':'#dfbba1');c.fillStyle='#fff1cb88';c.fillRect(s.x+5,s.y+4,s.w-10,3);if(gift){c.save();c.translate(s.x+s.w/2,s.y+16);c.rotate(Math.PI/4);round(c,-7,-7,14,14,3,'#fff2c8');c.restore();}else if(!s.used){c.strokeStyle='#c49c83';c.lineWidth=1;c.beginPath();c.moveTo(s.x,s.y+17);c.lineTo(s.x+s.w,s.y+17);c.moveTo(s.x+20,s.y+18);c.lineTo(s.x+20,s.y+s.h);c.stroke();}}
function dust(c,e,t){const x=e.x+e.w/2,y=e.y+e.h;ellipse(c,x,y+1,19,5,'#605a6a22');const bob=Math.sin(t*9+e.origin)*1.5;ellipse(c,x,y-13+bob,19,15,'#9b91aa');ellipse(c,x-8,y-21+bob,9,8,'#b4abc1');ellipse(c,x+6,y-23+bob,11,8,'#b4abc1');round(c,x-9,y-17+bob,4,6,2,'#514b65');round(c,x+4,y-17+bob,4,6,2,'#514b65');ellipse(c,x-8,y+1,6,3,'#736a85');ellipse(c,x+9,y+1,6,3,'#736a85');}
function flag(c,x,y,active,goal=false,t=0){round(c,x,y-(goal?146:95),6,goal?146:95,3,'#ac927a');ellipse(c,x+3,y+3,17,5,'#65745f22');const top=y-(goal?144:93);poly(c,[[x+6,top],[x+(goal?70:42),top+4+Math.sin(t*3)*2],[x+(goal?62:37),top+35],[x+6,top+30]],active?'#73aa87':'#b6c6b2');c.fillStyle='#fff4d6';c.textAlign='center';c.font=goal?'bold 16px sans-serif':'bold 12px sans-serif';c.fillText(goal?'♥':'✦',x+(goal?34:22),top+21);}

export function spriteFrame(player,time) {
 if(!player.grounded)return 3;
 return Math.abs(player.vx)>15?1+Math.floor(time*9)%2:0;
}
function missionItem(c,item,t) {
 const x=item.x,y=item.y+Math.sin(t*3+item.id)*2;
 ellipse(c,x,y+20,13,4,'#61735922');
 if(item.type==='star') {
  c.save();c.translate(x,y);c.rotate(Math.sin(t*2)*.1);const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?8:18;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}poly(c,pts,'#f0bd58');ellipse(c,-4,-4,3,4,'#fff3ae');c.restore();
 }else if(item.type==='shield') {ellipse(c,x,y,19,20,'#a9dcdf66');poly(c,[[x-11,y-10],[x+11,y-10],[x+9,y+7],[x,y+15],[x-9,y+7]],'#8bc2ce');c.strokeStyle='#eaffee';c.lineWidth=2;c.beginPath();c.moveTo(x-5,y);c.lineTo(x-1,y+5);c.lineTo(x+6,y-5);c.stroke();}
 else if(item.type==='parcel') {const color={study:'#93b9d2',life:'#97c2a3',food:'#daa38d'}[item.kind];round(c,x-18,y-15,36,31,5,color);c.fillStyle='#fff1c4';c.fillRect(x-3,y-15,6,31);c.fillRect(x-18,y-3,36,5);c.textAlign='center';c.fillStyle='#567968';c.font='bold 10px sans-serif';c.fillText({study:'책',life:'생활',food:'간식'}[item.kind],x,y-25);}
 else {if(item.id%2){c.save();c.translate(x,y);c.rotate(-.2);round(c,-11,-15,22,29,3,'#eee2bf');c.strokeStyle='#b4b59e';c.lineWidth=2;for(let y=-8;y<9;y+=7){c.beginPath();c.moveTo(-6,y);c.lineTo(6,y);c.stroke();}c.restore();}else{round(c,x-8,y-12,16,27,5,'#92bfd0');round(c,x-5,y-20,10,10,2,'#6a99a7');round(c,x-7,y-3,14,9,2,'#d6ebd6');}}
}
function neighbor(c,npc,world,t) {
 const x=npc.x,y=430;
 if(world===0) {for(let i=0;i<3;i++){round(c,x-77+i*22,y-35,19,35,3,['#91b5a0','#b2b19a','#a7b7c4'][i]);round(c,x-79+i*22,y-38,23,5,2,'#6f9484');}if(npc.done){for(let i=0;i<4;i++){ellipse(c,x-90+i*20,y-48,5,5,'#efc776');}}}
 if(world===1) {round(c,x-39,y-103,78,103,6,npc.done?'#e9d7a0':'#c9c6ad');poly(c,[[x-46,y-101],[x,y-139],[x+46,y-101]],'#bc8d84');round(c,x-22,y-79,43,28,4,npc.done?'#ffe7a1':'#a8c2b9');round(c,x-12,y-38,24,38,3,'#af9480');c.fillStyle='#638771';c.font='bold 10px sans-serif';c.textAlign='center';c.fillText({study:'책 나눔',life:'생활 나눔',food:'간식 나눔'}[npc.kind],x,y-86);}
 else {ellipse(c,x,y+2,17,4,'#566e6022');round(c,x-10,y-34,20,30,7,world===0?'#80ab91':npc.id==='respect'?'#c59bab':'#a9b7ce');round(c,x-9,y-8,7,8,2,'#7c8382');round(c,x+2,y-8,7,8,2,'#7c8382');ellipse(c,x,y-46,13,14,'#f0cbac');round(c,x-12,y-60,24,8,4,'#9d9d84');ellipse(c,x-4,y-47,1.5,2,'#5d655d');ellipse(c,x+4,y-47,1.5,2,'#5d655d');if(npc.id==='ask')round(c,x+12,y-28,13,20,3,'#d2b280');}
 if(world===2) {round(c,x+42,y-121,4,121,2,'#8f9e9b');if(npc.done){const g=c.createRadialGradient(x+44,y-121,2,x+44,y-121,50);g.addColorStop(0,'#fff1b7aa');g.addColorStop(1,'#fff1b700');c.fillStyle=g;c.fillRect(x-6,y-171,100,100);}round(c,x+35,y-132,18,23,4,npc.done?'#ffe5a1':'#8e9eac');}
 const by=y-(world===1?158:90);round(c,x-17,by,34,25,8,npc.done?'#b1d9a1':'#fff4cf');c.fillStyle='#67816a';c.textAlign='center';c.font='bold 12px sans-serif';c.fillText(npc.done?'♥':'E',x,by+17);
}

export const adventureViewWidth = (width,height) => Math.max(width < 600 ? 520 : 640, width / height * 540);
export function renderAdventure(c,width,height,game,sprite,camera,ambient,home=false){
 const vw=adventureViewWidth(width,height),scale=width/vw,vh=height/scale;const spec=game.level.spec;const offset=width<600?vh*.65-430:vh-540;const cam=home?120:camera;
 c.save();c.scale(scale,scale);const sky=c.createLinearGradient(0,0,0,vh);sky.addColorStop(0,spec.sky[0]);sky.addColorStop(1,spec.sky[1]);c.fillStyle=sky;c.fillRect(0,0,vw,vh);
 // Multiple parallax layers keep the neighborhood moving around the player.
 const sunX=vw*.78-cam*.025,sunY=offset+105;const halo=c.createRadialGradient(sunX,sunY,5,sunX,sunY,130);halo.addColorStop(0,'#fff5cbaa');halo.addColorStop(1,'#fff5cb00');c.fillStyle=halo;c.fillRect(sunX-130,sunY-130,260,260);ellipse(c,sunX,sunY,48,48,'#ffedb9');
 for(let i=-1;i<6;i++)cloud(c,i*230-(cam*.12%230)+ambient*2%(230)+65,offset+90+(i%3)*36,.65+(i%2)*.25);
 for(let i=-1;i<8;i++){const x=i*280-(cam*.18%280);ellipse(c,x+100,offset+410,220,133,spec.name.includes('별빛')?'#9ea6b5':'#bfceb2');ellipse(c,x+220,offset+440,190,108,spec.name.includes('별빛')?'#8d9fae':'#a5c2a2');}
 c.save();c.translate(0,offset);for(let i=-1;i<8;i++){const x=i*350-(cam*.35%350);house(c,x+90,418,80,88,game.world===1?'#ead5bb':'#e9dfc3');tree(c,x+240,420,.85,game.world===2);tree(c,x+295,420,.6,game.world===2);}
 if(game.world===2){for(let i=0;i<22;i++){c.fillStyle='#fff4c9';c.fillRect((i*139)%Math.ceil(vw),35+(i*41)%180,2,2);}}
 c.translate(-cam,0);
 for(const s of game.level.solids){if(s.x+s.w<cam-40||s.x>cam+vw+40)continue;if(s.type==='ground'){
  round(c,s.x,s.y+7,s.w,Math.max(s.h,vh),5,spec.soil);round(c,s.x,s.y,s.w,17,5,spec.grass);c.fillStyle='#ffffff26';c.fillRect(s.x+3,s.y+3,s.w-6,4);
  c.strokeStyle='#93765e21';c.lineWidth=1;for(let x=s.x;x<s.x+s.w;x+=42){c.beginPath();c.moveTo(x,s.y+19);c.lineTo(x,s.y+vh);c.stroke();}for(let y=s.y+51;y<s.y+vh;y+=34){c.beginPath();c.moveTo(s.x,y);c.lineTo(s.x+s.w,y);c.stroke();}
  for(let x=s.x+25;x<s.x+s.w-15;x+=105){const y=s.y-4;c.strokeStyle='#759e71';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-11);c.stroke();ellipse(c,x-3,y-12,3,4,'#fff2c5');ellipse(c,x+3,y-12,3,4,'#fff2c5');ellipse(c,x,y-15,3,4,'#e7ba81');}
 }else block(c,s,ambient);}
 for(const item of game.level.items)if(!item.taken&&item.x>cam-35&&item.x<cam+vw+35){if(['heart','leaf'].includes(item.type))coin(c,item,ambient);else missionItem(c,item,ambient);}
 for(const spring of game.level.springs){c.strokeStyle='#9a89a8';c.lineWidth=4;const h=spring.cooldown>0?9:18;const pts=[[spring.x+5,430],[spring.x+35,430-h*.3],[spring.x+5,430-h*.65],[spring.x+35,430-h]];c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();round(c,spring.x,430-h-5,42,7,3,'#b7a4c5');}
 for(const npc of game.level.mission.npcs)if(npc.x>cam-110&&npc.x<cam+vw+110)neighbor(c,npc,game.world,ambient);
 for(const e of game.level.enemies)if(e.alive&&e.x>cam-50&&e.x<cam+vw+50)dust(c,e,ambient);
 flag(c,game.level.spec.checkpoint,430,game.checkpointActive,false,ambient);flag(c,game.level.spec.goal+40,430,missionStatus(game).complete,true,ambient);
 // A neighborhood goal rather than a borrowed game landmark.
 const gx=game.level.spec.goal+85;round(c,gx-10,383,125,47,5,'#e9d4a8');c.fillStyle='#779176';c.textAlign='center';c.font='bold 12px sans-serif';c.fillText('우리 동네 도착!',gx+52,411);
 if(!home){const p=game.player,x=p.x+p.w/2,y=p.y+p.h;const walk=p.grounded&&Math.abs(p.vx)>10?Math.sin(ambient*18)*2:0;ellipse(c,x,430+2,24*(p.grounded?1:.7),5,'#445f6b22');c.save();if(game.invincible>0&&Math.floor(ambient*12)%2)c.globalAlpha=.4;c.translate(x,y+3+walk);if(game.level.mission.shield>0){ellipse(c,0,-44,34,49,'#b8e3e644');c.strokeStyle='#9cd2db';c.lineWidth=2;c.beginPath();c.ellipse(0,-44,34,49,0,0,Math.PI*2);c.stroke();}
 c.scale(p.facing,1);const ph=108,cw=(sprite.naturalWidth||1024)/2,ch=(sprite.naturalHeight||1536)/2,pw=ph*cw/ch,frame=spriteFrame(p,ambient);if(sprite.complete&&sprite.naturalWidth)c.drawImage(sprite,(frame%2)*cw,Math.floor(frame/2)*ch,cw,ch,-pw/2,-ph,pw,ph);else round(c,-20,-60,40,60,16,'#e3a5a6');c.restore();}
 for(const part of game.particles){c.globalAlpha=Math.max(0,part.life);c.fillStyle=part.type==='hurt'?'#ad6f79':'#638970';c.textAlign='center';c.font='bold 14px sans-serif';c.fillText(part.text,part.x,part.y-(1-part.life)*45);c.globalAlpha=1;}
 c.restore();c.restore();
}
