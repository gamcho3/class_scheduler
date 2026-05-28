(function () {
  const sideMenu    = document.getElementById('sideMenu');
  const sideOverlay = document.getElementById('sideOverlay');

  function openMenu() {
    sideMenu.classList.add('open');
    sideOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    sideMenu.classList.remove('open');
    sideOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('hamburgerBtn').addEventListener('click', openMenu);
  document.getElementById('sideCloseBtn').addEventListener('click', closeMenu);
  sideOverlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.side-menu-item[data-href]').forEach(item => {
    item.addEventListener('click', () => {
      window.location.href = item.dataset.href;
    });
  });
})();
