/* Generative geometry, not experimental data. All interaction stays in the browser. */
'use strict';
(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const fine = matchMedia('(hover: hover) and (pointer: fine)');
 const root=document.documentElement, body=document.body;
 if(!fine.matches)document.querySelector('.scene-instruction').textContent='TAP A MODE TO EXPLORE';
 if(!reduced.matches && 'IntersectionObserver' in window){
  root.classList.add('atelier-motion');
  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');reveal.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('.section-heading,.project-card,.lab-shell,.skill-card,.experience-strip,.step,.contact-panel').forEach((el,i)=>{el.classList.add('reveal-ready');el.style.setProperty('--reveal-delay',(i%3)*60+'ms');reveal.observe(el);});
 }
 document.querySelectorAll('.project-card,.skill-card').forEach(card=>{
  card.addEventListener('pointermove',e=>{if(reduced.matches||!fine.matches||body.classList.contains('pause-motion'))return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.setProperty('--tilt-x',(0.5-y)*5+'deg');card.style.setProperty('--tilt-y',(x-.5)*5+'deg');card.style.setProperty('--glow-x',x*100+'%');card.style.setProperty('--glow-y',y*100+'%');},{passive:true});
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');});
 });
 const canvas=document.getElementById('hero-canvas');
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const modeButtons=[...document.querySelectorAll('[data-scene]')],equation=document.getElementById('scene-equation'),label=document.getElementById('scene-label');
 const equations=['z = sin(x + t) + cos(y − t)','r(u,v) · a parametric knot','dx/dt = σ(y − x)'];
 const labels=['01 / COMPUTATIONAL FIELD','02 / PARAMETRIC ORBIT','03 / LORENZ ATTRACTOR'];
 const colors=[[149,244,220],[187,192,255],[145,213,255]];
 const n=2400,cols=60,rows=40;
 const lorenz=[];let lx=.1,ly=0,lz=0;
 for(let i=0;i<14400;i++){const dt=.004,dx=10*(ly-lx),dy=lx*(28-lz)-ly,dz=lx*ly-8*lz/3;lx+=dx*dt;ly+=dy*dt;lz+=dz*dt;if(i>=2400&&i%5===0)lorenz.push([lx/6.8,ly/7.2,(lz-26)/7.2]);}
 let width=0,height=0,dpr=1,mode=1,prevMode=1,morph=1,phase=0,visible=true,frameId=0,last=0,drawTime=0,dragging=false,lastX=0,lastY=0,rotateX=-.24,rotateY=.38,targetX=-.24,targetY=.38;
 let paused=reduced.matches;
 const positions=new Float32Array(n*3),projected=new Float32Array(n*3),origin=new Float32Array(n*3);
 function point(m,i,time){
  if(m===0){const x=(i%cols)/(cols-1)*7.3-3.65,z=Math.floor(i/cols)/(rows-1)*6-3,y=.52*Math.sin(x*1.25+time)+.4*Math.cos(z*1.15-time*.6)+.45*Math.exp(-((x-.2)**2+(z+.5)**2)/2);return[x,y*1.2,z*.82];}
  if(m===1){const u=(i%cols)/cols*Math.PI*2,v=Math.floor(i/cols)/rows*Math.PI*2;return[(2+.55*Math.cos(3*u+v))*Math.cos(2*u),(2+.55*Math.cos(3*u+v))*Math.sin(2*u),.82*Math.sin(3*u+v)];}
  return lorenz[i]||[0,0,0];
 }
 function updatePositions(){
  const eased=morph<1?1-(1-morph)**3:1;
  for(let i=0;i<n;i++){const p=point(mode,i,phase);for(let j=0;j<3;j++){const k=i*3+j;positions[k]=morph<1?origin[k]+(p[j]-origin[k])*eased:p[j];}}
 }
 function draw(){
  if(!width||!height)return;
  updatePositions();ctx.clearRect(0,0,width,height);
  const centerX=width*.51,centerY=height*.46,scale=Math.min(width*.114,height*.131);
  const glow=ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,Math.min(width,height)*.49);glow.addColorStop(0,'rgba(91,151,142,0.075)');glow.addColorStop(.65,'rgba(85,115,167,0.025)');glow.addColorStop(1,'rgba(9,13,19,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  ctx.save();ctx.translate(centerX,centerY);ctx.rotate(-.35);ctx.lineWidth=.65;ctx.strokeStyle='rgba(150,190,210,0.15)';ctx.beginPath();ctx.ellipse(0,0,Math.min(width*.46,height*.52),height*.28,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  const cx=Math.cos(rotateX),sx=Math.sin(rotateX),cy=Math.cos(rotateY),sy=Math.sin(rotateY);
  for(let i=0;i<n;i++){const k=i*3,x=positions[k],y=positions[k+1],z=positions[k+2],a=x*cy-z*sy,b=x*sy+z*cy,c=y*cx-b*sx,d=y*sx+b*cx,perspective=10/(10+d);projected[k]=centerX+a*scale*perspective;projected[k+1]=centerY+c*scale*perspective;projected[k+2]=d;}
  const col=colors[mode];
  if(mode===0&&morph>.7){ctx.lineWidth=.5;ctx.strokeStyle='rgba(149,244,220,0.13)';for(let row=0;row<rows;row+=2){ctx.beginPath();for(let c=0;c<cols;c++){const k=(row*cols+c)*3;if(c===0)ctx.moveTo(projected[k],projected[k+1]);else ctx.lineTo(projected[k],projected[k+1]);}ctx.stroke();}for(let c=0;c<cols;c+=3){ctx.beginPath();for(let row=0;row<rows;row++){const k=(row*cols+c)*3;if(row===0)ctx.moveTo(projected[k],projected[k+1]);else ctx.lineTo(projected[k],projected[k+1]);}ctx.stroke();}}
  if(mode===2&&morph>.75){ctx.beginPath();for(let i=0;i<n;i++){const k=i*3;if(i===0)ctx.moveTo(projected[k],projected[k+1]);else ctx.lineTo(projected[k],projected[k+1]);}ctx.strokeStyle='rgba(153,205,255,0.13)';ctx.lineWidth=.6;ctx.stroke();}
  for(let i=0;i<n;i++){const k=i*3,d=projected[k+2],alpha=Math.max(.12,Math.min(.96,.51-d*.09)),size=(mode===2?.56:.8)*(1-d*.085);ctx.beginPath();ctx.arc(projected[k],projected[k+1],Math.max(.35,size),0,Math.PI*2);ctx.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},${alpha})`;ctx.fill();}
  if(mode===2&&morph>.95){for(let j=0;j<8;j++){const i=(Math.floor(phase*90)+j*293)%n,k=i*3;ctx.beginPath();ctx.arc(projected[k],projected[k+1],1.7,0,Math.PI*2);ctx.fillStyle='#d8f5ff';ctx.fill();}}
 }
 function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
 function frame(t){frameId=0;if(!visible||document.hidden||paused)return;const dt=Math.min(.045,(t-(drawTime||t))/1000);last=t;if(t-drawTime>29){phase+=dt*.45;morph=Math.min(1,morph+dt*1.5);if(!dragging){targetY+=dt*.14;rotateY+=(targetY-rotateY)*.07;rotateX+=(targetX-rotateX)*.07;}else{rotateY=targetY;rotateX=targetX;}draw();drawTime=t;}frameId=requestAnimationFrame(frame);}
 function start(){if(!frameId&&visible&&!paused&&!document.hidden){last=0;frameId=requestAnimationFrame(frame);}}
 function stop(){cancelAnimationFrame(frameId);frameId=0;last=0;}
 function choose(next){if(next===mode)return;origin.set(positions);prevMode=mode;mode=next;morph=(paused||reduced.matches)?1:0;modeButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===mode)));equation.textContent=equations[mode];label.textContent=labels[mode];targetX=mode===0?-.68:mode===2?-.16:-.24;draw();start();}
 modeButtons.forEach((b,i)=>b.addEventListener('click',()=>choose(i)));
 canvas.addEventListener('pointerdown',e=>{if(paused||reduced.matches||e.pointerType==='touch')return;dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!dragging||paused)return;targetY+=(e.clientX-lastX)*.008;targetX=Math.max(-1.2,Math.min(1.2,targetX+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;},{passive:true});
 function release(){dragging=false;}canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
 document.getElementById('motion-toggle').addEventListener('click',()=>{paused=body.classList.contains('pause-motion');if(paused)stop();else start();});
 reduced.addEventListener('change',e=>{paused=e.matches;body.classList.toggle('pause-motion',paused);const btn=document.getElementById('motion-toggle');btn.textContent=paused?'Play motion':'Pause motion';btn.setAttribute('aria-pressed',String(paused));if(paused)stop();else start();});
 new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)start();else stop();},{rootMargin:'50px'}).observe(canvas);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
 canvas.setAttribute('aria-label','Interactive mathematical sculpture. Use the buttons to switch among a wave field, a parametric knot, and a Lorenz attractor.');
 label.textContent=labels[mode];equation.textContent=equations[mode];modeButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===mode)));
 resize();start();
})();
