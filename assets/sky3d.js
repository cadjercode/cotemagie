/* Ciel étoilé 3D (thème B) — étoiles dorées autonomes + étoile filante. Fallback CSS si WebGL absent. */
(function(){
 var motionOK=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function starTexture(){
  var cv=document.createElement('canvas');cv.width=cv.height=64;var x=cv.getContext('2d');
  x.translate(32,32);x.fillStyle='#C69B3C';x.shadowColor='rgba(212,175,97,.9)';x.shadowBlur=10;x.beginPath();
  for(var i=0;i<8;i++){var lng=i%2===0?26:7;var a=i*Math.PI/4-Math.PI/2;x.lineTo(Math.cos(a)*lng,Math.sin(a)*lng);}
  x.closePath();x.fill();return new THREE.CanvasTexture(cv);
 }
 function cssFallback(){
  var box=document.getElementById('webgl');if(!box)return;
  for(var i=0;i<34;i++){var s=document.createElement('span');s.style.cssText='position:absolute;width:'+(4+Math.random()*7)+'px;height:'+(4+Math.random()*7)+'px;left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;background:#C69B3C;border-radius:50%;opacity:'+(0.2+Math.random()*0.4)+';box-shadow:0 0 6px #C69B3C';box.appendChild(s);}
 }
 function init(){
  var box=document.getElementById('webgl');if(!box)return;
  var renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});}catch(e){cssFallback();return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));box.appendChild(renderer.domElement);
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,1,0.1,100);cam.position.z=10;
  var tex=starTexture(),mobile=window.innerWidth<768,layers=[];
  [[mobile?40:80,.6,.95,1],[mobile?28:60,.4,.65,1.7],[mobile?20:42,.26,.45,2.6]].forEach(function(c,li){
   var n=c[0],pos=new Float32Array(n*3);
   for(var i=0;i<n;i++){pos[i*3]=(Math.random()-.5)*26;pos[i*3+1]=(Math.random()-.5)*16;pos[i*3+2]=-Math.random()*14;}
   var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
   var m=new THREE.PointsMaterial({size:c[1],map:tex,transparent:true,opacity:c[2],depthWrite:false,blending:THREE.AdditiveBlending,color:0xC69B3C});
   var p=new THREE.Points(g,m);scene.add(p);layers.push({pts:p,mat:m,geo:g,base:c[2],speed:c[3],li:li});
  });
  var shoot=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:0xD4AF61,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  shoot.scale.set(1.1,1.1,1);scene.add(shoot);var shootT=3.5,mx=0,my=0,cx=0,cy=0,drift=0;
  window.addEventListener('pointermove',function(e){mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;},{passive:true});
  window.addEventListener('scroll',function(){drift=scrollY*.0012;},{passive:true});
  function resize(){renderer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
  window.addEventListener('resize',resize);resize();var t=0;
  (function loop(){requestAnimationFrame(loop);t+=.016;
   layers.forEach(function(L){L.pts.rotation.y=t*.045*L.speed;L.pts.rotation.z=Math.sin(t*.07+L.li*2)*.04;L.pts.position.y=drift*L.speed;L.mat.opacity=L.base*(.65+.35*Math.sin(t*L.speed*1.3+L.li*2.1));var a=L.geo.attributes.position.array;for(var k=2;k<a.length;k+=3){a[k]+=.0065*L.speed;if(a[k]>2)a[k]=-14;}L.geo.attributes.position.needsUpdate=true;});
   cx+=(mx-cx)*.04;cy+=(my-cy)*.04;cam.position.x=cx*.8;cam.position.y=-cy*.55;cam.lookAt(0,0,-4);
   shootT+=.016;if(shootT>6){shootT=0;shoot.position.set(7+Math.random()*4,2.5+Math.random()*3,-2-Math.random()*3);shoot.material.opacity=1;}
   if(shoot.material.opacity>0){shoot.position.x-=.24;shoot.position.y-=.1;shoot.material.opacity-=.013;}
   renderer.render(scene,cam);
  })();
 }
 window.addEventListener('load',function(){if(motionOK&&window.THREE)init();else cssFallback();});
})();
