/* ═══════════════════════════════════════════════════════════════
   SPECTRA GROUP — APP.JS
   Single script for all 4 pages (index / services / portfolio /
   contact). Every block below checks for its own elements before
   doing anything, so it's always safe to load this same file
   everywhere — sections simply no-op on pages that don't use them.
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════
   1. SHARED CHROME — runs on every page
═══════════════════════════════════════════════════ */

/* ── NAVBAR SCROLL EFFECT ── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── HAMBURGER MENU ── */
(function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ── ACTIVE NAV LINK HIGHLIGHT ── */
(function initActiveNav() {
  const links   = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const current = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === current || (current === '' && href === 'index.html'));
  });
})();

/* ── SMOOTH ANCHOR SCROLL (in-page links, e.g. footer) ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── PAGE HERO SLIDESHOW (services.html / portfolio.html) ── */
(function initPageHeroSlideshow() {
  const slides = document.querySelectorAll('.page-hero-slide');
  if (!slides.length) return;
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove('active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('active');
  }, 5000);
})();


/* ═══════════════════════════════════════════════════
   2. VIEW MORE / READ MORE — runs on every page
   Shared collapsible copy behaviour for service cards
   and long homepage paragraphs.
═══════════════════════════════════════════════════ */
(function initViewMore() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.scc-view-btn, .read-more-btn');
    if (!btn) return;

    const targetId = btn.dataset.target;
    const panel = targetId ? document.getElementById(targetId) : btn.previousElementSibling;
    if (!panel) return;

    const expanded = panel.classList.toggle('expanded');
    btn.classList.toggle('expanded', expanded);

    const label = btn.querySelector('.scc-view-label, .read-more-label');
    if (label) label.textContent = expanded ? 'View less' : 'View more';
  });
})();


/* ═══════════════════════════════════════════════════
   PAGE TRANSITION — hexagon preloader, runs on every page
═══════════════════════════════════════════════════ */

/* ── ENTRANCE: fades the hexagon out once the page is ready.
   Homepage gets the full branded intro; inner pages release
   quickly so the hexagon reads as a brief page transition
   rather than a full loading screen every click. ── */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  const isHome = !!document.getElementById('hero');

  document.body.style.overflow = 'hidden';
  function release() {
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
  }
  // DOMContentLoaded fires as soon as the HTML is parsed — it does NOT
  // wait on slow/blocked external resources (Google Fonts, images), so
  // the page can't get stuck behind the hexagon the way `load` could.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(release, isHome ? 900 : 250));
  } else {
    setTimeout(release, isHome ? 900 : 250);
  }
  setTimeout(release, isHome ? 2000 : 800); // hard safety net no matter what
})();

/* ── EXIT: same hexagon fades back in before navigating to
   another page on the site, so the logo-in-hexagon graphic
   is what carries you between pages, not just on first load. ── */
(function initPageExitTransition() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  const internalPages = ['index.html', 'services.html', 'portfolio.html', 'contact.html', ''];

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || link.target === '_blank') return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) return;
    const page = href.split('#')[0].split('?')[0];
    if (!internalPages.includes(page)) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      preloader.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => { window.location.href = href; }, 450);
    });
  });
})();

/* ── HERO COLOUR SLIDESHOW (cycles the 6 Spectra colours + matching copy) ── */
(function initHeroSlideshow() {
  const hero   = document.getElementById('hero');
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-slide-dots .dot');
  const headlineEl = document.getElementById('heroHeadline');
  const subEl       = document.getElementById('heroSub');
  const ctaEl        = document.getElementById('heroPrimaryCta');
  if (!slides.length) return;

  const COPY = [
    { // 0 — Talent (red)
      headline: "We're Building Africa's<br/>Next Generation of Brands,<br/>Creators, and Leaders.",
      sub: "Every legend starts unmanaged. We find them first — and give them the structure to last.",
      cta: 'Meet Our Talent', href: '#dd-talent'
    },
    { // 1 — Media (orange)
      headline: 'Your Story Deserves<br/>More Than a Phone Camera<br/>and a Prayer.',
      sub: 'Cinematic production that turns everyday brands into unforgettable ones.',
      cta: 'See Media Production', href: '#dd-media'
    },
    { // 2 — Events (gold)
      headline: 'Some Rooms Change<br/>Careers. We Build<br/>Those Rooms.',
      sub: 'Experiences and events engineered to move markets, not just crowds.',
      cta: 'Explore Events & Experiences', href: '#dd-entertainment'
    },
    { // 3 — Web (teal)
      headline: 'A Brand Is Only<br/>As Strong As The Platform<br/>Carrying It.',
      sub: 'Web and AI infrastructure built to convert — not just exist.',
      cta: 'See Web & AI Solutions', href: '#dd-web'
    },
    { // 4 — Motion (blue)
      headline: 'Every Frame Is<br/>a Decision. We Make<br/>the Right Ones.',
      sub: "Motion and film production with a director's eye for every detail.",
      cta: 'Explore Motion Studio', href: 'services.html#motion'
    },
    { // 5 — Business (violet)
      headline: 'Talent Gets You Noticed.<br/>Structure Keeps<br/>You Standing.',
      sub: 'Business strategy and management for founders ready to scale.',
      cta: 'See Business Strategy', href: '#dd-business'
    }
  ];

  let current = 0;
  const DELAY = 5200;

  function applyCopy(idx) {
    const c = COPY[idx];
    if (!c || !headlineEl) return;
    [headlineEl, subEl, ctaEl].forEach(el => el && el.classList.add('crossfade-out'));
    setTimeout(() => {
      headlineEl.innerHTML = c.headline;
      subEl.textContent = c.sub;
      ctaEl.textContent = c.cta;
      ctaEl.setAttribute('href', c.href);
      [headlineEl, subEl, ctaEl].forEach(el => el && el.classList.remove('crossfade-out'));
    }, 320);
  }

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
    applyCopy(current);
    hero?.dispatchEvent(new CustomEvent('spectra:colorslide', { detail: { index: current } }));
  }
  function next() { goTo(current + 1); }
  function start() { return setInterval(next, DELAY); }

  let timer = start();
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(parseInt(dot.dataset.index, 10));
      timer = start();
    });
  });
})();

/* ── PRISM PROGRESS INDICATOR ── */
(function initPrismProgress() {
  const pp       = document.getElementById('prismProgress');
  const ppLines  = document.querySelectorAll('.pp-line');
  const ppLabels = document.querySelectorAll('.pp-labels span');
  if (!pp) return;

  const divisionSections = {
    media:         document.querySelectorAll('[data-div="media"]'),
    web:           document.querySelectorAll('[data-div="web"]'),
    entertainment: document.querySelectorAll('[data-div="entertainment"]'),
    talent:        document.querySelectorAll('[data-div="talent"]'),
    business:      document.querySelectorAll('[data-div="business"]'),
  };

  function getActiveDivision() {
    const mid = window.scrollY + window.innerHeight / 2;
    for (const [div, sections] of Object.entries(divisionSections)) {
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        const top  = rect.top + window.scrollY;
        const bot  = top + rect.height;
        if (mid >= top && mid <= bot) return div;
      }
    }
    return null;
  }

  function update() {
    pp.classList.toggle('visible', window.scrollY > 300);
    const active = getActiveDivision();
    ppLines.forEach(line => line.classList.toggle('active', line.dataset.div === active));
    ppLabels.forEach(label => label.classList.toggle('active', label.dataset.div === active));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── SCROLL REVEAL (homepage sections) ── */
(function initReveal() {
  const sections = document.querySelectorAll('.reveal-section');
  if (!sections.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  sections.forEach(s => observer.observe(s));
})();

/* ── COUNTER ANIMATION ── */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else { el.classList.add('done'); setTimeout(() => el.classList.remove('done'), 1400); }
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
})();

/* ── PROCESS LINE ANIMATION ── */
(function initProcessLine() {
  const processSection = document.querySelector('.process');
  if (!processSection) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { processSection.classList.add('counted'); observer.unobserve(processSection); }
    });
  }, { threshold: 0.3 });
  observer.observe(processSection);
})();

/* ── ECOSYSTEM TILE TOUCH SUPPORT ── */
(function initEcoTiles() {
  const tiles = document.querySelectorAll('.eco-tile');
  if (!tiles.length) return;
  tiles.forEach(tile => {
    let revealed = false;
    tile.addEventListener('click', (e) => {
      if (window.matchMedia('(hover: none)').matches && !revealed) {
        e.preventDefault();
        revealed = true;
      }
    });
  });
})();

/* ── PARALLAX — Vision section ── */
(function initParallax() {
  const visionBg = document.querySelector('.vision-bg');
  if (!visionBg) return;
  function onScroll() {
    const rect = visionBg.parentElement.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const progress = -rect.top / (rect.height + window.innerHeight);
    visionBg.style.transform = `scale(1.08) translateY(${progress * 30}px)`;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ═══════════════════════════════════════════════════
   4. SERVICES PAGE — services.html
═══════════════════════════════════════════════════ */

/* ── STUDIO BAND SLIDESHOWS (one per studio) ── */
(function initStudioSlideshows() {
  document.querySelectorAll('.studio-hero-band').forEach(band => {
    const slides = band.querySelectorAll('.studio-slide');
    if (slides.length < 2) return;
    let idx = 0;
    setInterval(() => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 6000);
  });
})();

/* ── STICKY STUDIO NAV ── */
(function initStickyNav() {
  const stickyNav = document.getElementById('stickyNav');
  if (!stickyNav) return;

  const pageHero = document.querySelector('.page-hero');
  const items    = stickyNav.querySelectorAll('.ssn-item');
  const studios  = document.querySelectorAll('.studio-section[id]');

  function getActiveStudio() {
    const mid = window.scrollY + window.innerHeight * 0.4;
    let active = null;
    studios.forEach(el => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (mid >= top) active = el.id;
    });
    return active;
  }

  function onScroll() {
    if (pageHero) {
      stickyNav.classList.toggle('visible', pageHero.getBoundingClientRect().bottom < 0);
    } else {
      stickyNav.classList.toggle('visible', window.scrollY > 300);
    }
    const active = getActiveStudio();
    items.forEach(item => item.classList.toggle('active', item.dataset.target === active));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── HASH SCROLL (from homepage links, e.g. index.html#web → services.html#web) ── */
(function handleServicesHash() {
  const hash = window.location.hash;
  if (!hash) return;
  setTimeout(() => {
    const el = document.querySelector(hash);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
  }, 600);
})();

/* ── SCROLL REVEAL FOR STUDIO SECTIONS ── */
(function initStudioReveal() {
  const bands = document.querySelectorAll('.studio-hero-band, .studio-cards-section');
  if (!bands.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
  bands.forEach(b => {
    b.style.cssText += 'opacity:0;transform:translateY(32px);transition:opacity 0.9s cubic-bezier(0.16,1,0.3,1),transform 0.9s cubic-bezier(0.16,1,0.3,1);';
    observer.observe(b);
  });
})();

/* ── SERVICE CARD KEYBOARD/SCREEN-READER SUPPORT ── */
(function initCardAccessibility() {
  document.querySelectorAll('.svc-conv-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'article');
  });
})();

/* ── WHATSAPP ENQUIRY (service card "Enquire on WhatsApp" buttons) ── */
window.openOverlay = function (studio, card) {
  const messages = {
    media_photography:  "Hi Spectra, I'm interested in Photography & Visual Campaign services.",
    media_videography:  "Hi Spectra, I'm interested in Videography & Brand Film production.",
    media_graphics:     "Hi Spectra, I'm interested in Graphic Design & Visual Identity.",
    media_content:      "Hi Spectra, I'm interested in Digital Content & Social Media management.",
    media_livestream:   "Hi Spectra, I'm interested in Livestream Production.",
    entertainment_corporate:  "Hi Spectra, I'm interested in planning a Corporate Event or Conference.",
    entertainment_concerts:   "Hi Spectra, I'm interested in Concert or Live Show production.",
    entertainment_activation: "Hi Spectra, I'm interested in a Brand Activation or Experiential event.",
    talent_representation: "Hi Spectra, I'm interested in Talent Representation & Management.",
    talent_brand_dev:      "Hi Spectra, I'm interested in Personal Brand Development.",
    'talent_brand-deals':  "Hi Spectra, I'm interested in Brand Deals & Partnerships.",
    talent_crisis:         "Hi Spectra, I need help with Crisis & Reputation Management.",
    business_brand_strategy: "Hi Spectra, I'm interested in Brand Development & Positioning.",
    business_pr:              "Hi Spectra, I'm interested in Public Relations & Media Outreach.",
    business_marketing:       "Hi Spectra, I'm interested in Marketing Strategy & Campaign Development.",
    web_websites:      "Hi Spectra, I need a business website.",
    web_ecommerce:     "Hi Spectra, I need an e-commerce platform.",
    'web_mobile-apps': "Hi Spectra, I'm interested in Mobile App Development.",
    web_ai:            "Hi Spectra, I'm interested in AI Integration & Automation.",
    motion_motion_graphics: "Hi Spectra, I'm interested in Motion Graphics & Visual Effects.",
    'motion_2d-animation':  "Hi Spectra, I'm interested in 2D Animation & Explainer Videos.",
    motion_3d:               "Hi Spectra, I'm interested in 3D Modelling & Visualisation.",
  };

  const key    = `${studio}_${card}`.replace(/-/g, '_');
  const altKey = `${studio}_${card}`;
  const msg = messages[key] || messages[altKey] ||
    `Hi Spectra, I'm interested in your ${card} services from the ${studio} studio.`;
  const url = `https://wa.me/2347053815985?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};


/* ═══════════════════════════════════════════════════
   5. PORTFOLIO PAGE — portfolio.html
═══════════════════════════════════════════════════ */

/* ── FILTER SYSTEM ── */
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  if (!btns.length) return;

  const urlParams = new URLSearchParams(window.location.search);
  const preFilter = urlParams.get('filter');
  if (preFilter) applyFilter(preFilter);

  btns.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));

  function applyFilter(filter) {
    btns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    items.forEach(item => {
      const match = filter === 'all' || item.dataset.filter === filter;
      item.classList.toggle('hidden', !match);
      if (match) {
        item.style.animation = 'none';
        item.offsetHeight; // reflow to restart animation
        item.style.animation = '';
      }
    });
  }
})();

/* ── LIGHTBOX ── */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const backdrop = document.getElementById('lightboxBackdrop');
  const closeBtn = document.getElementById('lightboxClose');
  const items    = document.querySelectorAll('.gallery-item');
  if (!lightbox) return;

  const tagClasses = {
    media:    'media-tag',
    events:   'events-tag',
    talent:   '', // inline styled in HTML already
    business: 'business-tag',
    web:      'web-tag',
    motion:   'motion-tag',
  };

  function openLightbox(item) {
    const bgUrl     = item.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
    const title     = item.dataset.title     || '';
    const client    = item.dataset.client    || '';
    const division  = item.dataset.division  || '';
    const stat      = item.dataset.stat      || '';
    const filter    = item.dataset.filter    || '';
    const challenge = item.dataset.challenge || '';
    const approach  = item.dataset.approach  || '';
    const outcome   = item.dataset.outcome   || '';

    document.getElementById('lbImage').src             = bgUrl;
    document.getElementById('lbImage').alt              = title;
    document.getElementById('lbTitle').textContent      = title;
    document.getElementById('lbClient').textContent     = client;
    document.getElementById('lbStatBadge').textContent  = stat;
    document.getElementById('lbChallenge').textContent  = challenge;
    document.getElementById('lbApproach').textContent   = approach;
    document.getElementById('lbOutcome').textContent    = outcome;

    const tag = document.getElementById('lbTag');
    tag.textContent = division;
    tag.className   = 'lb-division-tag';
    if (filter === 'talent') {
      tag.style.cssText = 'color:var(--talent);border-color:var(--talent);background:var(--talent-glow);';
    } else {
      tag.style.cssText = '';
      if (tagClasses[filter]) tag.classList.add(tagClasses[filter]);
    }

    lightbox.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
})();

/* ── GALLERY SCROLL REVEAL ── */
(function initGalleryReveal() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
        }, (i % 4) * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  items.forEach(item => {
    item.style.cssText += 'opacity:0;transform:translateY(24px) scale(0.98);transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1);';
    observer.observe(item);
  });
})();


/* ═══════════════════════════════════════════════════
   6. CONTACT PAGE — contact.html (Project Builder)
═══════════════════════════════════════════════════ */
(function initBuilder() {
  if (!document.getElementById('step1')) return; // not the contact page

  const totalSteps   = 4;
  const progressFill = document.getElementById('pbProgressFill');
  const stepLabel    = document.getElementById('pbStepLabel');

  const state = {
    goal: null, timeline: null, budget: null,
    name: '', email: '', phone: '', brand: '', website: '', extra: ''
  };

  const goalLabels = {
    brand:    'Build my brand',
    content:  'Capture content / media',
    digital:  'Build a website or digital product',
    event:    'Plan or produce an event',
    talent:   'Manage my talent or career',
    grow:     'Grow my business strategically',
    multiple: 'Full-spectrum solution'
  };

  const teamMap = {
    brand:    ['team-media', 'team-business'],
    content:  ['team-media'],
    digital:  ['team-web'],
    event:    ['team-events'],
    talent:   ['team-business'],
    grow:     ['team-business'],
    multiple: ['team-media', 'team-web', 'team-events', 'team-business']
  };
  const teamNames = {
    'team-media':    'Creative Media',
    'team-web':      'Web, App & AI',
    'team-events':   'Spectra Experience',
    'team-business': 'Business & Talent'
  };

  const timelineLabels = {
    'immediately': 'Immediately (this week)',
    '2-4weeks':    '2–4 Weeks',
    '1-3months':   '1–3 Months',
    'exploring':   'Just exploring for now'
  };
  const budgetLabels = {
    'under500k': 'Under ₦500,000',
    '500k-2m':   '₦500k – ₦2M',
    '2m-5m':     '₦2M – ₦5M',
    'above5m':   'Above ₦5M',
    'discuss':   'Prefer to discuss'
  };

  function setStep(n) {
    document.querySelectorAll('.pb-step').forEach(s => s.classList.remove('active'));
    const next = document.getElementById('step' + n);
    if (next) next.classList.add('active');
    const pct = (Math.min(n, totalSteps) / totalSteps) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (stepLabel) stepLabel.textContent = n <= totalSteps ? `Step ${n} of ${totalSteps}` : 'Complete ✦';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* STEP 1: Goal */
  document.querySelectorAll('#step1 .pb-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#step1 .pb-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.goal = btn.dataset.value;
      setTimeout(() => setStep(2), 240);
    });
  });

  /* STEP 2: Timeline + Budget */
  document.querySelectorAll('[data-field="timeline"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-field="timeline"]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.timeline = btn.dataset.value;
    });
  });
  document.querySelectorAll('[data-field="budget"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-field="budget"]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.budget = btn.dataset.value;
    });
  });

  const step2Next = document.querySelector('#step2 .pb-next-btn');
  if (step2Next) {
    step2Next.addEventListener('click', () => {
      if (!state.timeline) { showError(step2Next, 'Please select a timeline first.'); return; }
      setStep(3);
    });
  }
  document.querySelector('#step2 .pb-back-btn')?.addEventListener('click', () => setStep(1));

  /* STEP 3: Contact details */
  const buildSummaryBtn = document.getElementById('buildSummaryBtn');
  if (buildSummaryBtn) {
    buildSummaryBtn.addEventListener('click', () => {
      const name  = document.getElementById('pb-name').value.trim();
      const email = document.getElementById('pb-email').value.trim();
      const phone = document.getElementById('pb-phone').value.trim();

      if (!name || !email || !phone) { showError(buildSummaryBtn, 'Please fill in name, email, and phone.'); return; }
      if (!isValidEmail(email))       { showError(buildSummaryBtn, 'Please enter a valid email address.'); return; }

      state.name    = name;
      state.email   = email;
      state.phone   = phone;
      state.brand   = document.getElementById('pb-brand')?.value.trim() || '';
      state.website = document.getElementById('pb-website')?.value.trim() || '';
      state.extra   = document.getElementById('pb-extra')?.value.trim() || '';

      buildSummary();
      setStep(4);
    });
  }
  document.querySelector('#step3 .pb-back-btn')?.addEventListener('click', () => setStep(2));

  /* Build summary + WhatsApp brief */
  function buildSummary() {
    const container = document.getElementById('pbSummary');
    if (!container) return;

    const teams    = teamMap[state.goal] || ['team-business'];
    const teamHTML = teams.map(t => `<span class="${t}">${teamNames[t]}</span>`).join('');

    const waLines = [
      '*New Project Brief from Spectra Website*', '',
      `*Goal:* ${goalLabels[state.goal] || state.goal}`,
      `*Timeline:* ${timelineLabels[state.timeline] || state.timeline}`,
      state.budget ? `*Budget:* ${budgetLabels[state.budget] || state.budget}` : null, '',
      `*Name:* ${state.name}`,
      `*Email:* ${state.email}`,
      `*Phone:* ${state.phone}`,
      state.brand   ? `*Brand/Company:* ${state.brand}` : null,
      state.website ? `*Website:* ${state.website}` : null,
      state.extra   ? `*Notes:* ${state.extra}` : null,
    ].filter(Boolean).join('\n');
    const waURL = `https://wa.me/2347053815985?text=${encodeURIComponent(waLines)}`;

    container.innerHTML = `
      <div class="pb-summary-row"><h5>Your Goal</h5><p>${goalLabels[state.goal] || state.goal}</p></div>
      <div class="pb-summary-row"><h5>Timeline</h5><p>${timelineLabels[state.timeline] || state.timeline}</p></div>
      ${state.budget ? `<div class="pb-summary-row"><h5>Budget Range</h5><p>${budgetLabels[state.budget] || state.budget}</p></div>` : ''}
      <div class="pb-summary-row"><h5>Contact</h5><p>${state.name} · ${state.email} · ${state.phone}</p></div>
      ${state.brand   ? `<div class="pb-summary-row"><h5>Brand / Company</h5><p>${state.brand}</p></div>` : ''}
      ${state.website ? `<div class="pb-summary-row"><h5>Website</h5><p><a href="${state.website}" target="_blank" rel="noopener" style="color:var(--web)">${state.website}</a></p></div>` : ''}
      ${state.extra   ? `<div class="pb-summary-row"><h5>Additional Notes</h5><p>${state.extra}</p></div>` : ''}
      <div class="pb-summary-row"><h5>Recommended Team</h5><div class="pb-summary-team">${teamHTML}</div></div>
      <div class="pb-summary-row" style="border:none;padding:1rem;background:rgba(255,255,255,0.02);border-radius:8px;">
        <p style="font-size:0.8rem;color:var(--gray-light);line-height:1.7;">
          We'll review your inquiry and reach out within <strong style="color:var(--white)">24 hours</strong>, prepared with relevant portfolio examples and initial ideas.
        </p>
      </div>
      <div style="margin-top:0.5rem;">
        <a href="${waURL}" target="_blank" rel="noopener"
           style="display:inline-flex;align-items:center;gap:.5rem;font-family:var(--font-ui);font-size:.8rem;font-weight:700;color:#25D366;border:1px solid rgba(37,211,102,.3);padding:.5rem 1rem;border-radius:100px;transition:background .25s;"
           onmouseover="this.style.background='rgba(37,211,102,.1)'" onmouseout="this.style.background=''">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Also send via WhatsApp
        </a>
      </div>
    `;
  }

  document.querySelector('#step4 .pb-back-btn')?.addEventListener('click', () => setStep(3));

  /* Submit */
  const submitBtn = document.getElementById('pbSubmitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;
      setTimeout(() => {
        setStep(5);
        if (progressFill) progressFill.style.width = '100%';
        if (stepLabel) stepLabel.textContent = 'Complete ✦';
      }, 1200);
    });
  }

  function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function showError(btn, msg) {
    const existing = btn.parentElement.querySelector('.pb-error');
    if (existing) existing.remove();
    const err = document.createElement('p');
    err.className = 'pb-error';
    err.textContent = msg;
    err.style.cssText = 'color:#ef4444;font-size:.8rem;font-family:var(--font-ui);margin:0;';
    btn.parentElement.insertBefore(err, btn);
    setTimeout(() => err.remove(), 3500);
  }
})();
