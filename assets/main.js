(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Subtle parallax glow movement
  const orb = document.querySelector('.glow-orb');
  if (!prefersReducedMotion && orb) {
    let raf = 0;
    window.addEventListener(
      'pointermove',
      (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const x = (e.clientX / window.innerWidth - 0.5) * 18;
          const y = (e.clientY / window.innerHeight - 0.5) * 14;
          orb.style.transform = `translate(calc(-40% + ${x}px), calc(-35% + ${y}px))`;
        });
      },
      { passive: true }
    );
  }

  // Theme
  const themeKey = 'pragyos.theme';
  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.dataset.theme = savedTheme;
  }

  const themeBtn = $('#themeToggle');
  const setThemeIcon = () => {
    if (!themeBtn) return;
    const isLight = document.documentElement.dataset.theme === 'light';
    themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    themeBtn.title = isLight ? 'Dark mode' : 'Light mode';
    themeBtn.innerHTML = isLight
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 13.2A7.5 7.5 0 0 1 10.8 3 8.5 8.5 0 1 0 21 13.2Z" stroke="currentColor" stroke-width="2"/></svg>';
  };
  setThemeIcon();

  themeBtn?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(themeKey, next);
    setThemeIcon();
  });

  // Mobile drawer
  const drawer = $('#mobileDrawer');
  const openBtn = $('#menuOpen');
  const closeBtn = $('#menuClose');
  const openDrawer = () => {
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  openBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  drawer?.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
  $$('#mobileDrawer a').forEach((a) => a.addEventListener('click', closeDrawer));

  // Active nav based on scroll
  const sections = $$('main section[id]');
  const navLinks = $$('a[data-nav]');
  const setActive = () => {
    const y = window.scrollY + 120;
    let currentId = sections[0]?.id;
    for (const s of sections) {
      if (s.offsetTop <= y) currentId = s.id;
    }
    navLinks.forEach((a) => {
      const target = a.getAttribute('href')?.slice(1);
      if (!target) return;
      if (target === currentId) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', () => requestAnimationFrame(setActive), { passive: true });
  setActive();

  // Smooth scrolling with header offset
  const offsetScroll = (hash) => {
    const id = hash?.replace('#', '');
    const el = id ? document.getElementById(id) : null;
    if (!el) return false;
    const navH = 76;
    const top = el.getBoundingClientRect().top + window.pageYOffset - navH - 10;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    return true;
  };
  document.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.length <= 1) return;
    e.preventDefault();
    history.pushState(null, '', href);
    offsetScroll(href);
  });
  if (location.hash) {
    setTimeout(() => offsetScroll(location.hash), 0);
  }

  // Reveal on scroll
  const revealEls = $$('.reveal');
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Count-up metrics
  const animateCount = (el) => {
    const target = Number(el.dataset.target || '0');
    const suffix = el.dataset.suffix || '';
    const duration = 900;
    const start = performance.now();
    const startVal = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(startVal + (target - startVal) * eased);
      el.textContent = `${val}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const metricNums = $$('[data-target]');
  if (!prefersReducedMotion && metricNums.length) {
    const metricIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            metricIO.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.5 }
    );
    metricNums.forEach((el) => metricIO.observe(el));
  } else {
    metricNums.forEach((el) => animateCount(el));
  }

  // FAQ accordion
  $$('.faq .item > button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.item');
      if (!item) return;
      const expanded = item.getAttribute('aria-expanded') === 'true';
      $$('.faq .item').forEach((i) => i.setAttribute('aria-expanded', 'false'));
      item.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });

  // Form handling: Formspree if configured, else mailto
  const toast = $('#toast');
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3200);
  };

  const form = $('#contactForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const honeypot = $('#company');
    if (honeypot && honeypot.value.trim() !== '') return; // spam

    const name = $('#name')?.value?.trim() || '';
    const email = $('#email')?.value?.trim() || '';
    const phone = $('#phone')?.value?.trim() || '';
    const service = $('#service')?.value || '';
    const message = $('#message')?.value?.trim() || '';

    if (!name || (!email && !phone) || message.length < 10) {
      showToast('Please add your name, email/phone, and a short message.');
      return;
    }

    const endpoint = form.dataset.formspree || '';

    // If endpoint is configured, POST JSON
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, email, phone, service, message })
        });
        if (!res.ok) throw new Error('Request not OK');
        form.reset();
        showToast('Thanks! We’ll reach out shortly.');
        return;
      } catch {
        // fall through to mailto
      }
    }

    const subject = encodeURIComponent(`Pragyos inquiry — ${service || 'Services'}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nMessage:\n${message}\n\n— Sent from pragyos.ai website`
    );
    const to = form.dataset.mailto || 'hello@pragyos.ai';
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
})();
