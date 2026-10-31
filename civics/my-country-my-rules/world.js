'use strict';
(() => {
const S=CountrySociety;
const shapes=[[[105,130],[290,85],[465,180],[430,355],[260,365],[85,290]],[[475,180],[660,80],[850,160],[875,335],[665,390],[445,350]],[[260,385],[435,375],[650,410],[735,550],[505,600],[255,555],[180,465]]];
const anchors=[[270,155],[670,155],[450,485]],people=[[200,285],[710,295],[480,535]];
const colors=['#b8dcaa','#f5d998','#d1c6ed'];
function through(){return view==='crisis'&&state.guide?.round<E.governanceEvents.length?state.guide.round:Infinity;}
function lastDecision(){return S.decisions(state,E.governanceEvents).filter(d=>d.event<=through()).at(-1);}
function currentImpact(){const last=lastDecision();return last?S.impact(state,E.governanceEvents,last.event):null;}
indicators=function(){return S.scores(state,E.governanceEvents,through());};
function meter(key,label,n){return `<div class="meter" data-society-score="${key}"><div><span>${label}</span><b>${n[key]}</b></div><div class="meter-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${n[key]}"><i class="meter-${key}" style="width:${n[key]}%"></i></div></div>`;}
renderMeters=function(){const n=indicators();$('#governanceMeters').innerHTML=`<div class="meter-heading"><b>YOUR SOCIETY</b><span>Scores run from 0 to 100. Watch life change.</span></div>${meter('trust','Public trust',n)}${meter('liberty','Civil liberties',n)}${meter('budget','Budget room',n)}<details class="other-scores"><summary>See safety and support scores</summary>${meter('order','Public order',n)}${meter('approval','Public approval',n)}</details>`;renderSociety();};
let board=document.createElement('section');board.id='societyLife';board.className='society-life';board.setAttribute('aria-label','Life in your country');$('#governanceMeters').after(board);
function renderSociety(){const harm=S.consequences(state,E.governanceEvents,through());const n=indicators(),impact=view==='power'?null:currentImpact();const cards=S.residents(n),states=S.unrest(state,E.governanceEvents,through());const label=impact?'After round '+(impact.round+1):'Your government in daily life';const html=`<div class="society-heading"><b>Life in your country</b><span>${label}</span></div><div class="society-toll" aria-live="polite"><span>Lives lost <b>${harm.deaths}</b></span><span>People hurt <b>${harm.injuries}</b></span><span>Leader <b>${harm.removed?'Removed':states.some(r=>r.phase==='insurrection')?'Losing control':harm.strike?'Facing a strike':'In office'}</b></span>${harm.resignations.length?`<small>Quit: ${esc(harm.resignations.join(', '))}</small>`:''}</div><div class="state-unrest" aria-label="State unrest"><b class="unrest-title">STATE UNREST</b>${states.map(r=>`<div class="unrest-row ${r.phase}"><b>${esc(r.name)}</b><span>${r.phase==='insurrection'?'⚠ Insurrection':r.phase==='protests'?'Protests':'Calm'} · ${r.pressure}</span><meter min="0" max="100" value="${r.pressure}" aria-label="${esc(r.name)} unrest">${r.pressure}</meter></div>`).join('')}</div><div class="resident-grid">${cards.map(c=>`<article class="resident-card"><span class="resident-avatar" aria-hidden="true">${c.icon}</span><div><b>${esc(c.name)}</b><p>“${esc(c.text)}”</p></div></article>`).join('')}</div>`;if(board.innerHTML!==html)board.innerHTML=html;}
function uprisingMarkup(round){
 const h=S.consequences(state,E.governanceEvents,round),before=S.consequences(state,E.governanceEvents,round-1),states=S.unrest(state,E.governanceEvents,round).filter(r=>r.phase==='insurrection');
 if(!states.length)return '';
 const fresh=h.uprisingDeaths-before.uprisingDeaths;
 return `<section class="uprising-alert" role="alert"><div class="step-kicker">STATE INSURRECTION</div><h3>${states.length===3?'Your government loses control.':'States rise against your rule.'}</h3><p><b>${states.map(r=>esc(r.name)).join(', ')}</b> ${states.length===1?'refuses':'refuse'} your orders. Armed unrest breaks out.</p><p>${esc(states[0].reason)}</p>${fresh?`<p><b>Rebellion adds ${fresh} dead and ${fresh*4} hurt.</b></p>`:''}${states.length===3?'<p>Your leader is removed. The cabinet takes over.</p>':''}<details><summary>Why did this happen?</summary><p>In this game, repeated abuses plus low trust can turn protests into an insurrection. Disagreement alone does not cause it.</p></details></section>`;
}
function impactMarkup(round){const impact=S.impact(state,E.governanceEvents,round);if(!impact)return '';const event=E.governanceEvents[round],choice=event.choices[impact.choice],harm=choice.harm;const labels={trust:'Trust',liberty:'Liberties',budget:'Budget',approval:'Approval'};const toll=harm?[harm.deaths?harm.deaths+' dead':'',harm.injuries?harm.injuries+' hurt':'',harm.removed?'You are removed from office':harm.strike?'National strike':'',harm.resigned?harm.resigned+' quits':''].filter(Boolean).join(' · '):'';return `<section class="people-impact"><h3>What happened</h3>${toll?`<p class="harm-result"><b>${esc(toll)}</b></p>`:''}<p class="impact-result">${esc(choice.result)}</p><div class="impact-numbers" aria-label="Scores before and after this decision">${['approval','trust','liberty','budget'].map(k=>`<span class="impact-change ${impact.after[k]>impact.before[k]?'up':impact.after[k]<impact.before[k]?'down':'same'}"><b>${labels[k]}</b><span>${impact.before[k]} → ${impact.after[k]}</span></span>`).join('')}</div>${choice.rival?`<p class="rival-line"><b>${CountryChaos.RIVAL} (your rival):</b> “${esc(choice.rival)}”</p>`:''}${event.reveal?`<p class="concept-reveal">${esc(event.reveal)}</p>`:''}</section>`;}
function outline(poly){ctx.beginPath();poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function tree(x,y,size=12){ctx.fillStyle='#906b43';ctx.fillRect(x-2,y,4,size);ctx.fillStyle='#4b9a70';ctx.beginPath();ctx.arc(x,y-3,size*.75,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6bb47a';ctx.beginPath();ctx.arc(x-size*.35,y-size*.4,size*.55,0,Math.PI*2);ctx.fill();}
function hill(x,y,size){ctx.fillStyle='#a6bca5';ctx.beginPath();ctx.moveTo(x-size,y+size*.55);ctx.lineTo(x,y-size);ctx.lineTo(x+size,y+size*.55);ctx.closePath();ctx.fill();ctx.fillStyle='#fff5df';ctx.beginPath();ctx.moveTo(x-size*.3,y-size*.4);ctx.lineTo(x,y-size);ctx.lineTo(x+size*.35,y-size*.4);ctx.closePath();ctx.fill();}
function face(x,y,value,shirt){ctx.save();ctx.fillStyle=shirt;ctx.beginPath();ctx.roundRect(x-7,y+2,14,17,5);ctx.fill();ctx.fillStyle='#a87350';ctx.beginPath();ctx.arc(x,y-6,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#473b3c';ctx.beginPath();ctx.arc(x-3,y-7,1.1,0,7);ctx.arc(x+3,y-7,1.1,0,7);ctx.fill();ctx.strokeStyle='#473b3c';ctx.lineWidth=1.5;ctx.beginPath();if(value>=60)ctx.arc(x,y-5,4,.2,Math.PI-.2);else if(value<35)ctx.arc(x,y+1,4,Math.PI+.2,-.2);else{ctx.moveTo(x-3,y-2);ctx.lineTo(x+3,y-2);}ctx.stroke();ctx.restore();}
function capsule(text,x,y,width=175,size=14){ctx.save();ctx.fillStyle='#fffdf3f2';ctx.strokeStyle='#6e8a8670';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-width/2,y-12,width,25,9);ctx.fill();ctx.stroke();ctx.fillStyle='#284f59';ctx.font='bold '+size+'px Arial';ctx.textAlign='center';ctx.fillText(text,x,y+4,width-14);ctx.restore();}
function home(x,y){ctx.fillStyle='#fff7e1';ctx.fillRect(x-10,y-6,20,19);ctx.fillStyle='#e58b60';ctx.beginPath();ctx.moveTo(x-14,y-6);ctx.lineTo(x,y-18);ctx.lineTo(x+14,y-6);ctx.closePath();ctx.fill();ctx.fillStyle='#5b8c9b';ctx.fillRect(x-6,y,5,5);ctx.fillRect(x+3,y,5,5);ctx.fillStyle='#a17b5c';ctx.fillRect(x-2,y+6,5,7);}
function scene(impact){if(!impact)return;const candidates=[[[330,245],[160,210],[375,220]],[[570,245],[765,215],[600,300]],[[600,495],[305,465],[620,530]]][impact.round%3];const [x,y]=candidates.find(([cx,cy])=>state.marks.every(m=>Math.hypot(m.x-cx,m.y-cy)>95))||candidates[0];ctx.save();ctx.textAlign='center';ctx.font='32px "Apple Color Emoji","Segoe UI Emoji",sans-serif';let label='';
 if(impact.scene==='homes'||impact.scene==='building'){[-26,0,26].forEach((dx,i)=>home(x+dx,y+(i%2)*8));label=impact.scene==='homes'?'New homes':'Building plans';}
 else if(impact.scene==='protest'){[-20,0,20].forEach((dx,i)=>{face(x+dx,y,25,['#6687c3','#d87568','#8e78ac'][i]);ctx.fillStyle='#fff9eb';ctx.fillRect(x+dx-8,y-34,17,12);ctx.fillStyle='#536b7a';ctx.font='bold 9px Arial';ctx.fillText('!',x+dx,y-25);});label='People protest';}
 else{const symbols={blackout:['🏥','Power is out'],cooling:['❄️','Cool places open'],power:['⚡','Power controls'],voting:['🗳️','Voting is open'],queue:['🗳️','Long voting lines'],privacy:['🔒','Privacy rights'],oops:['💻','Records leaked'],school:['🎒','School life'],court:['⚖️','Courts step in'],hearing:['💬','Public voices'],border:['🛂','Border rules'],shelter:['⛺','Safe places'],hospital:['🏥','Health care'],shops:['🏪','Local businesses'],states:['📋','State rules']};const pair=symbols[impact.scene]||['💬','People respond'];ctx.font='32px "Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.fillText(pair[0],x,y+2);label=pair[1];if(impact.scene==='queue')[-28,-16,16].forEach(dx=>face(x+dx,y+25,40,'#8e78ac'));if(impact.scene==='blackout'){ctx.strokeStyle='#c36448';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-18,y+5);ctx.lineTo(x+18,y-25);ctx.stroke();}}
 capsule(label,x,y+47,155);ctx.restore();}
// ---- Living map ----------------------------------------------------------
// The map is painted into cached layers (sea, land, middle, top) only when the country changes.
// Each animation frame just stacks those layers and adds a few light moving touches:
// shimmering water, swaying trees, bobbing people, little cars, drifting clouds,
// unrest glow and smoke, cheering confetti, a pulsing crisis marker, and a drop-in for new places.
// It pauses when the tab is hidden or the map is off screen, and stays still for reduced motion.
const W=960,H=650,TAU=Math.PI*2,EMOJI='"Apple Color Emoji","Segoe UI Emoji",sans-serif';
const motionQuery=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const calm=()=>motionQuery.matches;
const now=()=>performance.now();
function layer(w=W,h=H){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
const L={sea:layer(),land:layer(),mid:layer(),top:layer()};
const statePaths=shapes.map(poly=>{const p=new Path2D();poly.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();return p;});
const treeSpots=[[],[[805,255,12],[830,280,11]],[[625,515,15],[655,530,13]]];
for(let t=0;t<16;t++)treeSpots[0].push([115+(t*47)%310,180+(t*61)%145,9+(t%3)*2]);
const roads=shapes.map((poly,i)=>[[poly[0][0]+35,poly[0][1]+50],[anchors[i][0],anchors[i][1]+90],[people[i][0]+90,people[i][1]+10]]);
const shirts=['#ec866c','#6889c9','#8872b7'];
let posterMode=false,still=false,info=null,primed=false,newsKey='',newsSince=0;
const seen=new Set(),pops=new Map(),ripples=[],sparks=[],lastMood=[null,null,null],cheerAt=[0,0,0];
const POP_MS=760;
function paintInto(c,fn){const keep=ctx;ctx=c.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);try{fn();}finally{ctx=keep;}}
function moodOf(v){return v>=60?'happy':v<35?'sad':'ok';}
// Sprites made once.
const sprites=(()=>{
 const wave=(w,h,ox,oy,len,color,width)=>{const c=layer(w,h),g=c.getContext('2d');g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.beginPath();g.moveTo(ox,oy);g.quadraticCurveTo(ox+len*.25,oy-len*.13,ox+len*.5,oy);g.quadraticCurveTo(ox+len*.75,oy+len*.13,ox+len,oy);g.stroke();return c;};
 const sun=layer(560,560),sg=sun.getContext('2d'),grad=sg.createRadialGradient(280,280,0,280,280,280);grad.addColorStop(0,'rgba(255,240,190,.75)');grad.addColorStop(.45,'rgba(255,236,180,.28)');grad.addColorStop(1,'rgba(255,236,180,0)');sg.fillStyle=grad;sg.fillRect(0,0,560,560);
 const blob=(fill,blur)=>{const c=layer(170,80),g=c.getContext('2d');if(blur)g.filter='blur('+blur+'px)';g.fillStyle=fill;g.beginPath();[[50,48,22],[78,36,28],[108,44,22],[128,52,15],[32,54,13]].forEach(([x,y,r])=>{g.moveTo(x+r,y);g.arc(x,y,r,0,TAU);});g.rect(32,48,96,18);g.fill();return c;};
 return {waveA:wave(62,43,8,21,45,'rgba(255,255,255,.46)',2),waveB:wave(93,64,30,44,28,'rgba(255,255,255,.55)',1.5),sun,cloud:blob('rgba(255,255,255,.9)',1.2),cloudShade:blob('rgba(46,96,108,.55)',5)};
})();
// Waves are baked once into sheets slightly larger than the map, then slid around (cheap blits, no pattern fills).
function sheet(tile){const c=layer(W+tile.width,H+tile.height),g=c.getContext('2d');g.fillStyle=g.createPattern(tile,'repeat');g.fillRect(0,0,c.width,c.height);return c;}
const sheetA=sheet(sprites.waveA),sheetB=sheet(sprites.waveB);
// Sea glints sit only on open water.
const glints=[];for(let k=0,tries=0;glints.length<16&&tries<400;tries++){const x=20+((tries*137)%920),y=20+((tries*89)%610);if(!insideCountry(x,y)&&!insideCountry(x+22,y)&&!insideCountry(x-22,y)&&!insideCountry(x,y+22)&&!insideCountry(x,y-22))glints.push([x,y,(tries*1.7)%TAU]);}
const clouds=[{y:30,s:.95,v:7,o:0},{y:52,s:.7,v:10,o:520},{y:608,s:.75,v:6,o:260}];
// Pre-size each cloud so frames blit at 1:1 on whole pixels (much cheaper on slow laptops).
clouds.forEach(c=>{const w=Math.round(170*c.s),h=Math.round(80*c.s);c.w=w;c.h=h;c.img=layer(w,h);c.img.getContext('2d').drawImage(sprites.cloud,0,0,w,h);c.shade=layer(w,h);c.shade.getContext('2d').drawImage(sprites.cloudShade,0,0,w,h);});
function sceneInfo(){
 const n=indicators(),impact=currentImpact(),governing=state.guide?.task>=8;
 const stateMood=S.unrest(state,E.governanceEvents,through());const moods=[n.liberty,n.budget,n.trust];
 const badges=governing?[n.liberty>=60?'People feel free':n.liberty<35?'Rights at risk':'Rights debated',n.budget>=40?'Services funded':n.budget<25?'Money is tight':'Budget is stretched',n.trust>=60?'People feel heard':n.trust<35?'Trust is low':'People are split']:['Pine forest','Sunny coast','River valley'];
 if(governing)stateMood.forEach((r,i)=>{if(r.phase==='insurrection')badges[i]='⚠ STATE REBELS';else if(r.phase==='protests')badges[i]='People protest';});
 const news=governing&&view==='crisis'?S.crises(state,through()).at(-1):null;
 const showNews=!!(news&&state.guide?.round===news.slot+1);
 return {n,impact,governing,stateMood,moods,badges,news:showNews?news:null};
}
function paintSea(){paintInto(L.sea,()=>{const sea=ctx.createLinearGradient(0,0,W,H);sea.addColorStop(0,'#d8f4f4');sea.addColorStop(1,'#a9dce9');ctx.fillStyle=sea;ctx.fillRect(0,0,W,H);ctx.globalAlpha=.55;ctx.drawImage(sprites.sun,-250,-260);ctx.globalAlpha=1;});}
function paintLand(){paintInto(L.land,()=>{shapes.forEach((poly,i)=>{ctx.save();ctx.shadowColor='#4b8d9d40';ctx.shadowBlur=12;ctx.shadowOffsetY=7;outline(poly);ctx.fillStyle=colors[i];ctx.fill();ctx.shadowColor='transparent';ctx.lineWidth=10;ctx.strokeStyle='#fffdf0';ctx.stroke();ctx.clip();
  if(i===0){hill(165,155,32);hill(205,140,25);}
  if(i===1){for(let t=0;t<9;t++){ctx.fillStyle=t%2?'#e9bf76':'#f8e8b2';ctx.beginPath();ctx.ellipse(530+t*38,235+(t%3)*30,48,18,-.3,0,TAU);ctx.fill();}hill(780,195,35);}
  if(i===2){for(let t=0;t<8;t++){ctx.save();ctx.translate(240+t*38,470+(t%2)*45);ctx.rotate(-.17);ctx.fillStyle=t%2?'#a4cd9e':'#f0d596';ctx.fillRect(-20,-10,45,28);ctx.strokeStyle='#ffffff70';ctx.lineWidth=2;for(let j=0;j<4;j++){ctx.beginPath();ctx.moveTo(-15+j*10,-8);ctx.lineTo(-15+j*10,16);ctx.stroke();}ctx.restore();}}
  ctx.restore();});});}
function paintMid(){paintInto(L.mid,()=>{shapes.forEach((poly,i)=>{ctx.save();ctx.clip(statePaths[i]);
  ctx.strokeStyle='#74bed5';ctx.lineWidth=13;ctx.lineCap='round';ctx.beginPath();if(i===0){ctx.moveTo(300,90);ctx.bezierCurveTo(250,180,395,205,350,365);}else if(i===1){ctx.moveTo(665,80);ctx.bezierCurveTo(610,160,755,240,800,365);}else{ctx.moveTo(440,375);ctx.bezierCurveTo(520,440,410,480,495,605);}ctx.stroke();ctx.strokeStyle='#bbecf2';ctx.lineWidth=4;ctx.stroke();
  const [a,c,b]=roads[i];ctx.strokeStyle='#fbf5dd';ctx.lineWidth=8;ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(c[0],c[1],b[0],b[1]);ctx.stroke();ctx.strokeStyle='#b69d7c';ctx.lineWidth=1.5;ctx.setLineDash([4,7]);ctx.stroke();ctx.setLineDash([]);ctx.restore();});
 ctx.fillStyle='#397987';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText('N',45,38);ctx.strokeStyle='#599dab';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(45,48);ctx.lineTo(45,83);ctx.moveTo(28,65);ctx.lineTo(62,65);ctx.stroke();
 state.strokes.forEach(s=>stroke(ctx,s));
 people.forEach(([x,y],i)=>capsule(info.badges[i],x,y+34,145));});}
function paintTop(){const skip=still?null:pops;paintInto(L.top,()=>{const {impact,governing,stateMood}=info;
 if(governing&&!stateMood.some(r=>r.phase==='insurrection'))scene(impact);
 state.marks.forEach(m=>{if(skip&&skip.has(m.id))return;drawMark(m);if(m.kind==='place')capsule(m.text,m.x,m.y+31,125,13);if(impact?.scene==='blackout'&&/hospital|power plant/i.test(m.text||'')){ctx.save();ctx.fillStyle='#59667966';ctx.fillRect(m.x-28,m.y-34,56,54);ctx.font='bold 15px Arial';ctx.textAlign='center';ctx.fillStyle='#98442e';ctx.fillText('POWER OUT',m.x,m.y+50);ctx.restore();}});
 anchors.forEach(([x,y],i)=>capsule(String(state.regions[i]).toUpperCase(),x,y,185,16));});}
// ---- moving pieces (drawn on the visible canvas each frame) ----
function water(t){
 const dx=(t*5)%62,dy=1+Math.sin(t*.5)*1.5;ctx.drawImage(sheetA,Math.round(dx-62),Math.round(dy-22));
 if(still)return;
 const ex=(t*3.2)%93,ey=Math.cos(t*.4)*1.5;ctx.globalAlpha=.3+.25*Math.sin(t*.9);ctx.drawImage(sheetB,Math.round(-ex),Math.round(ey-32));ctx.globalAlpha=1;
 ctx.save();ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.lineWidth=1.4;for(const [x,y,ph] of glints){const tw=Math.pow(Math.max(0,Math.sin(t*1.1+ph)),8);if(tw<.04)continue;const r=2+5*tw;ctx.globalAlpha=tw*.95;ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r*.7);ctx.lineTo(x,y+r*.7);ctx.stroke();}ctx.restore();}
function trees(t){for(let i=0;i<3;i++){const spots=treeSpots[i];ctx.save();ctx.clip(statePaths[i]);
 ctx.fillStyle='#906b43';ctx.beginPath();for(const [x,y,s] of spots)ctx.rect(x-2,y,4,s);ctx.fill();
 const sway=(x,s)=>still?0:Math.sin(t*1.5+x*.07)*Math.min(1.7,s*.13);
 ctx.fillStyle='#4b9a70';ctx.beginPath();for(const [x,y,s] of spots){const w=sway(x,s),cx=x+w,r=s*.75;ctx.moveTo(cx+r,y-3);ctx.arc(cx,y-3,r,0,TAU);}ctx.fill();
 ctx.fillStyle='#6bb47a';ctx.beginPath();for(const [x,y,s] of spots){const w=sway(x,s)*1.35,cx=x-s*.35+w,r=s*.55;ctx.moveTo(cx+r,y-s*.4);ctx.arc(cx,y-s*.4,r,0,TAU);}ctx.fill();ctx.restore();}}
function cars(t){if(still)return;const colors=['#e46b4f','#3f7fb8','#e8a93a'];roads.forEach(([a,c,b],i)=>{const speed=.055+i*.012,raw=(t*speed+i*.37)%2,u=raw<1?raw:2-raw,dir=raw<1?1:-1;const q=1-u,x=q*q*a[0]+2*q*u*c[0]+u*u*b[0],y=q*q*a[1]+2*q*u*c[1]+u*u*b[1];const tx=2*q*(c[0]-a[0])+2*u*(b[0]-c[0]),ty=2*q*(c[1]-a[1])+2*u*(b[1]-c[1]);ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(ty*dir,tx*dir));ctx.fillStyle='#0002';ctx.beginPath();ctx.roundRect(-5,-1.5,11,6,2);ctx.fill();ctx.fillStyle=colors[i];ctx.beginPath();ctx.roundRect(-5.5,-3,11,6,2.2);ctx.fill();ctx.fillStyle='#fffbe8';ctx.fillRect(1.5,-2,2.5,4);ctx.restore();});}
function glow(t){if(!info.governing)return;info.stateMood.forEach((r,i)=>{if(r.phase==='calm')return;const hot=r.phase==='insurrection',pulse=still?.5:.5+.5*Math.sin(t*(hot?2.6:1.8));const rgb=hot?'196,62,40':'222,150,40';ctx.save();ctx.clip(statePaths[i]);ctx.strokeStyle=`rgba(${rgb},${(hot?.16:.12)+pulse*(hot?.14:.1)})`;ctx.lineWidth=40;ctx.stroke(statePaths[i]);ctx.strokeStyle=`rgba(${rgb},${(hot?.3:.22)+pulse*.2})`;ctx.lineWidth=14;ctx.stroke(statePaths[i]);if(hot){ctx.fillStyle=`rgba(${rgb},${.04+pulse*.05})`;ctx.fill(statePaths[i]);}ctx.restore();});}
function rainCloud(x,y,t){ctx.save();ctx.fillStyle='#8d9aa3';ctx.globalAlpha=.9;ctx.beginPath();[[-8,0,7],[2,-4,9],[11,1,6]].forEach(([dx,dy,r])=>{ctx.moveTo(x+dx+r,y+dy);ctx.arc(x+dx,y+dy,r,0,TAU);});ctx.rect(x-8,y,19,6);ctx.fill();if(!still){ctx.strokeStyle='#6f9cc0';ctx.lineWidth=1.5;ctx.lineCap='round';for(let k=0;k<4;k++){const off=((t*26+k*7)%14);ctx.globalAlpha=.8*(1-off/14);ctx.beginPath();ctx.moveTo(x-7+k*5,y+8+off);ctx.lineTo(x-8+k*5,y+11+off);ctx.stroke();}}ctx.restore();}
function crowd(t,dt){const {governing,moods,stateMood}=info;people.forEach(([x,y],i)=>{const phase=governing?stateMood[i].phase:'calm',v=governing?moods[i]:70,mood=governing?moodOf(v):'calm';
 [-14,14].forEach((dx,j)=>{let bob=0,sx=0;if(!still){if(mood==='happy')bob=-Math.pow(Math.max(0,Math.sin(t*3.4+j*1.3+i)),2)*5;else if(mood==='sad')sx=Math.sin(t*.9+j)*.7;else bob=-Math.sin(t*2+j*1.7+i)*1.2;}
  const jump=ripples.find(r=>r.i===i);if(jump&&!still){const a=(now()-jump.at)/700;if(a<1)bob-=Math.sin(a*Math.PI)*7;}
  face(x+dx+sx,y+bob,v,shirts[(i+j)%3]);});
 if(governing&&mood==='sad'&&phase!=='insurrection')rainCloud(x,y-40,t);
 if(governing&&phase==='insurrection')rebelFlag(x,y,t);
 if(governing&&mood==='happy'&&phase==='calm'&&!still&&now()-cheerAt[i]>2600){cheerAt[i]=now();for(let k=0;k<8;k++){const a=-Math.PI/2+(k-3.5)*.22;sparks.push({x:x+(k%2?10:-10),y:y-18,vx:Math.cos(a)*(40+k*4),vy:Math.sin(a)*(95+(k%3)*18),life:1.25,age:0,c:['#ec866c','#f2b43a','#4a9986','#7e89c9'][k%4],rot:k});}}});}
function rebelFlag(x,y,t){const px=x+35,py=y-35,w=still?0:Math.sin(t*5)*2.4,w2=still?0:Math.sin(t*5+1.4)*2.4;ctx.save();
 if(!still){for(let k=0;k<4;k++){const a=(t*.32+k/4)%1;ctx.globalAlpha=.34*(1-a)*Math.min(1,a*5);ctx.fillStyle='#7d7570';ctx.beginPath();ctx.arc(px+18+Math.sin(a*3+k)*6+a*10,py-6-a*48,4+a*11,0,TAU);ctx.fill();}ctx.globalAlpha=1;}
 ctx.strokeStyle='#a34c39';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px,y+8);ctx.lineTo(px,py);ctx.stroke();
 ctx.fillStyle='#bd5947';ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+15,py-w,px+30,py+w2);ctx.lineTo(px+30,py+19+w2);ctx.quadraticCurveTo(px+15,py+19-w,px,py+19);ctx.closePath();ctx.fill();
 ctx.fillStyle='#fff5df';ctx.font='bold 15px Arial';ctx.textAlign='center';ctx.fillText('!',px+15,py+15+w2*.3);ctx.restore();}
function particles(dt){if(!sparks.length)return;ctx.save();for(let k=sparks.length-1;k>=0;k--){const p=sparks[k];p.age+=dt;if(p.age>=p.life){sparks.splice(k,1);continue;}p.vy+=210*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;ctx.globalAlpha=Math.min(1,(p.life-p.age)*2.2);ctx.fillStyle=p.c;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot+p.age*8);ctx.fillRect(-2,-3,4,6);ctx.restore();}ctx.restore();}
function rings(){for(let k=ripples.length-1;k>=0;k--){const r=ripples[k],a=(now()-r.at)/1100;if(a>=1){ripples.splice(k,1);continue;}const [x,y]=people[r.i];ctx.save();for(const lag of [0,.25]){const b=a-lag;if(b<=0||b>=.75)continue;const e=b/.75;ctx.strokeStyle=r.good?`rgba(74,153,110,${.6*(1-e)})`:`rgba(196,72,48,${.6*(1-e)})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+4,22+e*48,12+e*24,0,0,TAU);ctx.stroke();}ctx.restore();}}
function newsBadge(t){const news=info.news;if(!news)return;const i=Math.max(0,state.regions.indexOf(news.vars?.state)),[x,y]=anchors[i];const age=still?1e9:now()-newsSince;const e=Math.min(1,age/520),back=1+2.2*Math.pow(e-1,3)+1.2*Math.pow(e-1,2);const s=still?1:(age<520?.6+.4*back:1+.025*Math.sin(t*4));
 ctx.save();ctx.translate(x,y-34+(1-Math.min(1,e*1.4))*-22);ctx.scale(s,s);ctx.globalAlpha=Math.min(1,e*2);
 if(!still&&age>520){for(const off of [0,.5]){const k=((t/1.8)+off)%1;ctx.strokeStyle=`rgba(179,49,29,${.45*(1-k)})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(-105-k*16,-16-k*10,210+k*32,32+k*20,9+k*6);ctx.stroke();}}
 ctx.shadowColor='#0005';ctx.shadowBlur=8;ctx.shadowOffsetY=2;ctx.fillStyle='#b3311d';ctx.beginPath();ctx.roundRect(-105,-16,210,32,9);ctx.fill();ctx.shadowColor='transparent';ctx.fillStyle='#fff';ctx.font='bold 15px Arial';ctx.textAlign='center';ctx.fillText('⚠ '+String(CountryChaos.view(news).name).toUpperCase(),0,5,196);ctx.restore();}
function cloudsPass(t){if(still)return;const span=W+340;for(const c of clouds){const x=Math.round(((t*c.v+c.o)%span)-170),y=Math.round(c.y-c.h/2);ctx.globalAlpha=.09;ctx.drawImage(c.shade,x+22,y+30+Math.round(c.h/2));ctx.globalAlpha=.78;ctx.drawImage(c.img,x,y);}ctx.globalAlpha=1;}
const easeOutBack=e=>1+2.4*Math.pow(e-1,3)+1.4*Math.pow(e-1,2);
function popIns(){if(!pops.size)return;let done=false;for(const [id,at] of pops){const m=state.marks.find(k=>k.id===id);const p=(now()-at)/POP_MS;if(!m||p>=1){pops.delete(id);done=true;continue;}if(p<0)continue;
 const fall=Math.min(1,p/.5),drop=-56*(1-fall*fall),land=p>.5?(p-.5)/.5:0,squash=p>.5&&p<.75?Math.sin((p-.5)/.25*Math.PI):0;const sx=1+.09*squash,sy=1-.13*squash,baseY=m.y+20;
 ctx.save();ctx.globalAlpha=.22*fall;ctx.fillStyle='#24434f';ctx.beginPath();ctx.ellipse(m.x,baseY,10+20*fall,4+5*fall,0,0,TAU);ctx.fill();ctx.restore();
 if(land>0){const e=Math.min(1,land*1.25);ctx.save();ctx.strokeStyle=`rgba(255,253,240,${.85*(1-e)})`;ctx.lineWidth=4*(1-e)+1;ctx.beginPath();ctx.ellipse(m.x,baseY,24+38*e,8+13*e,0,0,TAU);ctx.stroke();ctx.fillStyle=`rgba(242,180,58,${1-e})`;for(let k=0;k<6;k++){const a=k/6*TAU+.3,r=30+26*e;ctx.beginPath();ctx.arc(m.x+Math.cos(a)*r,baseY-8+Math.sin(a)*r*.45,2.6*(1-e)+.5,0,TAU);ctx.fill();}ctx.restore();}
 ctx.save();ctx.globalAlpha=Math.min(1,p/.18);ctx.translate(m.x,baseY);ctx.scale(sx,sy);ctx.translate(-m.x,-baseY+drop);drawMark(m);ctx.restore();
 if(m.kind==='place'&&land>0){ctx.save();ctx.globalAlpha=Math.min(1,land*2);capsule(m.text,m.x,m.y+31,125,13);ctx.restore();}}
 if(done)paintTop();}
let lastT=0;
function frame(ms){still=posterMode||calm();const t=ms/1000,dt=Math.min(.05,Math.max(0,t-(lastT||t)));lastT=t;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
 ctx.drawImage(L.sea,0,0);water(t);ctx.drawImage(L.land,0,0);trees(t);ctx.drawImage(L.mid,0,0);cars(t);glow(t);rings();crowd(t,dt);ctx.drawImage(L.top,0,0);if(!still)popIns();particles(still?0:dt);newsBadge(t);cloudsPass(t);}
// ---- loop control: rAF only while it can be seen; if the laptop can't keep up, draw every other frame ----
const stats={frames:0,drawn:0,avgCost:0,avgGap:16.7,lowPower:false,running:false};
let raf=0,onScreen=true,flip=false,lastMs=0,lowSince=0,warm=0;
const canRun=()=>!calm()&&!posterMode&&!document.hidden&&onScreen;
function tick(ms){raf=0;if(!canRun()){stats.running=false;return;}raf=requestAnimationFrame(tick);stats.frames++;
 if(lastMs){const gap=Math.min(100,ms-lastMs);stats.avgGap=stats.avgGap*.92+gap*.08;}lastMs=ms;warm++;
 if(!stats.lowPower&&warm>45&&stats.avgGap>24){stats.lowPower=true;lowSince=ms;}
 else if(stats.lowPower&&ms-lowSince>12000){stats.lowPower=false;warm=0;stats.avgGap=16.7;}
 if(stats.lowPower&&(flip=!flip))return;
 const t0=now();frame(ms);stats.drawn++;stats.avgCost=stats.avgCost*.95+(now()-t0)*.05;}
function kick(){if(!raf&&canRun()){stats.running=true;lastT=0;lastMs=0;warm=0;raf=requestAnimationFrame(tick);}}
document.addEventListener('visibilitychange',kick);
if('IntersectionObserver' in window)new IntersectionObserver(es=>{onScreen=es.some(e=>e.isIntersecting);kick();}).observe(map);
motionQuery.addEventListener?.('change',()=>drawMap());
paintSea();
drawMap=function(){
 map.setAttribute('aria-label','Map of your country with '+state.marks.length+' places. Faces and signs show how society changes.');
 info=sceneInfo();still=posterMode||calm();const t=now();
 // New places drop in; marks present at page load do not.
 for(const m of state.marks){if(seen.has(m.id))continue;seen.add(m.id);if(primed&&canRun())pops.set(m.id,t);}
 primed=true;for(const [id,at] of pops)if(t-at>=POP_MS||!state.marks.some(m=>m.id===id))pops.delete(id);
 // Faces react when a state's mood changes.
 if(info.governing)info.moods.forEach((v,i)=>{const m=info.stateMood[i].phase==='insurrection'?0:v>=60?3:v>=35?2:1;if(lastMood[i]!==null&&m!==lastMood[i]&&canRun())ripples.push({i,at:t,good:m>lastMood[i]});lastMood[i]=m;});
 const key=info.news?info.news.slot+':'+info.news.id:'';if(key!==newsKey){newsKey=key;newsSince=t;}
 paintLand();paintMid();paintTop();frame(t);kick();
};
function setStill(on){posterMode=!!on;if(posterMode){pops.clear();sparks.length=0;ripples.length=0;}drawMap();}
window.CountryWorld={uprisingMarkup,impactMarkup,currentImpact,through,setStill,motionStats:stats};
})();
