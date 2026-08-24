/* ============================================================
   Côté Magie — Gallery Lightbox (vanilla JS)
   ============================================================ */
(function () {
  'use strict';

  /* ---- Lazy loading thumbnails ---- */
  var observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var img = e.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        img.addEventListener('load', function () { img.classList.add('loaded'); });
        observer.unobserve(img);
      });
    }, { rootMargin: '200px' });
  }

  document.querySelectorAll('.gallery-item img[data-src]').forEach(function (img) {
    if (observer) {
      observer.observe(img);
    } else {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
      img.classList.add('loaded');
    }
  });

  /* ---- Video modal (RGPD-friendly: no YouTube request until click) ---- */
  var vm = document.createElement('div');
  vm.className = 'video-modal';
  vm.setAttribute('role', 'dialog');
  vm.setAttribute('aria-modal', 'true');
  vm.setAttribute('aria-label', 'Vidéo');
  vm.innerHTML = '<div class="video-modal-inner"><button class="vm-close" aria-label="Fermer">&times;</button></div>';
  document.body.appendChild(vm);

  var vmInner = vm.querySelector('.video-modal-inner');

  function openVideo(ytId, isLandscape) {
    vmInner.classList.toggle('landscape', !!isLandscape);
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + ytId + '?autoplay=1&rel=0';
    iframe.setAttribute('allow', 'autoplay; encrypted-media');
    iframe.setAttribute('allowfullscreen', '');
    iframe.title = 'Vidéo Côté Magie';
    vmInner.appendChild(iframe);
    vm.classList.add('open');
    document.body.style.overflow = 'hidden';
    vm.querySelector('.vm-close').focus();
  }

  function closeVideo() {
    vm.classList.remove('open');
    document.body.style.overflow = '';
    var iframe = vmInner.querySelector('iframe');
    if (iframe) iframe.remove();
  }

  vm.querySelector('.vm-close').addEventListener('click', closeVideo);
  vm.addEventListener('click', function (e) { if (e.target === vm) closeVideo(); });

  document.querySelectorAll('.gallery-item.video-item').forEach(function (el) {
    el.addEventListener('click', function () {
      var ytId = el.getAttribute('data-youtube');
      if (ytId && ytId.indexOf('YOUTUBE_ID') === -1) openVideo(ytId, el.classList.contains('landscape'));
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var ytId = el.getAttribute('data-youtube');
        if (ytId && ytId.indexOf('YOUTUBE_ID') === -1) openVideo(ytId, el.classList.contains('landscape'));
      }
    });
  });

  /* ---- Build lightbox DOM ---- */
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Galerie photo plein écran');
  lb.innerHTML =
    '<button class="lb-close" aria-label="Fermer">&times;</button>' +
    '<button class="lb-prev" aria-label="Photo précédente">&#8249;</button>' +
    '<button class="lb-next" aria-label="Photo suivante">&#8250;</button>' +
    '<div class="lightbox-img-wrap"><img src="" alt="" decoding="async"></div>' +
    '<div class="lb-counter"></div>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector('.lightbox-img-wrap img');
  var lbCounter = lb.querySelector('.lb-counter');
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item:not(.video-item)'));
  var current = 0;
  var touchStartX = 0;
  var touchStartY = 0;
  var lastFocus = null;

  function show(index) {
    current = index;
    var item = items[index];
    var full = item.getAttribute('data-full');
    var alt = item.querySelector('img').getAttribute('alt') || '';
    lbImg.classList.remove('lb-loaded');
    lbImg.alt = alt;
    lbImg.src = full;
    lbImg.onload = function () { lbImg.classList.add('lb-loaded'); };
    lbCounter.textContent = (index + 1) + ' / ' + items.length;
  }

  function openLb(index) {
    lastFocus = document.activeElement;
    show(index);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function prev() { show(current <= 0 ? items.length - 1 : current - 1); }
  function next() { show(current >= items.length - 1 ? 0 : current + 1); }

  /* ---- Event listeners ---- */
  items.forEach(function (item, i) {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('click', function () { openLb(i); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
    });
  });

  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', prev);
  lb.querySelector('.lb-next').addEventListener('click', next);

  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target === lb.querySelector('.lightbox-img-wrap')) closeLb();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && vm.classList.contains('open')) { closeVideo(); return; }
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  });

  /* ---- Swipe tactile ---- */
  lb.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx > 0) prev(); else next();
  }, { passive: true });

  /* ---- Trap focus inside lightbox ---- */
  lb.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = lb.querySelectorAll('button');
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
})();
