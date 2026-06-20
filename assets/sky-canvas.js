/* ============================================================
   Côté Magie — Ciel étoilé Canvas 2D (remplace Three.js / sky3d.js)
   Étoiles dorées en profondeur 3D + parallaxe souris + scintillement
   + dérive au scroll + étoile filante. ~2 Ko, zéro dépendance.
   - S'adapte à la taille de son conteneur #webgl (hero ou plein écran)
   - Se met en pause quand le conteneur sort de l'écran (perf)
   - Respecte prefers-reduced-motion (rendu statique)
   ============================================================ */
(function(){
 var box=document.getElementById('webgl'); if(!box) return;
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 var cv=document.createElement('canvas'); var ctx=cv.getContext('2d'); box.appendChild(cv);
 var W,H,DPR=Math.min(window.devicePixelRatio||1,2);

 /* sprite étoile dorée (8 branches) pré-rendu une seule fois */
 var sprite=document.createElement('canvas'); sprite.width=sprite.height=64;
 (function(){var x=sprite.getContext('2d');x.translate(32,32);x.fillStyle='#C69B3C';
  x.shadowColor='rgba(212,175,97,.9)';x.shadowBlur=10;x.beginPath();
  for(var i=0;i<8;i++){var lng=i%2===0?26:7;var a=i*Math.PI/4-Math.PI/2;x.lineTo(Math.cos(a)*lng,Math.sin(a)*lng);}
  x.closePath();x.fill();})();

 var mobile=window.innerWidth<768, N=mobile?70:150, focal=300, stars=[];
 function rnd(a,b){return a+Math.random()*(b-a);}
 function spawn(s,fresh){s.x=rnd(-1.4,1.4);s.y=rnd(-1,1);s.z=fresh?rnd(.15,1):1;s.spd=rnd(.0009,.0027);s.base=rnd(.45,1);s.tw=rnd(0,6.28);}
 for(var i=0;i<N;i++){var s={};spawn(s,true);stars.push(s);}

 var mx=0,my=0,cx=0,cy=0,drift=0;
 window.addEventListener('pointermove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;},{passive:true});
 window.addEventListener('scroll',function(){drift=scrollY*.00018;},{passive:true});
 function resize(){var r=box.getBoundingClientRect();var w=r.width||innerWidth,h=r.height||innerHeight;
  W=cv.width=w*DPR;H=cv.height=h*DPR;cv.style.width=w+'px';cv.style.height=h+'px';}
 window.addEventListener('resize',resize);resize();

 /* pause du rendu quand le ciel n'est pas visible (ex. hero scrollé hors champ) */
 var inView=true;
 try{new IntersectionObserver(function(es){inView=es[0].isIntersecting;}).observe(box);}catch(e){}

 var shoot={active:false,t:4,o:0},t=0;
 function draw(animated){
  ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation='lighter';
  var hw=W/2, hh=H/2;
  for(var i=0;i<N;i++){var s=stars[i];
   if(animated){s.z-=s.spd; if(s.z<.05) spawn(s,false);}
   var px=(s.x/s.z)*focal*DPR + hw + cx*130*DPR;
   var py=((s.y/s.z))*focal*DPR + hh - cy*90*DPR + drift*focal*DPR;
   if(px<-60||px>W+60||py<-60||py>H+60) continue;
   var op=s.base*(animated?(.6+.4*Math.sin(t*1.6+s.tw)):.7)*Math.min(1,(1-s.z)*1.5+.18);
   if(op<=0) continue;
   ctx.globalAlpha=Math.max(0,Math.min(1,op));
   var sz=64*(.16/s.z)*DPR;
   ctx.drawImage(sprite, px-sz/2, py-sz/2, sz, sz);
  }
  if(animated){
   shoot.t+=.016;
   if(!shoot.active && shoot.t>6){shoot.active=true;shoot.t=0;shoot.x=W*rnd(.6,.95);shoot.y=H*rnd(.08,.38);shoot.o=1;}
   if(shoot.active){shoot.x-=W*.004;shoot.y+=H*.0016;shoot.o-=.012;
    if(shoot.o<=0)shoot.active=false;
    else{ctx.globalAlpha=shoot.o;var ss=64*.55*DPR;ctx.drawImage(sprite,shoot.x-ss/2,shoot.y-ss/2,ss,ss);}}
  }
  ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
 }
 if(reduce){draw(false);}
 else{(function loop(){requestAnimationFrame(loop);if(!inView)return;t+=.016;cx+=(mx-cx)*.04;cy+=(my-cy)*.04;draw(true);})();}
})();
