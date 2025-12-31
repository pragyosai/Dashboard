/* === Pragyos - Main JS === */
(function() {
  'use strict';

  // === Theme Toggle ===
  const themeToggle = document.getElementById('themeToggle');
  const stored = localStorage.getItem('theme');
  if (stored) document.documentElement.dataset.theme = stored;
  else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.dataset.theme = 'light';
  }
  themeToggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  // === Mobile Drawer ===
  const drawer = document.getElementById('mobileDrawer');
  const openBtn = document.getElementById('menuOpen');
  const closeBtn = document.getElementById('menuClose');
  openBtn?.addEventListener('click', () => { drawer?.classList.add('open'); drawer?.setAttribute('aria-hidden', 'false'); });
  closeBtn?.addEventListener('click', () => { drawer?.classList.remove('open'); drawer?.setAttribute('aria-hidden', 'true'); });
  drawer?.addEventListener('click', e => { if (e.target === drawer) { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); } });
  drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }));

  // === Active Nav ===
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = document.querySelectorAll('section[id]');
  function setActiveNav() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 150;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });
  setActiveNav();

  // === Reveal on Scroll ===
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => io.observe(el));

  // === Animated Counters ===
  const counters = document.querySelectorAll('[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const isDecimal = target % 1 !== 0;
        const duration = 2000;
        const startTime = performance.now();
        
        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;
          el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // === FAQ Accordion ===
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-q');
    btn?.addEventListener('click', () => {
      const isOpen = item.dataset.open === 'true';
      // Close all others
      faqItems.forEach(i => i.dataset.open = 'false');
      // Toggle current
      item.dataset.open = isOpen ? 'false' : 'true';
    });
  });

  // === Contact Form ===
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  function showToast(msg, duration = 4000) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const honeypot = form.querySelector('#company');
    if (honeypot?.value) return;
    
    const name = form.querySelector('#name')?.value.trim();
    const email = form.querySelector('#email')?.value.trim();
    const phone = form.querySelector('#phone')?.value.trim();
    const service = form.querySelector('#service')?.value;
    const message = form.querySelector('#message')?.value.trim();
    
    if (!name || !message) {
      showToast('Please fill in your name and message.');
      return;
    }
    
    const mailto = form.dataset.mailto || 'hello@pragyos.ai';
    const subject = encodeURIComponent('Website Inquiry from ' + name);
    const body = encodeURIComponent(
      'Name: ' + name + '\n' +
      'Email: ' + (email || 'N/A') + '\n' +
      'Phone: ' + (phone || 'N/A') + '\n' +
      'Service: ' + (service || 'Not specified') + '\n\n' +
      'Message:\n' + message
    );
    
    window.location.href = 'mailto:' + mailto + '?subject=' + subject + '&body=' + body;
    showToast('Opening your email client...');
    form.reset();
  });

  // === Smooth Scroll ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // === Parallax Effect for Hero ===
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      if (scroll < 800) {
        heroVisual.style.transform = 'translateY(' + (scroll * 0.15) + 'px)';
      }
    }, { passive: true });
  }

  // === Tag Hover Animation ===
  const tags = document.querySelectorAll('.tag');
  tags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      tag.style.transform = 'scale(1.05)';
    });
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = 'scale(1)';
    });
  });

})();
