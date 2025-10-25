(function(){
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const menuBtn = document.getElementById('menuBtn');
  const mnav = document.getElementById('mnav');
  if (menuBtn && mnav) {
    menuBtn.addEventListener('click', () => {
      const open = mnav.hasAttribute('hidden') ? false : true;
      if (open) {
        mnav.setAttribute('hidden','');
        menuBtn.setAttribute('aria-expanded','false');
      } else {
        mnav.removeAttribute('hidden');
        menuBtn.setAttribute('aria-expanded','true');
      }
    });
  }
})();
