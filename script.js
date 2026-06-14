// ─── Offer Bar Setup ──────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const offerBar = document.getElementById('offerBar');
const offerBarClose = document.getElementById('offerBarClose');

function getOfferBarH() {
  return offerBar && !offerBar.classList.contains('hidden')
    ? offerBar.offsetHeight
    : 0;
}

function updateOfferHeight() {
  const h = getOfferBarH();
  document.documentElement.style.setProperty('--offer-h', h + 'px');
}

// Close button
if (offerBarClose) {
  offerBarClose.addEventListener('click', () => {
    offerBar.style.transition = 'opacity 0.3s ease, max-height 0.4s ease';
    offerBar.style.opacity = '0';
    offerBar.style.maxHeight = '0';
    offerBar.style.padding = '0';
    offerBar.style.overflow = 'hidden';
    document.documentElement.style.setProperty('--offer-h', '0px');
    setTimeout(() => {
      offerBar.classList.add('hidden');
    }, 350);
  });
}

updateOfferHeight();
window.addEventListener('resize', updateOfferHeight);

// ─── Navbar Scroll Effect ──────────────────────────────────────────────────────
function handleNavbarScroll() {
  const scrollY = window.scrollY;
  const offerH = getOfferBarH();

  if (scrollY > offerH + 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

// ─── Hamburger / Mobile Menu ─────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when clicking a link
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// Hamburger animation
const style = document.createElement('style');
style.textContent = `
  .hamburger.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .hamburger.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
`;
document.head.appendChild(style);


// ─── FAQ Accordion ───────────────────────────────────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

// ─── Unified Premium Scroll Animations (Intersection Observer) ───────────────
const revealSelectors = [
  '.section-eyebrow',
  '.section-title',
  '.section-sub',
  '.service-card',
  '.package-card',
  '.review-card',
  '.faq-item',
  '.booking-container',
  '.booking-form-wrap',
  '.comparison-container',
  '.trust-bar',
  '.step-item',
  '.addon-item'
];

// Dynamically assign reveal class to target sections and cards
document.querySelectorAll(revealSelectors.join(', ')).forEach(el => {
  el.classList.add('reveal');
});

const scrollObserver = new IntersectionObserver((entries) => {
  let intersectCount = 0;
  entries.forEach((entry) => {
    if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
      intersectCount++;
      const el = entry.target;
      // Stagger animations when multiple elements intersect at once (e.g., grids)
      setTimeout(() => {
        el.classList.add('revealed');
      }, intersectCount * 80);
      scrollObserver.unobserve(el);
    }
  });
}, {
  threshold: 0.05,
  rootMargin: '0px 0px -20px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
  scrollObserver.observe(el);
});

// ─── Premium Page-Load Animation (Staggered) ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const loadSelectors = [
    '.navbar .nav-logo',
    '.navbar .nav-links a',
    '.navbar .mobile-book-btn',
    '.navbar .hamburger',
    '.hero-eyebrow',
    '.hero-title',
    '.hero-sub',
    '.hero-cta-group .btn-primary',
    '.hero-cta-group .btn-secondary'
  ];
  const elements = [];
  loadSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      elements.push(el);
      el.classList.add('load-reveal');
    });
  });

  // Stagger fade-in page-load elements by 0.1s
  elements.forEach((el, idx) => {
    setTimeout(() => {
      el.classList.add('revealed');
    }, idx * 100);
  });
});

// ─── Multi-Step Form Navigation & Price Estimation ───────────────────────────
const pricingData = {
  'Essential Clean': { 'Hatchback': 999, 'Sedan': 1199, 'SUV / MUV': 1299, 'Luxury / Exotic': 1599 },
  'Premium Detail': { 'Hatchback': 2499, 'Sedan': 2799, 'SUV / MUV': 3199, 'Luxury / Exotic': 3999 },
  'Elite Detail': { 'Hatchback': 4499, 'Sedan': 4999, 'SUV / MUV': 5499, 'Luxury / Exotic': 6499 },
  'Ceramic Pro': { 'Hatchback': 12999, 'Sedan': 13999, 'SUV / MUV': 15999, 'Luxury / Exotic': 19999 }
};

function updateEstimates() {
  const vehicleType = document.getElementById('vehicleType').value;
  const service = document.getElementById('service').value;
  const priceEstimateEl = document.getElementById('priceEstimate');

  if (!priceEstimateEl) return;

  if (service && vehicleType) {
    const price = pricingData[service]?.[vehicleType];
    priceEstimateEl.textContent = price ? `₹${price.toLocaleString('en-IN')}` : '₹999 – ₹19,999';
  } else if (service) {
    const prices = Object.values(pricingData[service]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    priceEstimateEl.textContent = `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}`;
  } else if (vehicleType) {
    const prices = Object.keys(pricingData).map(srv => pricingData[srv][vehicleType]).filter(Boolean);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    priceEstimateEl.textContent = `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}+`;
  } else {
    priceEstimateEl.textContent = '₹999 – ₹19,999+';
  }
}

function nextStep(currentStep) {
  const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (!currentStepEl) return;

  const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
  let isValid = true;
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.reportValidity();
      isValid = false;
    }
  });

  if (!isValid) return;

  const nextStepNum = currentStep + 1;
  const nextStepEl = document.querySelector(`.form-step[data-step="${nextStepNum}"]`);

  if (nextStepEl) {
    currentStepEl.classList.remove('active');
    nextStepEl.classList.add('active');

    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = `${(nextStepNum / 3) * 100}%`;
    }
  }
}

function prevStep(currentStep) {
  const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  const prevStepNum = currentStep - 1;
  const prevStepEl = document.querySelector(`.form-step[data-step="${prevStepNum}"]`);

  if (prevStepEl) {
    currentStepEl.classList.remove('active');
    prevStepEl.classList.add('active');

    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = `${(prevStepNum / 3) * 100}%`;
    }
  }
}

// ─── Booking Form Handler ─────────────────────────────────────────────────────
function handleBooking(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('formSuccess');
  const progressFill = document.getElementById('progressFill');

  // Parse values
  const firstName = document.getElementById('firstName').value;
  const phone = document.getElementById('phone').value;
  const vehicleType = document.getElementById('vehicleType').value;
  const service = document.getElementById('service').value;
  const address = document.getElementById('address').value;
  const preferredDate = document.getElementById('preferredDate').value;

  const newAppt = {
    id: 'APT-' + Date.now(),
    firstName,
    lastName: '',
    phone,
    email: '',
    vehicleType,
    service,
    address,
    preferredDate,
    notes: '',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  // Loading state
  btn.innerHTML = '<span>Sending...</span>';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  // Sync to Cloud and LocalStorage
  const dbBaseUrl = 'https://kvdb.io/GkHk1msDTVQ5uiHtMJStMn';
  const writeUrl = `${dbBaseUrl}/appt_${newAppt.id}`;
  
  fetch(writeUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAppt)
  })
    .then(res => {
      if (!res.ok) throw new Error('Write failed');
      // Also update local storage cache
      const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
      appts.unshift(newAppt);
      localStorage.setItem('appointments', JSON.stringify(appts));
      showSuccessState();
    })
    .catch(err => {
      console.error('Cloud sync error, falling back to LocalStorage:', err);
      const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
      appts.unshift(newAppt);
      localStorage.setItem('appointments', JSON.stringify(appts));
      showSuccessState();
    });

  function showSuccessState() {
    setTimeout(() => {
      form.style.display = 'none';
      if (progressFill) progressFill.parentElement.style.display = 'none';
      success.style.display = 'block';
      success.style.animation = 'heroIn 0.5s ease forwards';

      // Scroll to success
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Confetti-style celebration
      spawnConfetti();

      // Show portfolio demo modal
      setTimeout(() => {
        if (typeof openDemoModal === 'function') openDemoModal();
      }, 1000);
    }, 800);
  }
}

// ─── Simple Confetti Effect ───────────────────────────────────────────────────
function spawnConfetti() {
  const colors = ['#c5a059', '#d4af37', '#f5f0e8', '#8a8580'];
  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: -10px;
      width: ${4 + Math.random() * 8}px;
      height: ${4 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      z-index: 9999;
      pointer-events: none;
      animation: confettiFall ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards;
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 4000);
  }

  const confettiStyle = document.createElement('style');
  confettiStyle.textContent = `
    @keyframes confettiFall {
      to { transform: translateY(105vh) rotate(${Math.random() > 0.5 ? '' : '-'}${360 + Math.random() * 360}deg); opacity: 0; }
    }
  `;
  document.head.appendChild(confettiStyle);
}

// ─── Smooth Active Nav Link Highlighting ─────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinksAll.forEach(link => {
        link.classList.remove('active-link');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.classList.add('active-link');
        }
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(sec => sectionObserver.observe(sec));

// Active nav link style
const navLinkStyle = document.createElement('style');
navLinkStyle.textContent = `.nav-links a.active-link { color: var(--primary) !important; }`;
document.head.appendChild(navLinkStyle);

// ─── Gallery Lightbox ────────────────────────────────────────────────────────
function createLightbox() {
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(6,6,6,0.95); backdrop-filter: blur(10px);
    display: none; align-items: center; justify-content: center;
    cursor: zoom-out; animation: fadeIn 0.25s ease;
  `;
  lightbox.innerHTML = `
    <button style="position:absolute;top:20px;right:24px;font-size:28px;color:#fff;background:none;border:none;cursor:pointer;z-index:1;line-height:1;padding:8px;">✕</button>
    <img id="lightboxImg" style="max-width:90vw;max-height:85vh;object-fit:contain;border-radius:12px;box-shadow:0 20px 80px rgba(0,0,0,0.8);" />
    <div id="lightboxCaption" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);color:#fff;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;opacity:0.7;white-space:nowrap;"></div>
  `;
  document.body.appendChild(lightbox);

  const lbStyle = document.createElement('style');
  lbStyle.textContent = `@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`;
  document.head.appendChild(lbStyle);

  lightbox.querySelector('button').addEventListener('click', () => {
    lightbox.style.display = 'none';
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.style.display = 'none';
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.style.display = 'none';
  });
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

// ─── Sticky Book Bar Behavior ─────────────────────────────────────────────────
const stickyBar = document.querySelector('.sticky-book-bar');
const heroSection = document.querySelector('.hero');

if (stickyBar && heroSection) {
  const stickyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        stickyBar.style.opacity = '1';
      } else {
        stickyBar.style.opacity = '0';
      }
    });
  }, { threshold: 0 });
  stickyObserver.observe(heroSection);
}

// ─── Number Counter Animation ─────────────────────────────────────────────────
function animateCounter(el, target, duration = 1500, prefix = '', suffix = '') {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
  }, 16);
}

// ─── Hero Parallax Effect ─────────────────────────────────────────────────────
const heroImg = document.querySelector('.hero-img');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroImg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  }, { passive: true });
}

// ─── Typewriter Effect for Hero Subtitle ────────────────────────────────────
// (subtle, no jarring effect)
const heroSubtitle = document.querySelector('.hero-subtitle');

// ─── Form Date Minimum ────────────────────────────────────────────────────────
const dateInput = document.getElementById('preferredDate');
if (dateInput) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}


// ─── Offer bar slides up after 300px scroll ──────────────────────────────────
window.addEventListener('scroll', () => {
  if (!offerBar || offerBar.classList.contains('hidden')) return;
  if (window.scrollY > 300) {
    offerBar.style.transform = 'translateY(-100%)';
    offerBar.style.transition = 'transform 0.3s ease';
    document.documentElement.style.setProperty('--offer-h', '0px');
  } else {
    offerBar.style.transform = 'translateY(0)';
    document.documentElement.style.setProperty('--offer-h', offerBar.offsetHeight + 'px');
  }
}, { passive: true });

// Hero Title is now animated via the unified load-reveal system


// ─── Initialize ──────────────────────────────────────────────────────────────
console.log('🚗 DC Website Loaded — Ahmedabad\'s #1 Mobile Auto Detailing');

// ─── Copyright Year Setup ───────────────────────────────────────────────────
const copyrightYearEl = document.getElementById('copyright-year');
if (copyrightYearEl) {
  copyrightYearEl.textContent = new Date().getFullYear();
}

// ─── Hero Background Image Loader ───────────────────────────────────────────
const heroSectionEl = document.querySelector('.hero');
if (heroSectionEl) {
  const imgUrl = 'https://images.unsplash.com/photo-1563294374-29787e91409d?auto=format&fit=crop&q=80&w=1920';
  const tempImg = new Image();
  const imgTimeout = setTimeout(() => {
    heroSectionEl.classList.add('hero-loaded');
  }, 3000); // 3-second fallback
  tempImg.onload = () => {
    clearTimeout(imgTimeout);
    heroSectionEl.classList.add('hero-loaded');
  };
  tempImg.src = imgUrl;
}

// ─── Hidden Admin Portal Triggers ───────────────────────────────────────────
function promptAdminLogin() {
  const password = prompt('Enter Admin Password:');
  if (password === 'admin123') {
    sessionStorage.setItem('adminSession', 'active');
    window.location.href = 'admin.html';
  } else if (password !== null) {
    alert('Incorrect password!');
  }
}

// Trigger 1: Double click footer logo
const footerLogoEl = document.querySelector('.footer-logo-large');
if (footerLogoEl) {
  footerLogoEl.style.cursor = 'pointer';
  footerLogoEl.addEventListener('dblclick', promptAdminLogin);
}

// Trigger 2: Click copyright year 5 times
const copyrightYearEl2 = document.getElementById('copyright-year');
if (copyrightYearEl2) {
  let clickCount = 0;
  copyrightYearEl2.style.cursor = 'pointer';
  copyrightYearEl2.addEventListener('click', () => {
    clickCount++;
    if (clickCount >= 5) {
      clickCount = 0;
      promptAdminLogin();
    }
    // reset click count after 3 seconds of inactivity
    setTimeout(() => { clickCount = 0; }, 3000);
  });
}

// ─── Portfolio Demo Modal Handler ────────────────────────────────────────────
const demoModal = document.getElementById('demoModal');
const closeDemoModalBtn = document.getElementById('closeDemoModal');
let previousActiveElement = null;

function openDemoModal() {
  if (demoModal) {
    previousActiveElement = document.activeElement;
    demoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Lock scroll
    
    // Animate
    setTimeout(() => {
      demoModal.classList.add('active');
      const focusable = demoModal.querySelectorAll('a, button');
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }, 10);
  }
}

function closeDemoModal() {
  if (demoModal) {
    demoModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
    setTimeout(() => {
      demoModal.style.display = 'none';
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    }, 300);
  }
}

if (closeDemoModalBtn) {
  closeDemoModalBtn.addEventListener('click', closeDemoModal);
}
if (demoModal) {
  demoModal.addEventListener('click', (e) => {
    if (e.target === demoModal) {
      closeDemoModal();
    }
  });
}

// Escape key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && demoModal && demoModal.classList.contains('active')) {
    closeDemoModal();
  }
});

// Trapping Focus inside Modal
if (demoModal) {
  demoModal.addEventListener('keydown', (e) => {
    const isTabPressed = (e.key === 'Tab' || e.keyCode === 9);
    if (!isTabPressed) return;

    const focusableEls = demoModal.querySelectorAll('a[href], button:not([disabled])');
    const firstFocusable = focusableEls[0];
    const lastFocusable = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) { /* shift + tab */
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else { /* tab */
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });
}

// Global Demo Trigger Binder
function bindDemoTriggers() {
  document.querySelectorAll('a, button').forEach(el => {
    const text = el.textContent || '';
    const href = el.getAttribute('href') || '';
    
    // Check if button/link text or attributes denote booking or calling
    const isBookOrCreateQuote = text.includes('Book') || 
                                text.includes('Quote') || 
                                text.includes('Call') || 
                                href.startsWith('tel:');
                                
    // Exclude links/buttons inside the modal itself, or form step navigation
    const isInsideModal = el.closest('#demoModal');
    const isFormNav = el.classList.contains('form-btn-next') || 
                       el.classList.contains('form-btn-prev') || 
                       text.includes('Step') ||
                       el.closest('.form-btn-group');
    const isFinalSubmit = el.id === 'submitBtn' || el.classList.contains('form-submit-btn');

    if (isBookOrCreateQuote && !isInsideModal) {
      if (!isFormNav || isFinalSubmit) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          openDemoModal();
        });
      }
    }
  });
}

// Bind triggers initially
bindDemoTriggers();

