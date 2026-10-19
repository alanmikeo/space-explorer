(() => {
 'use strict';
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const menu = document.querySelector('.desktop-nav');
 const toggle = document.querySelector('.menu-toggle');
 toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(expanded)); menu.classList.toggle('open', expanded);
 });
 menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }));
 document.addEventListener('keydown', e => {if(e.key === 'Escape'){document.querySelector('.language').open = false;menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');}});
 document.addEventListener('click', e => { const language = document.querySelector('.language'); if(!language.contains(e.target)) language.open = false; });

 // Keep the initial transparent navigation, hide it going down, reveal it going up.
 const header = document.querySelector('.header');
 let previousY = Math.max(0,window.scrollY), distance = 0, direction = 0, scrollQueued = false;
 const updateHeader = () => {
  const current = Math.max(0,window.scrollY), delta = current - previousY;
  const nextDirection = Math.sign(delta);
  if(nextDirection && nextDirection !== direction){distance=0;direction=nextDirection;}
  distance += Math.abs(delta);
  header.classList.toggle('header-floating',current>90);
  const keepOpen = document.querySelector('.language').open || toggle.getAttribute('aria-expanded')==='true' || header.querySelector(':focus-visible');
  if(current<90 || keepOpen) header.classList.remove('header-hidden');
  else if(distance>=12) header.classList.toggle('header-hidden',direction>0);
  previousY=current;scrollQueued=false;
 };
 window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateHeader);}},{passive:true});
 header.addEventListener('focusin',()=>header.classList.remove('header-hidden'));
 updateHeader();

 const gallery=document.querySelector('.gallery-track');
 document.querySelectorAll('[data-gallery-direction]').forEach(button=>button.addEventListener('click',()=>{
  const step=gallery.querySelector('.gallery-slide').getBoundingClientRect().width+22;
  const rtl=document.documentElement.dir==='rtl';
  gallery.scrollBy({left:Number(button.dataset.galleryDirection)*step*(rtl?-1:1),behavior:reduced?'instant':'smooth'});
 }));

 if ('IntersectionObserver' in window && !reduced) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
   if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }), {threshold:0.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  document.documentElement.classList.add('js-motion');
 }

 const planets = JSON.parse(document.querySelector('#planet-data').textContent);
 const image = document.querySelector('#planet-image');
 const planetHeading = document.querySelector('#planet-name');
 const planetDescription = document.querySelector('#planet-description');
 const planetNumber = document.querySelector('#planet-number');
 const tabs = [...document.querySelectorAll('.planet-tab')];
 let imageRequest = 0;
 const activate = (index, focus = false) => {
  tabs.forEach((tab,i) => {tab.setAttribute('aria-selected',String(i === index));tab.tabIndex = i === index ? 0 : -1;});
  const p = planets[index];
  planetHeading.textContent = p.name; planetDescription.textContent = p.description;
  planetNumber.textContent = `0${index+1} / 05`;
  document.querySelector('#planet-panel').setAttribute('aria-labelledby',tabs[index].id);
  // Load only the requested scene. The request counter prevents stale image swaps.
  const request = ++imageRequest;
  const next = new Image(); next.onload = () => {if(request === imageRequest){image.src = p.image; image.alt = `${p.name} — ${p.description}`;}};
  next.src = p.image;
  if (focus) tabs[index].focus();
 };
 tabs.forEach((tab,index) => {
  tab.addEventListener('click', () => activate(index));
  tab.addEventListener('keydown', e => {
   let next = index; const rtl = document.documentElement.dir === 'rtl';
   if(e.key === 'ArrowRight') next = (index + (rtl ? -1 : 1) + tabs.length) % tabs.length;
   else if(e.key === 'ArrowLeft') next = (index + (rtl ? 1 : -1) + tabs.length) % tabs.length;
   else if(e.key === 'ArrowDown') next = (index+1)%tabs.length;
   else if(e.key === 'ArrowUp') next = (index-1+tabs.length)%tabs.length;
   else if(e.key === 'Home') next = 0;
   else if(e.key === 'End') next = tabs.length-1;
   else return;
   e.preventDefault(); activate(next,true);
  });
 });

 const dialog = document.querySelector('#trailer-dialog');
 const video = dialog.querySelector('video');
 let opener;
 document.querySelectorAll('[data-open-trailer]').forEach(button => button.addEventListener('click',() => {
  opener = button;
  if (!video.src) {video.src = video.dataset.src;video.load();}
  dialog.showModal(); document.body.classList.add('no-scroll');
  video.play().catch(() => {});
 }));
 dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', e => {if(e.target === dialog){const r=dialog.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dialog.close();}});
 dialog.addEventListener('close', () => {video.pause();document.body.classList.remove('no-scroll');if(opener)opener.focus();});
 video.addEventListener('error', () => {dialog.querySelector('.video-error').hidden = false;});
})();
