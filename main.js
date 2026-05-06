/* =============================================
   MAIN.JS — Portfolio Interactions & Canvas FX
   ============================================= */

// ──────────────────────────────────────────────
// 1. NAV — scroll effect
// ──────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ──────────────────────────────────────────────
// 2. HERO CANVAS — Particle constellation effect
// ──────────────────────────────────────────────
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [], animId;

const COLORS = ['#41B3FF', '#7dd3fc', '#bae6fd', '#e0f2fe', '#ffffff'];
const PARTICLE_COUNT = 110;
const CONNECTION_DIST = 140;
const MOUSE_REPEL_DIST = 120;

const mouse = { x: -9999, y: -9999 };

// --- SUPPORT MODAL LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const openSupport = document.getElementById('openSupport');
  const closeSupport = document.getElementById('closeSupport');
  const modalOverlay = document.getElementById('modalOverlay');
  const supportModal = document.getElementById('supportModal');

  if (openSupport && supportModal) {
    openSupport.addEventListener('click', () => {
      supportModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    const closeModal = () => {
      supportModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (closeSupport) closeSupport.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }
});

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

class Particle {
  constructor() { this.init(); }
  init() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.r  = Math.random() * 1.8 + 0.8;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.6 + 0.3;
    this.pulseSpeed = Math.random() * 0.02 + 0.01;
    this.pulseOffset = Math.random() * Math.PI * 2;
  }

  update(t) {
    // Mouse repulsion
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_REPEL_DIST) {
      const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST;
      this.vx += (dx / dist) * force * 0.6;
      this.vy += (dy / dist) * force * 0.6;
    }

    // Damping
    this.vx *= 0.98;
    this.vy *= 0.98;

    this.x += this.vx;
    this.y += this.vy;

    // Wrap edges
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;

    // Pulsing alpha
    this.currentAlpha = this.alpha * (0.7 + 0.3 * Math.sin(t * this.pulseSpeed + this.pulseOffset));
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.currentAlpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECTION_DIST) {
        const alpha = (1 - dist / CONNECTION_DIST) * 0.3;
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, a.color);
        grad.addColorStop(1, b.color);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// Floating orbs (background glow blobs)
const orbs = [
  { x: 0.15, y: 0.25, r: 300, color: 'rgba(65,179,255,0.05)', speed: 0.0003, offset: 0 },
  { x: 0.85, y: 0.65, r: 240, color: 'rgba(125,211,252,0.04)', speed: 0.0004, offset: 2 },
  { x: 0.5,  y: 0.9,  r: 200, color: 'rgba(65,179,255,0.03)', speed: 0.0005, offset: 4 },
];

function drawOrbs(t) {
  orbs.forEach(orb => {
    const cx = orb.x * W + Math.sin(t * orb.speed + orb.offset) * 60;
    const cy = orb.y * H + Math.cos(t * orb.speed + orb.offset * 1.3) * 40;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
    grad.addColorStop(0, orb.color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, orb.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

let tick = 0;
function animate() {
  animId = requestAnimationFrame(animate);
  tick++;

  ctx.clearRect(0, 0, W, H);

  // Semi-transparent background so hero photo shows through
  ctx.fillStyle = 'rgba(13, 13, 13, 0.55)';
  ctx.fillRect(0, 0, W, H);

  drawOrbs(tick);
  drawConnections();
  particles.forEach(p => { p.update(tick); p.draw(); });
}

window.addEventListener('resize', () => {
  resize();
  initParticles();
});

resize();
initParticles();
animate();

// ──────────────────────────────────────────────
// 3. SCROLL REVEAL
// ──────────────────────────────────────────────
const revealEls = document.querySelectorAll(
  '.section-label, .section-title, .gallery-title, .skills-main-title, .media-title, .about-grid, .skill-card, ' +
  '.timeline-item, .portfolio-placeholder, .cert-placeholder, ' +
  '.project-placeholder, .contact-container, .filter-bar'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      // Remove visible class when it leaves the viewport to re-trigger animation later
      // Optional: Only remove if it's below the viewport to prevent flickering at the top
      const rect = entry.target.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) {
        entry.target.classList.remove('visible');
      }
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

// ──────────────────────────────────────────────
// 4. SKILL BAR ANIMATION on reveal
// ──────────────────────────────────────────────
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target.querySelector('.skill-fill');
      if (fill) {
        const pct = fill.style.getPropertyValue('--pct');
        fill.style.width = pct;
      }
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-card').forEach(card => skillObserver.observe(card));

// ──────────────────────────────────────────────
// 5. PORTFOLIO FILTER (ready for items)
// ──────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Filter logic will be added when portfolio items are populated
  });
});

// ──────────────────────────────────────────────
// 6. NAV PILL — active state on click + scroll spy
// ──────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');
const navPills  = document.querySelectorAll('.nav-pill');

// Click → set active
navPills.forEach(pill => {
  pill.addEventListener('click', () => {
    navPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

// Scroll spy — highlight pill matching visible section
const sections = document.querySelectorAll('section[id]');
const scrollSpy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navPills.forEach(p => {
        p.classList.toggle('active', p.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => scrollSpy.observe(s));

// Mobile toggle
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.style.display === 'flex';
  navLinks.style.display = isOpen ? 'none' : 'flex';
  if (!isOpen) {
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '72px';
    navLinks.style.left = '1.5rem';
    navLinks.style.right = '1.5rem';
    navLinks.style.background = 'rgba(13,13,13,0.97)';
    navLinks.style.padding = '1rem';
    navLinks.style.gap = '0.3rem';
    navLinks.style.borderRadius = '16px';
    navLinks.style.border = '1px solid rgba(255,255,255,0.1)';
  }
});

// Close mobile nav on pill click
navPills.forEach(pill => {
  pill.addEventListener('click', () => {
    if (window.innerWidth <= 768) navLinks.style.display = 'none';
  });
});


// ──────────────────────────────────────────────
// 7. GALLERY — drag scroll + arrow nav + progress
// ──────────────────────────────────────────────
const track    = document.getElementById('galleryTrack');
const prevBtn  = document.getElementById('galleryPrev');
const nextBtn  = document.getElementById('galleryNext');
const progress = document.getElementById('galleryProgress');

if (track) {
  // Progress bar sync
  function updateProgress() {
    const max = track.scrollWidth - track.clientWidth;
    const pct = max > 0 ? (track.scrollLeft / max) * 100 : 0;
    // Keep bar between 8% and 100% so it's always visible
    progress.style.width = Math.max(8, pct) + '%';
  }
  track.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Arrow buttons — scroll by one card width
  const scrollBy = () => Math.round(track.clientWidth * 0.46);

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollBy(), behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollBy(), behavior: 'smooth' });
  });

  // Mouse drag-to-scroll
  let isDown = false, startX, scrollStart;

  track.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollStart = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });
  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });
  track.addEventListener('mouseup', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });
  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.4;
    track.scrollLeft = scrollStart - walk;
  });
}

// ──────────────────────────────────────────────
// 8. HERO NAME PARALLAX — scroll left / right
// ──────────────────────────────────────────────
const nameLine1 = document.getElementById('nameLine1');
const nameLine2 = document.getElementById('nameLine2');
const heroEl    = document.getElementById('hero');

if (nameLine1 && nameLine2 && heroEl) {
  const SPEED = 0.36; // tweak for faster/slower drift

  let rafId = null;
  let lastScroll = -1;

  function applyParallax() {
    const scrollY = window.scrollY;
    if (scrollY === lastScroll) { rafId = null; return; }
    lastScroll = scrollY;

    const heroH  = heroEl.offsetHeight;
    const offset = Math.min(scrollY, heroH) * SPEED;

    nameLine1.style.transform = `translateX(${-offset}px)`;
    nameLine2.style.transform = `translateX(${offset}px)`;
    rafId = null;
  }

  window.addEventListener('scroll', () => {
    if (!rafId) rafId = requestAnimationFrame(applyParallax);
  }, { passive: true });
}

// ──────────────────────────────────────────────
// 9. ABOUT SECTION — Spotlight Hover Effect
// ──────────────────────────────────────────────
const aboutInner = document.querySelector('.about-inner');
if (aboutInner) {
  aboutInner.addEventListener('mousemove', (e) => {
    const rect = aboutInner.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    aboutInner.style.setProperty('--mouse-x', `${x}px`);
    aboutInner.style.setProperty('--mouse-y', `${y}px`);
  });
}

// ──────────────────────────────────────────────
// 10. ABOUT STATEMENT — Scroll Scrubbing Reveal
// ──────────────────────────────────────────────
const typeStatement = document.getElementById('typeStatement');
if (typeStatement) {
  const words = typeStatement.querySelectorAll('.type-word');
  
  function scrubText() {
    const rect = typeStatement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Start revealing when the element is near the bottom of the screen
    // Finish revealing when it reaches the middle
    const start = windowHeight * 0.85;
    const end = windowHeight * 0.45;
    
    let progress = (start - rect.top) / (start - end);
    progress = Math.max(0, Math.min(1, progress));
    
    const totalWords = words.length;
    words.forEach((word, i) => {
      // Create a slice of progress for each word
      const wordStart = i / totalWords;
      const wordEnd = (i + 1) / totalWords;
      
      let wordProgress = (progress - wordStart) / (wordEnd - wordStart);
      wordProgress = Math.max(0.15, Math.min(1, wordProgress)); // 0.15 is the dimmed state
      
      word.style.opacity = wordProgress;
      
      // If it's a number, trigger the glow only when fully revealed
      if (word.classList.contains('about-num')) {
        if (wordProgress > 0.9) {
          word.style.textShadow = '0 0 25px rgba(65, 179, 255, 0.4)';
        } else {
          word.style.textShadow = 'none';
        }
      }
    });
  }

  window.addEventListener('scroll', scrubText, { passive: true });
  scrubText(); // initial check
}

// ──────────────────────────────────────────────
// 11. SKILLS TRACK — Drag Scroll & Arrows
// ──────────────────────────────────────────────
const skillsTrack = document.getElementById('skillsTrack');
const skillsPrev = document.getElementById('skillsPrev');
const skillsNext = document.getElementById('skillsNext');

if (skillsTrack) {
  const scrollAmt = () => Math.round(skillsTrack.clientWidth * 0.8);

  if (skillsPrev) {
    skillsPrev.addEventListener('click', () => {
      skillsTrack.scrollBy({ left: -scrollAmt(), behavior: 'smooth' });
    });
  }
  if (skillsNext) {
    skillsNext.addEventListener('click', () => {
      skillsTrack.scrollBy({ left: scrollAmt(), behavior: 'smooth' });
    });
  }

  // Mouse drag-to-scroll
  let sDown = false, sStartX, sScrollStart;

  skillsTrack.addEventListener('mousedown', e => {
    sDown = true;
    sStartX = e.pageX - skillsTrack.offsetLeft;
    sScrollStart = skillsTrack.scrollLeft;
    skillsTrack.style.cursor = 'grabbing';
  });
  skillsTrack.addEventListener('mouseleave', () => {
    sDown = false;
    skillsTrack.style.cursor = 'grab';
  });
  skillsTrack.addEventListener('mouseup', () => {
    sDown = false;
    skillsTrack.style.cursor = 'grab';
  });
  skillsTrack.addEventListener('mousemove', e => {
    if (!sDown) return;
    e.preventDefault();
    const x = e.pageX - skillsTrack.offsetLeft;
    const walk = (x - sStartX) * 1.5;
    skillsTrack.scrollLeft = sScrollStart - walk;
  });
}

// --- MEDIA HUB LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const mediaMoreBtn = document.getElementById('mediaMoreBtn');
  const mediaMoreWrap = document.querySelector('.media-more-wrap');
  const mediaCards = document.querySelectorAll('.media-card');
  const filterBtns = document.querySelectorAll('.m-filter');
  
  if (!mediaMoreWrap || !mediaCards.length) return;

  let isExpanded = false;

  function updateMediaGrid(filter = 'all') {
    let visibleCount = 0;
    
    mediaCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      const matches = (filter === 'all' || category === filter);
      
      if (matches) {
        // In "All" view, respect the isExpanded state for items beyond the first 4
        if (filter === 'all' && !isExpanded && visibleCount >= 4) {
          card.classList.add('hidden-card');
          card.style.display = 'none';
        } else {
          card.classList.remove('hidden-card');
          card.style.display = 'block';
        }
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show/Hide "Show More" button wrap
    // Only show "More" button in "All" view if there are more than 4 items
    if (filter === 'all' && mediaCards.length > 4) {
      mediaMoreWrap.style.display = 'flex';
      mediaMoreBtn.textContent = isExpanded ? '접기 ↑' : '더보기 ↓';
    } else {
      mediaMoreWrap.style.display = 'none';
    }
  }

  // Filter click events
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      
      // Reset expansion when changing filters if you prefer, or keep it.
      // Usually better to reset for clarity.
      if (filter !== 'all') isExpanded = true; 
      else isExpanded = false;
      
      updateMediaGrid(filter);
    });
  });

  // Show more click event
  if (mediaMoreBtn) {
    mediaMoreBtn.addEventListener('click', () => {
      isExpanded = !isExpanded;
      const activeFilter = document.querySelector('.m-filter.active').getAttribute('data-filter');
      updateMediaGrid(activeFilter);
    });
  }

  // Initial update
  updateMediaGrid('all');
});



// --- TIMELINE CLICK TO EXPAND (Mobile & Desktop) ---
document.addEventListener('DOMContentLoaded', () => {
  const tlContents = document.querySelectorAll('.tl-v3-content');
  tlContents.forEach(content => {
    content.addEventListener('click', () => {
      content.classList.toggle('expanded');
    });
  });
});

// ──────────────────────────────────────────────
// 12. 3D TILT EFFECT (Gallery Cards)
// ──────────────────────────────────────────────
const cards = document.querySelectorAll('.gallery-card');
cards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; // max 10deg
    const rotateY = ((x - centerX) / centerX) * 10;  // max 10deg
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
  });
});

// ──────────────────────────────────────────────
// 13. STAGGERED TEXT REVEAL (Title Splitting)
// ──────────────────────────────────────────────
function initTextReveal() {
  const titles = document.querySelectorAll('.section-title, .gallery-title, .skills-main-title, .media-title');
  
  titles.forEach(title => {
    const nodes = Array.from(title.childNodes);
    title.innerHTML = '';
    title.classList.add('reveal');
    
    let charIndex = 0;

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Handle plain text
        const text = node.textContent;
        [...text].forEach(char => {
          title.appendChild(createCharSpan(char, charIndex++));
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Handle element (like <span class="accent-word">)
        const newElement = node.cloneNode(false);
        const text = node.textContent;
        [...text].forEach(char => {
          newElement.appendChild(createCharSpan(char, charIndex++));
        });
        title.appendChild(newElement);
      }
    });
  });

  function createCharSpan(char, index) {
    const wrap = document.createElement('span');
    wrap.className = 'char-wrap';
    const charSpan = document.createElement('span');
    charSpan.className = 'char';
    charSpan.textContent = char === ' ' ? '\u00A0' : char;
    charSpan.style.setProperty('--char-index', index);
    wrap.appendChild(charSpan);
    return wrap;
  }
}

// Initialize text reveal before observer starts
initTextReveal();


// ──────────────────────────────────────────────
// LEADERSHIP LIST SCROLL GAUGE
// ──────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const leadList = document.querySelector('.leadership-list');
  const leadBar = document.getElementById('leadProgress');
  const leadItems = document.querySelectorAll('.lead-item');
  
  if (!leadList || !leadBar) return;

  const rect = leadList.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  // 게이지 계산 (화면 중앙 기준)
  const triggerPoint = windowHeight * 0.7; // 화면 하단에서 30% 지점
  const sectionStart = rect.top;
  const sectionHeight = rect.height;
  
  let progress = (triggerPoint - sectionStart) / sectionHeight;
  progress = Math.max(0, Math.min(1, progress));
  
  leadBar.style.height = `${progress * 100}%`;

  // 개별 아이템 활성화
  leadItems.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < triggerPoint) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
});
