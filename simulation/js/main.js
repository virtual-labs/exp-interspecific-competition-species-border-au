const Chart=(()=>{function draw(cv,series,opts={}){const dpr=window.devicePixelRatio||1;const cssW=cv.clientWidth||cv.width,cssH=cssW*0.62;cv.width=cssW*dpr;cv.height=cssH*dpr;const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const W=cssW,H=cssH,m={l:60,r:18,t:16,b:44};g.clearRect(0,0,W,H);let xs=[],ys=[];series.forEach(s=>s.data.forEach(p=>{xs.push(p[0]);ys.push(p[1]);}));if(!xs.length){g.fillStyle='#9aa3b2';g.font='15px Segoe UI';g.textAlign='center';g.fillText('Press "Plot" to see results',W/2,H/2);cv._series=null;return;}let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);if(opts.ymin!=null)ymin=opts.ymin;if(xmax===xmin)xmax=xmin+1;if(ymax===ymin)ymax=ymin+1;const pad=(ymax-ymin)*0.08;ymax+=pad;ymin-=pad*0.3;const X=x=>m.l+(x-xmin)/(xmax-xmin)*(W-m.l-m.r);const Y=y=>H-m.b-(y-ymin)/(ymax-ymin)*(H-m.t-m.b);g.font='12px Segoe UI';const nT=6;for(let i=0;i<=nT;i++){const gy=ymin+(ymax-ymin)*i/nT;g.strokeStyle='#eef1f6';g.beginPath();g.moveTo(m.l,Y(gy));g.lineTo(W-m.r,Y(gy));g.stroke();g.fillStyle='#7b8494';g.textAlign='right';g.textBaseline='middle';g.fillText(fmt(gy),m.l-8,Y(gy));}for(let i=0;i<=nT;i++){const gx=xmin+(xmax-xmin)*i/nT;g.strokeStyle='#f4f6fa';g.beginPath();g.moveTo(X(gx),m.t);g.lineTo(X(gx),H-m.b);g.stroke();g.fillStyle='#7b8494';g.textAlign='center';g.textBaseline='top';g.fillText(fmt(gx),X(gx),H-m.b+6);}g.strokeStyle='#c7ccd6';g.beginPath();g.moveTo(m.l,m.t);g.lineTo(m.l,H-m.b);g.lineTo(W-m.r,H-m.b);g.stroke();g.fillStyle='#4a5261';g.font='13px Segoe UI';if(opts.xlabel){g.textAlign='center';g.fillText(opts.xlabel,(m.l+W-m.r)/2,H-10);}if(opts.ylabel){g.save();g.translate(15,(m.t+H-m.b)/2);g.rotate(-Math.PI/2);g.textAlign='center';g.fillText(opts.ylabel,0,0);g.restore();}series.forEach(s=>{if(!s.data.length)return;g.strokeStyle=s.color;g.lineWidth=2.4;if(s.dash)g.setLineDash([6,5]);else g.setLineDash([]);g.beginPath();s.data.forEach((p,i)=>{const px=X(p[0]),py=Y(p[1]);i?g.lineTo(px,py):g.moveTo(px,py);});g.stroke();g.setLineDash([]);});cv._series=series;cv._map={xmin,xmax,ymin,ymax,m,W,H};}
function fmt(v){const a=Math.abs(v);if(a>=1000)return(v/1000).toFixed(a>=10000?0:1)+'k';if(a>0&&a<1)return v.toFixed(2);if(!Number.isInteger(v))return v.toFixed(1);return''+v;}return{draw};})();

const KB_A=200,KB_B=2000,KH_A=100,KH_B=1000;
let mode=0,lastData=null,lastMeta=null;
const TITLES=['Carrying capacity of each species','Equilibrium density under competition','Eastern border of species 1','Western border of species 2'];

document.getElementById('subtabs').addEventListener('click',e=>{const b=e.target.closest('.subtab');if(!b)return;mode=+b.dataset.mode;document.querySelectorAll('.subtab').forEach(t=>t.classList.toggle('active',t===b));document.getElementById('plotTitle').textContent=TITLES[mode];plot();});
function g(id){return +document.getElementById(id).value;}
function xvals(){const s=g('start'),f=g('frc'),e=g('end');const a=[];for(let x=s;x<e;x+=f)a.push(+(x+f).toFixed(2));return a;}
function build(){
  const X=xvals(),a12=g('a12'),a21=g('a21');let series,meta;
  if(mode===0){
    const k1=X.map(x=>[x,KB_A*(1-x/KB_B)]),k2=X.map(x=>[x,KH_A*(1+x/KH_B)]);
    series=[{name:'K₁ (species 1)',color:'#b50246',data:k1},{name:'K₂ (species 2)',color:'#0e7c86',data:k2}];
    meta={x:'Position on gradient',y:'Carrying capacity',cols:['x','K1','K2'],rows:X.map((x,i)=>[x,k1[i][1],k2[i][1]])};
  }else if(mode===1){
    const den=1-a12*a21;
    const n1=X.map(x=>{const kb=KB_A*(1-x/KB_B),kh=KH_A*(1+x/KH_B);return [x,(kb-a12*kh)/den];});
    const n2=X.map(x=>{const kb=KB_A*(1-x/KB_B),kh=KH_A*(1+x/KH_B);return [x,(kh-a21*kb)/den];});
    series=[{name:'N₁ (species 1)',color:'#b50246',data:n1},{name:'N₂ (species 2)',color:'#0e7c86',data:n2}];
    meta={x:'Position on gradient',y:'Equilibrium density',cols:['x','N1','N2'],rows:X.map((x,i)=>[x,n1[i][1],n2[i][1]])};
  }else if(mode===2){
    const ratio=X.map(x=>{const kb=KB_A*(1-x/KB_B),kh=KH_A*(1+x/KH_B);return [x,kb/kh];});
    const line=X.map(x=>[x,a12]);
    series=[{name:'K₁/K₂ ratio',color:'#b50246',data:ratio},{name:'α₁₂ (border)',color:'#e0662c',data:line,dash:true}];
    meta={x:'Position on gradient',y:'Ratio K₁/K₂',cols:['x','K1/K2','a12'],rows:X.map((x,i)=>[x,ratio[i][1],a12])};
  }else{
    const ratio=X.map(x=>{const kb=KB_A*(1-x/KB_B),kh=KH_A*(1+x/KH_B);return [x,kh/kb];});
    const line=X.map(x=>[x,a21]);
    series=[{name:'K₂/K₁ ratio',color:'#0e7c86',data:ratio},{name:'α₂₁ (border)',color:'#e0662c',data:line,dash:true}];
    meta={x:'Position on gradient',y:'Ratio K₂/K₁',cols:['x','K2/K1','a21'],rows:X.map((x,i)=>[x,ratio[i][1],a21])};
  }
  return {series,meta};
}
function plot(){const r=build();lastData=r;lastMeta=r.meta;Chart.draw(document.getElementById('chart'),r.series,{xlabel:r.meta.x,ylabel:r.meta.y});
  document.getElementById('legend').innerHTML=r.series.map(s=>`<span><i style="background:${s.color}"></i>${s.name}</span>`).join('');}
function sync(){document.querySelectorAll('.controls .val').forEach(v=>{const el=document.getElementById(v.id.slice(2));if(el)v.textContent=el.value;});}
const D={start:1,frc:10,end:1000,a12:0.8,a21:0.6};
function resetSim(){for(const k in D)document.getElementById(k).value=D[k];sync();plot();toast('Simulator reset');}
function downloadPNG(){const cv=document.getElementById('chart');if(!cv._series){toast('Plot first');return;}const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;const c=o.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,o.width,o.height);c.drawImage(cv,0,0);const a=document.createElement('a');a.download='competition-geographic.png';a.href=o.toDataURL();a.click();toast('PNG downloaded');}
function downloadCSV(){if(!lastData){toast('Plot first');return;}let csv=lastMeta.cols.join(',')+'\n'+lastMeta.rows.map(r=>r.join(',')).join('\n');dl(csv,'competition-geographic.csv','text/csv');toast('CSV downloaded');}
function saveRun(){const o={mode};document.querySelectorAll('.controls input').forEach(i=>o[i.id]=i.value);localStorage.setItem('comp_geo',JSON.stringify(o));toast('Run saved');}
function loadRun(){const s=localStorage.getItem('comp_geo');if(!s){toast('No saved run');return;}const o=JSON.parse(s);for(const k in o){const el=document.getElementById(k);if(el)el.value=o[k];}document.querySelector('.subtab[data-mode="'+o.mode+'"]').click();sync();toast('Run loaded');}
function dl(t,n,ty){const b=new Blob([t],{type:ty});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();URL.revokeObjectURL(a.href);}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);}
(function(){const cv=document.getElementById('chart');cv.addEventListener('pointermove',e=>{if(!cv._map)return;const r=cv.getBoundingClientRect();const mx=e.clientX-r.left,my=e.clientY-r.top;const {xmin,xmax,ymin,ymax,m,W,H}=cv._map;if(mx<m.l||mx>W-m.r||my<m.t||my>H-m.b)return;document.getElementById('rx').textContent=(xmin+(mx-m.l)/(W-m.l-m.r)*(xmax-xmin)).toFixed(1);document.getElementById('ry').textContent=(ymin+(H-m.b-my)/(H-m.b-m.t)*(ymax-ymin)).toFixed(2);});})();


sync();plot();window.addEventListener('resize',()=>{if(lastData)plot();});

/* ---- fullscreen (whole simulation box) ---- */
function toggleFS(){var el=document.getElementById('simbox');var fsEl=document.fullscreenElement||document.webkitFullscreenElement;if(!fsEl){var rq=el.requestFullscreen||el.webkitRequestFullscreen;if(rq)rq.call(el);}else{var ex=document.exitFullscreen||document.webkitExitFullscreen;if(ex)ex.call(document);}}
function _fsSync(){var b=document.getElementById('fsBtn');var on=document.fullscreenElement||document.webkitFullscreenElement;if(b)b.textContent=on?'✕':'⛶';setTimeout(function(){window.dispatchEvent(new Event('resize'));},70);}
document.addEventListener('fullscreenchange',_fsSync);
document.addEventListener('webkitfullscreenchange',_fsSync);
