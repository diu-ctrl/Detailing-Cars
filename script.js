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

// ─── Package Tabs / Price Switcher ───────────────────────────────────────────
const tabBtns = document.querySelectorAll('.tab-btn');
const priceAmounts = document.querySelectorAll('.price-amount');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const tab = btn.dataset.tab;
    priceAmounts.forEach(el => {
      const oldPrice = el.textContent;
      const newPrice = el.dataset[tab] || el.textContent;

      // Animate price change
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        el.textContent = newPrice;
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200);
    });
  });
});

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

// ─── Scroll Animations (Intersection Observer) ───────────────────────────────
const aosElements = document.querySelectorAll('[data-aos]');

const aosObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-visible');
      aosObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

aosElements.forEach(el => aosObserver.observe(el));

// ─── General scroll-reveal for all major sections ────────────────────────────
const revealElements = document.querySelectorAll(
  '.service-card, .package-card, .vehicle-item, .review-card, .step-item, .addon-item'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

revealElements.forEach(el => {
  if (!el.hasAttribute('data-aos')) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    revealObserver.observe(el);
  }
});

// ─── Booking Form Handler ─────────────────────────────────────────────────────
function handleBooking(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('formSuccess');

  // Parse values
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const vehicleType = document.getElementById('vehicleType').value;
  const service = document.getElementById('service').value;
  const address = document.getElementById('address').value;
  const preferredDate = document.getElementById('preferredDate').value;
  const notes = document.getElementById('notes').value;

  const newAppt = {
    id: 'APT-' + Date.now(),
    firstName,
    lastName,
    phone,
    email,
    vehicleType,
    service,
    address,
    preferredDate,
    notes,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  // Save to localStorage
  const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
  appts.unshift(newAppt);
  localStorage.setItem('appointments', JSON.stringify(appts));

  // Loading state
  btn.innerHTML = '<span>Sending...</span>';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  // Simulate form submission
  setTimeout(() => {
    form.style.display = 'none';
    success.style.display = 'block';
    success.style.animation = 'heroIn 0.5s ease forwards';

    // Scroll to success
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Confetti-style celebration (CSS only)
    spawnConfetti();
  }, 1500);
}

// ─── Simple Confetti Effect ───────────────────────────────────────────────────
function spawnConfetti() {
  const colors = ['#f5a800', '#ff9800', '#ffffff', '#0276d2'];
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

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-hover span');
    document.getElementById('lightboxImg').src = img.src;
    document.getElementById('lightboxCaption').textContent = caption ? caption.textContent : '';
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

// ─── Letter-by-Letter Fade & Blur Effect for Hero Title ──────────────────────
const titleEl = document.querySelector('.hero-title');
if (titleEl) {
  const text = titleEl.textContent.trim();
  titleEl.innerHTML = '';
  const words = text.split(' ');
  let charIndex = 0;
  
  words.forEach((word, wordIdx) => {
    const wordSpan = document.createElement('span');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';
    
    [...word].forEach((char) => {
      const charSpan = document.createElement('span');
      charSpan.textContent = char;
      charSpan.className = 'char-fade';
      // stagger delay per character, starting slightly after entry
      charSpan.style.animationDelay = `${0.2 + charIndex * 0.04}s`;
      wordSpan.appendChild(charSpan);
      charIndex++;
    });
    
    titleEl.appendChild(wordSpan);
    
    // Add a space span between words
    if (wordIdx < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.textContent = ' ';
      spaceSpan.style.whiteSpace = 'pre';
      titleEl.appendChild(spaceSpan);
    }
  });
  
  // Add class to reveal title container
  titleEl.classList.add('loaded');
}

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
  const imgUrl = 'assets/hero_dc.png?v=3';
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
const footerLogoEl = document.querySelector('.footer-logo img');
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

