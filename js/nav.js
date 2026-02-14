/* ── Shared Navigation & Scroll Utilities ──────────────────────── */
(function () {
  'use strict';

  // Scroll-triggered fade-in
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Active nav link highlight based on scroll
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === `#${current}`);
    });
  }, { passive: true });

  // Smooth scroll for same-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Features page: TOC active state (sticky TOC)
  const tocLinks = document.querySelectorAll('.toc-link[href^="#"]');
  if (tocLinks.length) {
    const tocObserver = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const id = e.target.getAttribute('id');
          const link = document.querySelector(`.toc-link[href="#${id}"]`);
          if (link) link.classList.toggle('active', e.isIntersecting);
        });
      },
      { threshold: 0.4, rootMargin: '-80px 0px -50% 0px' }
    );
    document.querySelectorAll('.feature-section[id]').forEach(s => tocObserver.observe(s));
  }
})();
