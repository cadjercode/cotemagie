/* Interactions partagées des pages prestations : nav mobile, reveal, ciel CSS (thème A) */
(function(){
 var motionOK=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 /* Ciel étoilé CSS (présent uniquement sur le thème A) */
 var sky=document.getElementById('sky');
 if(sky){
  for(var i=0;i<40;i++){
   var st=document.createElement('span');st.className='star';
   st.style.left=(Math.random()*100)+'%';st.style.top=(Math.random()*100)+'%';
   st.style.setProperty('--s',(5+Math.random()*9)+'px');
   st.style.setProperty('--d',(2.4+Math.random()*4)+'s');
   st.style.setProperty('--dl',(Math.random()*6)+'s');
   st.style.setProperty('--o',(0.35+Math.random()*0.5));
   st.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1c.6 4.8 2 8.4 4.2 9.8C18.3 12 21 12 23 12c-2 0-4.7 0-6.8 1.2C14 14.6 12.6 18.2 12 23c-.6-4.8-2-8.4-4.2-9.8C5.7 12 3 12 1 12c2 0 4.7 0 6.8-1.2C10 9.4 11.4 5.8 12 1Z"/></svg>';
   sky.appendChild(st);
  }
 }
 /* Reveal au scroll */
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
 document.querySelectorAll('.rv').forEach(function(s){io.observe(s);});
 /* Menu mobile */
 var burger=document.getElementById('navBurger'),navMobile=document.getElementById('navMobile'),navOverlay=document.getElementById('navOverlay');
 if(burger){
  function closeNav(){burger.classList.remove('open');navMobile.classList.remove('open');navOverlay.classList.remove('open');burger.setAttribute('aria-expanded','false');}
  burger.addEventListener('click',function(){var o=!navMobile.classList.contains('open');navMobile.classList.toggle('open',o);burger.classList.toggle('open',o);navOverlay.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);});
  navOverlay.addEventListener('click',closeNav);
  navMobile.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeNav);});
 }
})();
