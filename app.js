// mark active nav
(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a=>{
    const href = a.getAttribute('href');
    if((path === '' && href === 'index.html') || href === path){ a.classList.add('active'); }
  });
})();

// current year
(function(){
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();
})();
