// Year in footer
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

// Progress bar
const progress = document.getElementById('progress');
function onScroll(){
  if (!progress) return;
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  progress.style.transform = `scaleX(${Math.max(0, Math.min(1, scrolled))})`;
}
document.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Parallax orbs
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

// Back to top arrow
const toTop = document.getElementById('toTop');
function toggleTop(){
  if (!toTop) return;
  if (window.scrollY > 600) toTop.classList.add('show'); else toTop.classList.remove('show');
}
document.addEventListener('scroll', toggleTop, {passive:true});
toggleTop();
toTop?.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

// Active nav (multi-page)
(function(){
  const pg = document.body.getAttribute('data-page');
  if (!pg) return;
  document.querySelectorAll('.nav a[data-page]').forEach(a=>{
    a.classList.toggle('active', a.getAttribute('data-page') === pg);
  });
})();
