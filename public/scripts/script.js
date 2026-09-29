// ============================================
// 1. Scroll position save/restore
// ============================================

(function () {
  const KEY = 'scroll_' + window.location.pathname + window.location.search;

  // SAVE on link click
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (link && link.href && link.href.indexOf(window.location.origin) === 0) {
      sessionStorage.setItem(KEY, String(window.scrollY));
    }
  });

  // SAVE on page unload (back button, refresh)
  window.addEventListener('beforeunload', function () {
    sessionStorage.setItem(KEY, String(window.scrollY));
  });

  // RESTORE when page loads
  window.addEventListener('load', function () {
    const saved = sessionStorage.getItem(KEY);
    if (!saved) return;

    const y = parseInt(saved, 10);
    if (isNaN(y) || y <= 0) return;

    // Disable smooth scroll for instant jump
    document.documentElement.style.scrollBehavior = 'auto';

    // Try repeatedly — page height changes as content/images load
    let tries = 0;
    const id = setInterval(function () {
      window.scrollTo(0, y);
      if (++tries >= 20) clearInterval(id);
    }, 25);
  });
})();


// ============================================
// 2. Delete Confirmation Modal
// ============================================

(function () {
  const modal = document.getElementById('deleteModal');
  if (!modal) return;

  const cancelBtn = document.getElementById('modalCancel');
  const confirmBtn = document.getElementById('modalConfirm');
  let pendingForm = null;

  // Intercept any form with data-confirm-delete
  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (form.matches('form[data-confirm-delete]')) {
      e.preventDefault();
      pendingForm = form;
      modal.classList.add('active');
    }
  });

  // Cancel button
  cancelBtn.addEventListener('click', function () {
    modal.classList.remove('active');
    pendingForm = null;
  });

  // Confirm button — actually submit the form
  confirmBtn.addEventListener('click', function () {
    if (pendingForm) {
      pendingForm.submit();
    }
    modal.classList.remove('active');
  });

  // Click outside modal box → close
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('active');
      pendingForm = null;
    }
  });

  // Escape key → close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      pendingForm = null;
    }
  });
})();