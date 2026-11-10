/* ============================================
   DC — script.js (P1 refinement)
   Booking flow fixed: anchors scroll to the form,
   demo modal appears ONLY after successful submit.
   Data layer: POST /api/bookings (server-side kvdb write) + localStorage fallback.
   ============================================ */

// JS gate for reveal animations (no-JS = content visible)
document.documentElement.classList.add('js');

// ─── Navbar Scroll State ──────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
function handleNavbarScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ─── Active Nav Link Highlighting ────────────────────────────────────────────
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active-link', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: 0.3 });
sections.forEach(sec => sectionObserver.observe(sec));

// ─── FAQ Accordion ───────────────────────────────────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ─── Scroll Reveal (subtle, single-pass) ─────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ─── Hero Background Loader ──────────────────────────────────────────────────
const heroSectionEl = document.querySelector('.hero');
if (heroSectionEl) {
  const tempImg = new Image();
  const imgTimeout = setTimeout(() => heroSectionEl.classList.add('hero-loaded'), 3000);
  tempImg.onload = () => { clearTimeout(imgTimeout); heroSectionEl.classList.add('hero-loaded'); };
  tempImg.src = 'assets/hero_dc.png?v=3';
}

// ─── Multi-Step Form + Price Estimation ──────────────────────────────────────

// ─── P4 F10: Hardening constants + helpers ──────────────────────────────────
const FORM_MIN_FILL_MS = 3000;
const formOpenedAt = Date.now();
const BOOKING_API = '/api/bookings';

function sanitizeText(value, maxLen) {
  return String(value == null ? '' : value)
    .replace(/[<>`]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLen);
}

function showFormError(msg) {
  const el = document.getElementById('formError');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => { el.style.display = 'none'; }, 8000);
}

function isBotSubmission() {
  const hp = document.getElementById('company');
  if (hp && hp.value.trim() !== '') return true;
  return Date.now() - formOpenedAt < FORM_MIN_FILL_MS;
}
const pricingData = {
  'Essential Clean': {
    'Hatchback': 999,  'Sedan': 1199,  'SUV / MUV': 1299,  'Luxury / Exotic': 1599,
    'Truck / Pickup': 1499, 'Van / Traveller': 1699, 'Commercial Fleet': 899
  },
  'Premium Detail':  {
    'Hatchback': 2499, 'Sedan': 2799,  'SUV / MUV': 3199,  'Luxury / Exotic': 3999,
    'Truck / Pickup': 3499, 'Van / Traveller': 3799, 'Commercial Fleet': 2199
  },
  'Elite Detail':    {
    'Hatchback': 4499, 'Sedan': 4999,  'SUV / MUV': 5499,  'Luxury / Exotic': 6499,
    'Truck / Pickup': 6499, 'Van / Traveller': 6999, 'Commercial Fleet': 3999
  },
  'Ceramic Pro':     {
    'Hatchback': 12999,'Sedan': 13999, 'SUV / MUV': 15999, 'Luxury / Exotic': 19999,
    'Truck / Pickup': 17999,'Van / Traveller': 19999,'Commercial Fleet': 11499
  }
};

// ─── P5 F11: Multi-vehicle blocks ────────────────────────────────────────────
const MAX_VEHICLES = 10;
const vehicleBlocksEl = document.getElementById('vehicleBlocks');

function blockVehicles() {
  return Array.from(document.querySelectorAll('#vehicleBlocks .vehicle-block'));
}

function renumberBlocks() {
  const blocks = blockVehicles();
  blocks.forEach((b, i) => {
    b.dataset.block = i;
    b.querySelector('.vehicle-block-title').textContent = 'Vehicle ' + (i + 1);
    b.querySelector('.veh-remove').style.display = blocks.length > 1 ? '' : 'none';
  });
  const addBtn = document.getElementById('addVehicleBtn');
  if (addBtn) addBtn.style.display = blocks.length >= MAX_VEHICLES ? 'none' : '';
}

function addVehicleBlock() {
  if (blockVehicles().length >= MAX_VEHICLES) return;
  const clone = blockVehicles()[0].cloneNode(true);
  clone.querySelectorAll('select').forEach(s => { s.value = ''; });
  const est = clone.querySelector('.veh-est');
  if (est) est.textContent = '';
  vehicleBlocksEl.appendChild(clone);
  renumberBlocks();
  updateEstimates();
}

function removeVehicleBlock(btn) {
  if (blockVehicles().length <= 1) return;
  btn.closest('.vehicle-block').remove();
  renumberBlocks();
  updateEstimates();
}

function updateEstimates() {
  const priceEstimateEl = document.getElementById('priceEstimate');
  if (!priceEstimateEl) return;
  let total = 0, complete = 0;
  blockVehicles().forEach(b => {
    const vt = b.querySelector('.veh-type').value;
    const sv = b.querySelector('.veh-service').value;
    const estEl = b.querySelector('.veh-est');
    if (vt && sv && pricingData[sv] && pricingData[sv][vt]) {
      const p = pricingData[sv][vt];
      estEl.textContent = '₹' + p.toLocaleString('en-IN');
      total += p;
      complete++;
    } else {
      estEl.textContent = '';
    }
  });
  priceEstimateEl.textContent = complete > 0
    ? (complete === blockVehicles().length ? 'Total: ₹' + total.toLocaleString('en-IN') : 'So far: ₹' + total.toLocaleString('en-IN'))
    : '₹999 – ₹19,999+';
}

function setProgress(stepNum) {
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = (stepNum / 3) * 100 + '%';
}

function nextStep(currentStep) {
  const stepEl = document.querySelector('.form-step[data-step="' + currentStep + '"]');
  if (!stepEl) return;
  let valid = true;
  stepEl.querySelectorAll('input[required], select[required]').forEach(input => {
    if (!input.value.trim()) { input.reportValidity(); valid = false; }
  });
  if (!valid) return;
  const emailInput = document.getElementById('email');
  if (emailInput && emailInput.value.trim() && !emailInput.validity.valid) {
    emailInput.reportValidity();
    return;
  }
  const nextEl = document.querySelector('.form-step[data-step="' + (currentStep + 1) + '"]');
  if (nextEl) {
    stepEl.classList.remove('active');
    nextEl.classList.add('active');
    setProgress(currentStep + 1);
  }
}

function prevStep(currentStep) {
  const stepEl = document.querySelector('.form-step[data-step="' + currentStep + '"]');
  const prevEl = document.querySelector('.form-step[data-step="' + (currentStep - 1) + '"]');
  if (stepEl && prevEl) {
    stepEl.classList.remove('active');
    prevEl.classList.add('active');
    setProgress(currentStep - 1);
  }
}

// ─── Booking Submission (kvdb + local fallback — contract unchanged) ─────────
function handleBooking(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('formSuccess');
  const btnOriginal = btn.innerHTML;

  // F10: silent bot rejection (honeypot + time-trap) — fake success, no write
  if (isBotSubmission()) {
    showSuccessState();
    return;
  }

  // F10: sanitize + length caps
  const vehicles = blockVehicles().map(b => ({
    vehicleType: b.querySelector('.veh-type').value,
    service: b.querySelector('.veh-service').value
  }));
  const newAppt = {
    id: 'APT-' + Date.now(),
    firstName: sanitizeText(document.getElementById('firstName').value, 60),
    lastName: '',
    phone: sanitizeText(document.getElementById('phone').value, 20),
    email: sanitizeText(document.getElementById('email').value, 120),
    vehicleType: vehicles[0].vehicleType,
    service: vehicles[0].service,
    vehicles: vehicles,
    address: sanitizeText(document.getElementById('address').value, 240),
    preferredDate: document.getElementById('preferredDate').value,
    notes: sanitizeText(document.getElementById('notes').value, 500),
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  // F11: whitelist every vehicle's select values (never trust the DOM)
  const validServices = ['Essential Clean', 'Premium Detail', 'Elite Detail', 'Ceramic Pro'];
  const validVehicles = ['Hatchback', 'Sedan', 'SUV / MUV', 'Luxury / Exotic', 'Truck / Pickup', 'Van / Traveller', 'Commercial Fleet'];
  const badVeh = vehicles.find(v => !validServices.includes(v.service) || !validVehicles.includes(v.vehicleType));
  if (badVeh) {
    showFormError('Please choose a valid service and vehicle type for every vehicle.');
    return;
  }

  // F10: Indian mobile format
  if (!/^(\+?91[\s\-]?|0)?[6-9]\d{9}$/.test(newAppt.phone.replace(/[\s\-()]/g, ''))) {
    showFormError('Please enter a valid Indian mobile number (e.g. 98765 43210).');
    return;
  }

  // F10: duplicate suppression (same phone + same date)
  const phoneDigits = newAppt.phone.replace(/\D/g, '').slice(-10);
  const existing = JSON.parse(localStorage.getItem('appointments') || '[]');
  const isDuplicate = existing.some(a =>
    (a.phone || '').replace(/\D/g, '').slice(-10) === phoneDigits &&
    a.preferredDate === newAppt.preferredDate
  );
  if (isDuplicate) {
    showFormError('A booking with this phone number and date already exists. Call us if you need to change it.');
    return;
  }

  // F10: client rate limit — max 3 bookings per hour per device
  const now = Date.now();
  const log = JSON.parse(localStorage.getItem('dc_booking_log') || '[]').filter(t => now - t < 3600000);
  if (log.length >= 3) {
    showFormError('Too many bookings from this device in the last hour. Please try again later or WhatsApp us.');
    return;
  }

  // F10: stale-session guard — a tab left open >24h counts as human
  const effectiveOpenedAt = (Date.now() - formOpenedAt > 86400000) ? (Date.now() - 60000) : formOpenedAt;

  btn.innerHTML = '<span>Sending…</span>';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  (async () => {
    try {
      const res = await fetch(BOOKING_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAppt, formOpenedAt: effectiveOpenedAt })
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      if (!res.ok) {
        if (res.status === 400 || res.status === 403 || res.status === 429) {
          showFormError(data.error || 'Please check your details and try again.');
          btn.innerHTML = btnOriginal;
          btn.disabled = false;
          btn.style.opacity = '1';
          return;
        }
        throw new Error('upstream ' + res.status);
      }
    } catch (err) {
      // network / 5xx → graceful local fallback keeps the demo flow alive
    }

    log.push(now);
    localStorage.setItem('dc_booking_log', JSON.stringify(log));

    const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
    appts.unshift(newAppt);
    localStorage.setItem('appointments', JSON.stringify(appts));
    showSuccessState();
  })();

  function showSuccessState() {
    setTimeout(() => {
      form.style.display = 'none';
      const bar = document.querySelector('.form-progress-bar');
      if (bar) bar.style.display = 'none';
      const est = document.querySelector('.price-estimate-indicator');
      if (est) est.style.display = 'none';
      success.style.display = 'block';
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      spawnConfetti();
      setTimeout(() => { if (typeof openDemoModal === 'function') openDemoModal(); }, 1200);
    }, 500);
  }
}

// ─── Confetti (brand palette: yellow / white / grey) ─────────────────────────
function spawnConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#fcdf00', '#ffe328', '#ffffff', '#a1a1aa'];
  for (let i = 0; i < 26; i++) {
    const dot = document.createElement('div');
    dot.style.cssText =
      'position:fixed;left:' + (Math.random() * 100) + 'vw;top:-10px;' +
      'width:' + (3 + Math.random() * 7) + 'px;height:' + (3 + Math.random() * 7) + 'px;' +
      'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
      'border-radius:' + (Math.random() > 0.5 ? '50%' : '1px') + ';' +
      'z-index:9999;pointer-events:none;' +
      'animation:confettiFall ' + (1.4 + Math.random() * 1.8) + 's ease-out ' + (Math.random() * 0.4) + 's forwards;';
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 4000);
  }
}

// ─── Gallery Lightbox (sharp, hairline — no rounded glass) ───────────────────
function createLightbox() {
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.style.cssText =
    'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.94);' +
    'display:none;align-items:center;justify-content:center;cursor:zoom-out;animation:fadeIn 0.2s ease;';
  lightbox.innerHTML =
    '<button aria-label="Close" style="position:absolute;top:18px;right:22px;font-size:26px;color:#fff;background:none;border:none;cursor:pointer;line-height:1;padding:8px;">×</button>' +
    '<img id="lightboxImg" style="max-width:92vw;max-height:84vh;object-fit:contain;border:1px solid rgba(255,255,255,0.16);" />' +
    '<div id="lightboxCaption" style="position:absolute;bottom:26px;left:50%;transform:translateX(-50%);color:#a1a1aa;font-family:Inter,sans-serif;font-size:11px;white-space:nowrap;"></div>';
  document.body.appendChild(lightbox);

  lightbox.querySelector('button').addEventListener('click', () => { lightbox.style.display = 'none'; });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.style.display = 'none'; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.style.display = 'none'; });
  return lightbox;
}
const lightbox = createLightbox();
document.querySelectorAll('.scroller-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    document.getElementById('lightboxImg').src = img.src;
    document.getElementById('lightboxCaption').textContent = img.alt || '';
    lightbox.style.display = 'flex';
  });
  item.style.cursor = 'zoom-in';
});

// ─── Sticky Mobile Bar (hidden while hero is on screen) ──────────────────────
const stickyBar = document.querySelector('.sticky-book-bar');
const heroSection = document.querySelector('.hero');
if (stickyBar && heroSection) {
  const stickyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { stickyBar.style.opacity = entry.isIntersecting ? '0' : '1'; });
  }, { threshold: 0 });
  stickyBar.style.transition = 'opacity 0.3s ease';
  stickyObserver.observe(heroSection);
}

// ─── Form Date Minimum (tomorrow) ────────────────────────────────────────────
const dateInput = document.getElementById('preferredDate');
if (dateInput) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}

// ─── Copyright Year ──────────────────────────────────────────────────────────
const yearEl = document.getElementById('copyright-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── Hidden Admin Portal Triggers (kept from v1) ─────────────────────────────
function promptAdminLogin() {
  window.location.href = 'admin.html';
}
const footerLogoEl = document.getElementById('footerLogo');
if (footerLogoEl) {
  footerLogoEl.style.cursor = 'pointer';
  footerLogoEl.addEventListener('dblclick', promptAdminLogin);
}
if (yearEl) {
  let clickCount = 0;
  yearEl.style.cursor = 'pointer';
  yearEl.addEventListener('click', () => {
    clickCount++;
    if (clickCount >= 5) { clickCount = 0; promptAdminLogin(); }
    setTimeout(() => { clickCount = 0; }, 3000);
  });
}

// ─── Demo Modal (post-submit only) ───────────────────────────────────────────
const demoModal = document.getElementById('demoModal');
const closeDemoModalBtn = document.getElementById('closeDemoModal');
let previousActiveElement = null;

function openDemoModal() {
  if (!demoModal) return;
  previousActiveElement = document.activeElement;
  demoModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  const first = demoModal.querySelector('a, button');
  if (first) setTimeout(() => first.focus(), 50);
}

function closeDemoModal() {
  if (!demoModal) return;
  demoModal.classList.remove('active');
  document.body.style.overflow = '';
  if (previousActiveElement) previousActiveElement.focus();
}

if (closeDemoModalBtn) closeDemoModalBtn.addEventListener('click', closeDemoModal);
if (demoModal) {
  demoModal.addEventListener('click', (e) => { if (e.target === demoModal) closeDemoModal(); });
  demoModal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = demoModal.querySelectorAll('a[href], button:not([disabled])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && demoModal && demoModal.classList.contains('active')) closeDemoModal();
});

console.log('DC — Apex refinement loaded. Ahmedabad mobile detailing demo.');
