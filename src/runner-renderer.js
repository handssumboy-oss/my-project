import {STAGES} from './runner-engine.js';
const polygon=(c,points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const ellipse=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,Math.PI*2);c.fill();};
export function project(w,h,lane,z,time=0){const p=Math.pow(Math.max(0,1-z),2.1);const horizon=h*.37;const half=w*(.025+.43*p);const center=w*.5+Math.sin(time*.15)*w*.035*p;return {x:center+(lane-1)*half*.64,y:horizon+(h*.88-horizon)*p,half,p,center};}
function building(c,x,y,width,height,color,side,depth=16){polygon(c,[[x,y],[x+width,y],[x+width,y-height],[x,y-height]],color);polygon(c,[[x+width,y],[x+width+depth,y-depth*.5],[x+width+depth,y-height-depth*.5],[x+width,y-height]],side);polygon(c,[[x,y-height],[x+depth,y-height-depth*.5],[x+width+depth,y-height-depth*.5],[x+width,y-height]],'#cfada077');c.fillStyle='#ffe6ac';for(let r=0;r<Math.floor(height/25)-1;r++)for(let col=0;col<Math.floor(width/18);col++){c.globalAlpha=.35+((r+col)%3)*.17;c.fillRect(x+7+col*18,y-height+14+r*25,7,11);}c.globalAlpha=1;}
function palm(c,x,y,s,flip=1){c.save();c.translate(x,y);c.scale(s*flip,s);c.lineWidth=8;c.strokeStyle='#344959';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(12,-40,0,-100);c.stroke();for(let i=0;i<6;i++){const a=-Math.PI+i*.55;const ex=Math.cos(a)*55,ey=-105+Math.sin(a)*30;polygon(c,[[0,-100],[ex*.65,ey-17],[ex,ey],[ex*.65,ey-2]],i%2?'#3c7977':'#64a18a');}c.restore();}
function drawItem(c,o,p,time){const size=18+Math.max(0,p.p)*43;const x=p.x,y=p.y;c.save();c.translate(x,y);ellipse(c,0,3,size*.65,size*.17,'#111b3d45');if(o.type==='cone'){polygon(c,[[-size*.72,0],[size*.72,0],[size*.5,-size*.17],[-size*.5,-size*.17]],'#51485a');polygon(c,[[-size*.45,-size*.11],[0,-size*1.35],[size*.44,-size*.11]],'#ffad78');polygon(c,[[0,-size*1.35],[size*.44,-size*.11],[size*.12,-size*.15]],'#df746e');polygon(c,[[-size*.22,-size*.77],[size*.2,-size*.77],[size*.29,-size*.49],[-size*.32,-size*.49]],'#fff2c6');}
else if(o.type==='barrier'){c.fillStyle='#3c455e';c.fillRect(-size*.65,-size*.25,size*.15,size*.35);c.fillRect(size*.5,-size*.25,size*.15,size*.35);polygon(c,[[-size*.8,-size*.95],[size*.8,-size*.95],[size*.8,-size*.24],[-size*.8,-size*.24]],'#f0c27c');polygon(c,[[size*.8,-size*.95],[size*.95,-size*1.05],[size*.95,-size*.35],[size*.8,-size*.24]],'#bc7e6d');c.save();c.beginPath();c.rect(-size*.8,-size*.95,size*1.6,size*.71);c.clip();c.strokeStyle='#916773';c.lineWidth=size*.22;for(let a=-2;a<3;a++){c.beginPath();c.moveTo(a*size*.5,-size);c.lineTo(a*size*.5+size*.6,0);c.stroke();}c.restore();}
else{const float=Math.sin(time*4+o.id)*4;c.translate(0,-size*.65+float);if(o.type==='orb'){ellipse(c,0,0,size*.64,size*.64,'#ffd58b22');ellipse(c,0,0,size*.47,size*.47,'#f5cc81');ellipse(c,-size*.08,-size*.06,size*.35,size*.35,'#ffe8ac');c.fillStyle='#bd8269';c.font=`bold ${size*.46}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('♥',0,size*.02);}
else{const color=o.type==='litter'?'#b5eed7':o.type==='shield'?'#a8dcff':'#e9b2f0';ellipse(c,0,0,size*.62,size*.62,color+'33');ellipse(c,0,0,size*.48,size*.48,color);c.textAlign='center';c.textBaseline='middle';c.font=`${size*.62}px sans-serif`;c.fillStyle='#30435d';c.fillText(o.type==='litter'?'♻':o.type==='shield'?'◇':'U',0,0);}}
c.restore();}
export function drawScene(c,w,h,run,sprite,ambient,playing){
 const time=playing?run.time:ambient,stage=STAGES[playing?run.stage:0];
 const sky=c.createLinearGradient(0,0,0,h*.64);stage.sky.forEach((s,i)=>sky.addColorStop(i/2,s));c.fillStyle=sky;c.fillRect(0,0,w,h);
 // Striped sunset, distant hills, and a little pastel neighborhood.
 const sunX=w*.69,sunY=h*.265,sunR=Math.min(w*.115,h*.19);c.save();c.beginPath();c.arc(sunX,sunY,sunR,0,Math.PI*2);c.clip();c.fillStyle='#ffd0a0';c.fillRect(sunX-sunR,sunY-sunR,sunR*2,sunR*2);for(let i=0;i<6;i++){c.fillStyle=stage.sky[1];c.fillRect(sunX-sunR,sunY+sunR*.05+i*sunR*.18,sunR*2,2+i*1.5);}c.restore();
 polygon(c,[[0,h*.37],[0,h*.3],[w*.12,h*.25],[w*.22,h*.32],[w*.35,h*.27],[w*.49,h*.35],[w*.6,h*.3],[w*.8,h*.34],[w,h*.25],[w,h*.45]],'#57597d');
 for(let i=0;i<22;i++){const bw=w*.035+(i%3)*w*.013,x=(i/21)*w,y=h*.405;building(c,x,y,bw,h*(.045+(i*17%9)*.009),i%2?'#655675':'#755f7d','#494866',6);}
 c.fillStyle=stage.ground;c.fillRect(0,h*.405,w,h*.595);
 const bottom=project(w,h,1,-.35,time),van=project(w,h,1,1,time);
 polygon(c,[[van.center-9,van.y],[van.center+9,van.y],[bottom.center+bottom.half*1.2,h*1.18],[bottom.center-bottom.half*1.2,h*1.18]],stage.road);
 // Perspective paving and mint-lit road edges.
 for(let i=21;i>=0;i--){const z=1-((i/21+time*.075)%1);const a=project(w,h,1,z,time),b=project(w,h,1,z-.022,time);for(const side of [-1,1])polygon(c,[[a.center+side*a.half,a.y],[a.center+side*a.half*1.07,a.y],[b.center+side*b.half*1.07,b.y],[b.center+side*b.half,b.y]],i%2?'#f0c7ac':'#bd8290');}
 for(let i=0;i<18;i++){const z=1-((i/18+time*.075)%1);const a=project(w,h,1,z,time),b=project(w,h,1,z-.025,time);for(const side of [-1,1]){const lane=side*.32;polygon(c,[[a.center+a.half*lane-1,a.y],[a.center+a.half*lane+1,a.y],[b.center+b.half*lane+2,b.y],[b.center+b.half*lane-2,b.y]],'#ede4bd88');}}
 // Houses and palms on the pavement pass by with the road.
 for(let i=11;i>=0;i--){const z=1-((i/12+time*.045)%1),p=project(w,h,1,z,time),s=.12+p.p*1.65;for(const side of [-1,1]){const x=p.center+side*p.half*1.43;if(i%3===0){const bw=45*s,bh=(50+i%4*15)*s;building(c,side===-1?x-bw:x,p.y,bw,bh,i%2?'#c39496':'#85aa9e','#567d83',12*s);if(p.p>.15){c.fillStyle='#fff0b9';c.font=`bold ${Math.max(5,8*s)}px sans-serif`;c.fillText(i%2?'나눔':'문구',x+(side===-1?-bw*.82:bw*.1),p.y-bh*.65);}}else palm(c,x,p.y,s*.65,side);}}
 // Neon lane lighting near the horizon, stars after dark.
 if(playing&&run.stage===2){for(let i=0;i<25;i++){c.fillStyle='#c7e5f7';c.globalAlpha=.25+(i%4)*.15;c.fillRect((i*173%997)/997*w,(i*47%211)/211*h*.25,2,2);}c.globalAlpha=1;}
 if(playing){for(const o of [...run.objects].sort((a,b)=>b.z-a.z)){if(o.z<1.03)drawItem(c,o,project(w,h,o.lane,o.z,time),time);}
 const player=project(w,h,run.visualLane,.02,time);const ph=Math.min(165,h*.235),pw=ph*(sprite.naturalWidth||1122)/(sprite.naturalHeight||1402),y=player.y+15-run.jump*h*.20;const bounce=run.jumpElapsed===null?Math.sin(time*20)*3:0;
 ellipse(c,player.x,player.y+7,pw*.36*(1-run.jump*.3),ph*.065,'#14233b66');
 if(run.shield>0){ellipse(c,player.x,y-ph*.45,pw*.65,ph*.57,'#9fddff22');c.strokeStyle='#a9e8fb99';c.lineWidth=2;c.beginPath();c.ellipse(player.x,y-ph*.45,pw*.65,ph*.57,0,0,Math.PI*2);c.stroke();}
 c.save();if(run.invincible>0&&Math.floor(time*13)%2)c.globalAlpha=.35;c.translate(player.x,y+bounce);c.rotate((run.lane-run.visualLane)*.12);if(sprite.complete&&sprite.naturalWidth)c.drawImage(sprite,-pw/2,-ph,pw,ph);else{ellipse(c,0,-ph*.5,pw*.3,ph*.4,'#f5c9a1');}c.restore();
 for(const p of run.particles){const pt=project(w,h,p.lane,0,time);c.globalAlpha=Math.max(0,p.life);c.fillStyle=p.color;c.font=`bold ${15+(1-p.life)*5}px sans-serif`;c.textAlign='center';c.fillText(p.text,pt.x,player.y-ph-30-(1-p.life)*70);c.globalAlpha=1;}
 }else{for(let i=0;i<8;i++){drawItem(c,{id:i,type:i%3===0?'litter':'orb'},project(w,h,i%3,.14+i*.1,time),time);}}
 // Subtle vignette gives the scene a toy-diorama finish.
 const vignette=c.createRadialGradient(w*.5,h*.4,w*.15,w*.5,h*.5,w*.8);vignette.addColorStop(0,'#07162700');vignette.addColorStop(1,'#07162755');c.fillStyle=vignette;c.fillRect(0,0,w,h);
}
