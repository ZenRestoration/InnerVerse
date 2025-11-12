// Year in footer (if present)
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

// Progress bar (on long pages)
const progress = document.getElementById('progress');
function onScroll(){
  if (!progress) return;
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  progress.style.transform = `scaleX(${Math.max(0, Math.min(1, scrolled))})`;
}
document.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Parallax orbs (subtle)
const orbA = document.getElementById('orbA');
const orbB = document.getElementById('orbB');
const orbC = document.getElementById('orbC');
document.addEventListener('scroll', ()=>{
  const y = window.scrollY || 0;
  if (orbA) orbA.style.transform = `translateY(${y*0.06}px)`;
  if (orbB) orbB.style.transform = `translateY(${y*-0.04}px)`;
  if (orbC) orbC.style.transform = `translateY(${y*0.03}px)`;
}, {passive:true});

// Reveal on view
const reveals = document.querySelectorAll('.reveal');
if (reveals.length){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); }
    })
  }, {threshold:.12});
  reveals.forEach(el=>io.observe(el));
}

// Scrollspy (only for same-page anchors; on multi-page we highlight via body data-page)
const links = [...document.querySelectorAll('.nav a[href^="#"]')];
const sections = [...document.querySelectorAll('section, .hero')].filter(s => s.id);
if (links.length && sections.length){
  const spy = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const id = e.target.id;
        links.forEach(a=>a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    });
  }, {rootMargin:"-50% 0px -45% 0px", threshold:0});
  sections.forEach(s=> spy.observe(s));
}

// Back to top arrow
const toTop = document.getElementById('toTop');
function toggleTop(){
  if (!toTop) return;
  if (window.scrollY > 600) toTop.classList.add('show'); else toTop.classList.remove('show');
}
document.addEventListener('scroll', toggleTop, {passive:true});
toggleTop();
toTop?.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

// Active nav for multi-page
(function(){
  const pg = document.body.getAttribute('data-page');
  if (!pg) return;
  document.querySelectorAll('.nav a[data-page]').forEach(a=>{
    a.classList.toggle('active', a.getAttribute('data-page') === pg);
  });
})();
