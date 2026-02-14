/* ── Shared Navigation & Dynamic Interactions ──────────────────── */
(function () {
  'use strict';

  /* ── 1. Scroll progress bar ────────────────────────────────────── */
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; z-index: 200;
    height: 2px; width: 0%;
    background: linear-gradient(90deg, #00e676, #00ff88);
    box-shadow: 0 0 8px rgba(0,230,118,.6);
    transition: width .1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(progressBar);
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100;
    progressBar.style.width = pct + '%';
  }, { passive: true });

  /* ── 2. Enhanced scroll fade-in (spring easing, stagger by row) ── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        const delay = parseFloat(e.target.dataset.stagger || 0);
        setTimeout(() => e.target.classList.add('visible'), delay);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Auto-stagger grid children
  document.querySelectorAll('.features-grid, .cat-grid, .testi-grid, .values-grid, .team-grid, .dash-row').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.dataset.stagger = i * 80;
    });
  });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  /* ── 3. Cursor-following glow on hero ──────────────────────────── */
  const hero = document.querySelector('.hero');
  if (hero) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: absolute; width: 400px; height: 400px;
      border-radius: 50%; pointer-events: none;
      background: radial-gradient(circle, rgba(0,230,118,.07) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: left .6s cubic-bezier(.25,.46,.45,.94), top .6s cubic-bezier(.25,.46,.45,.94);
      z-index: 1;
    `;
    hero.style.position = 'relative';
    hero.appendChild(glow);
    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      glow.style.left = (e.clientX - rect.left) + 'px';
      glow.style.top  = (e.clientY - rect.top)  + 'px';
    });
    hero.addEventListener('mouseleave', () => {
      glow.style.left = '50%';
      glow.style.top  = '40%';
    });
  }

  /* ── 4. Magnetic button effect ─────────────────────────────────── */
  document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta, .appstore-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r   = btn.getBoundingClientRect();
      const dx  = e.clientX - (r.left + r.width  / 2);
      const dy  = e.clientY - (r.top  + r.height / 2);
      btn.style.transform = `translate(${dx * .15}px, ${dy * .2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ── 5. Feature card tilt on hover ─────────────────────────────── */
  document.querySelectorAll('.feat-card, .value-card, .testi-card, .cat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - .5;
      const y  = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
      card.style.boxShadow = `${-x * 10}px ${-y * 10}px 30px rgba(0,230,118,.08)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.transition = 'transform .4s cubic-bezier(.25,.46,.45,.94), box-shadow .4s ease';
      setTimeout(() => { card.style.transition = ''; }, 400);
    });
  });

  /* ── 6. Phone mockup parallax on scroll ────────────────────────── */
  const phoneWraps = document.querySelectorAll('.phone-wrap, .demo-phone-large');
  if (phoneWraps.length) {
    window.addEventListener('scroll', () => {
      phoneWraps.forEach(pw => {
        const rect  = pw.getBoundingClientRect();
        const center = window.innerHeight / 2;
        const offset = (rect.top + rect.height / 2 - center) * 0.04;
        pw.style.transform = `translateY(${offset}px)`;
      });
    }, { passive: true });
  }

  /* ── 7. Floating phone labels continuous drift ──────────────────── */
  document.querySelectorAll('.phone-float').forEach((el, i) => {
    let t = i * 1.5;
    const speed = .4 + i * .15;
    const ampX  = 4 + i * 2;
    const ampY  = 6 + i * 2;
    function drift() {
      t += 0.012 * speed;
      const x = Math.sin(t) * ampX;
      const y = Math.cos(t * 0.8) * ampY;
      el.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(drift);
    }
    drift();
  });

  /* ── 8. Active nav link highlight on scroll ─────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === `#${current}`);
    });
  }, { passive: true });

  /* ── 9. Smooth scroll for anchor links ──────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 10. Features TOC active state ─────────────────────────────── */
  const tocLinks = document.querySelectorAll('.toc-link[href^="#"]');
  if (tocLinks.length) {
    const tocObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const id   = e.target.getAttribute('id');
        const link = document.querySelector(`.toc-link[href="#${id}"]`);
        if (link) link.classList.toggle('active', e.isIntersecting);
      });
    }, { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' });
    document.querySelectorAll('.feature-section[id]').forEach(s => tocObserver.observe(s));
  }

  /* ── 11. Ripple effect on primary buttons ───────────────────────── */
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', e => {
      const r    = btn.getBoundingClientRect();
      const x    = e.clientX - r.left;
      const y    = e.clientY - r.top;
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(0,0,0,.2);
        width: 0; height: 0;
        left: ${x}px; top: ${y}px;
        transform: translate(-50%,-50%);
        animation: rippleAnim .5s ease forwards;
        pointer-events: none;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  // Ripple keyframe
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes rippleAnim {
        to { width: 200px; height: 200px; opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

})();
