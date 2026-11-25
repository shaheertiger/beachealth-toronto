/**
 * BEACHEALTH INTERACTIVE ENGINE
 * Ultra-fast, zero-bloat vanilla JavaScript
 */

// Scroll restoration & reload handling
if (typeof window !== 'undefined') {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Clear hash on beforeunload so reload always starts fresh at home page
  window.addEventListener('beforeunload', () => {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
  });

  const navEntries = (typeof performance !== 'undefined' && performance.getEntriesByType)
    ? performance.getEntriesByType('navigation')
    : [];
  const isReload = (navEntries.length > 0 && navEntries[0].type === 'reload') ||
    (typeof performance !== 'undefined' && performance.navigation && performance.navigation.type === 1);

  if (isReload) {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo(0, 0);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initMobileDrawer();
  initServicesFilter();
  initCardLandingAnimations();
  init3DCardTilt();
  initModals();
  initContactForm();
  initReviewsSlider();
  initSmoothScroll();
  initFloatingTextWidget();

  // Dynamic Copyright Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ==========================================================================
   1. HERO SLIDER (Elementor Prime Slider recreation)
   ========================================================================== */
function initSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const nextBtn = document.querySelector('.slider-next');
  const prevBtn = document.querySelector('.slider-prev');
  const currentCounter = document.querySelector('.slider-counter .current');
  const totalCounter = document.querySelector('.slider-counter .total');
  const progressBar = document.querySelector('.slider-progress-bar');
  
  if (!slides.length) return;

  let currentIndex = 0;
  const slideCount = slides.length;
  const slideDuration = 6000; // 6 seconds
  let slideTimer = null;
  let progressInterval = null;
  let progressStartTime = 0;

  if (totalCounter) {
    totalCounter.textContent = String(slideCount).padStart(2, '0');
  }

  function goToSlide(index) {
    slides[currentIndex].classList.remove('active');
    currentIndex = (index + slideCount) % slideCount;
    slides[currentIndex].classList.add('active');
    
    if (currentCounter) {
      currentCounter.textContent = String(currentIndex + 1).padStart(2, '0');
    }
    resetProgress();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function resetProgress() {
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      setTimeout(() => {
        progressBar.style.transition = `width ${slideDuration}ms linear`;
        progressBar.style.width = '100%';
      }, 50);
    }
    clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, slideDuration);
  }

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Pause on hover
  const sliderSection = document.querySelector('.hero-slider-section');
  if (sliderSection) {
    sliderSection.addEventListener('mouseenter', () => clearInterval(slideTimer));
    sliderSection.addEventListener('mouseleave', () => resetProgress());

    let touchStartX = 0;
    sliderSection.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderSection.addEventListener('touchend', e => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) nextSlide();
      if (touchEndX - touchStartX > 50) prevSlide();
    }, { passive: true });
  }

  // Initialize first slide progress
  resetProgress();
}

/* ==========================================================================
   2. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const closeBtn = document.querySelector('.drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-nav a, .drawer-footer a, .drawer-portals a');

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    setScrollLock(true);
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    if (!document.getElementById('modal-overlay')?.classList.contains('open')) setScrollLock(false);
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Auto-hide floating book bar when keyboard opens (input focus)
  const floatingBar = document.getElementById('floating-book-bar');
  if (floatingBar) {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        floatingBar.style.transform = 'translateY(100%)';
        floatingBar.style.transition = 'transform 0.2s ease';
      });
      input.addEventListener('blur', () => {
        floatingBar.style.transform = 'translateY(0)';
      });
    });
  }

  // Global ESC key listener to close drawer and modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   3. SERVICES FILTER
   ========================================================================== */
function initServicesFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.service-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      let visibleIdx = 0;

      cards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        const matches = filter === 'all' || category.includes(filter);

        if (matches) {
          card.style.display = 'flex';
          card.classList.remove('card-landed');
          card.style.transitionDelay = `${visibleIdx * 70}ms`;
          visibleIdx++;

          requestAnimationFrame(() => {
            setTimeout(() => {
              card.classList.add('card-landed');
            }, 30);
          });

          setTimeout(() => {
            card.style.transitionDelay = '';
          }, (visibleIdx * 70) + 750);
        } else {
          card.classList.remove('card-landed');
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ==========================================================================
   3B. CARD & SECTION LANDING ENTRANCE ANIMATIONS
   Staggered, organic scroll reveals for Service, Team & Why Choose Us Cards,
   plus Welcome Section
   ========================================================================== */
function initCardLandingAnimations() {
  const cards = document.querySelectorAll('.service-card, .team-card, .why-card, .review-slide-card, .blog-card, .physio-practitioner-card, .physio-services-box');
  const sectionHeaders = document.querySelectorAll('.section-title-wrap, .why-header, .reviews-header');

  // Welcome section is static (no scroll animation needed)

  // Animate Section Titles & Badges on scroll
  if (sectionHeaders.length && 'IntersectionObserver' in window) {
    const headerObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('header-landed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    sectionHeaders.forEach(header => {
      header.classList.add('header-animate-init');
      headerObserver.observe(header);
    });
  }

  if (!cards.length) return;

  if (!('IntersectionObserver' in window)) {
    cards.forEach(card => card.classList.add('card-landed'));
    return;
  }

  // Add initial animation state class to cards
  cards.forEach(card => card.classList.add('card-animate-init'));

  const observer = new IntersectionObserver((entries, obs) => {
    const intersectingEntries = entries.filter(entry => entry.isIntersecting);

    intersectingEntries.forEach((entry, idx) => {
      const card = entry.target;
      // Stagger entrance delay: 70ms per card index in the visible batch
      const delayMs = idx * 70;
      card.style.transitionDelay = `${delayMs}ms`;

      requestAnimationFrame(() => {
        card.classList.add('card-landed');
      });

      // Clear transitionDelay after landing so hover/touch effects respond instantaneously
      setTimeout(() => {
        card.style.transitionDelay = '';
      }, delayMs + 750);

      obs.unobserve(card);
    });
  }, {
    threshold: 0.04,
    rootMargin: '0px 0px -20px 0px'
  });

  cards.forEach(card => observer.observe(card));
}

/* ==========================================================================
   3C. 3D MAGNETIC PERSPECTIVE TILT (DESKTOP INTERACTION)
   Dynamic physics-based tilt responding to cursor position
   ========================================================================== */
function init3DCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const tiltCards = document.querySelectorAll('.service-card, .team-card, .why-card, .review-slide-card, .blog-card');
  if (!tiltCards.length) return;

  tiltCards.forEach(card => {
    let bounds;

    function onMouseEnter() {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
    }

    function onMouseMove(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      const xPct = (mouseX / bounds.width) - 0.5;
      const yPct = (mouseY / bounds.height) - 0.5;

      // Subtle, sleek 3D rotation (max ~6.5deg)
      const rotateX = (-yPct * 6.5).toFixed(2);
      const rotateY = (xPct * 6.5).toFixed(2);

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale3d(1.015, 1.015, 1.015)`;
    }

    function onMouseLeave() {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease';
      card.style.transform = '';
      bounds = null;
    }

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}

/* ==========================================================================
   4. MODALS (BOOKING, PRACTITIONER BIO, SERVICE DETAIL, BLOG)
   ========================================================================== */
const TEAM_DATA = {
  'lada-milos-lee': {
    name: 'Lada Milos Lee',
    role: 'Chiropodist',
    portal: 'Beaches Foot Care Centre',
    bookingUrl: 'https://beachesfootcare.janeapp.com/',
    image: '/images/team-lada.jpg',
    bio: `Lada Milos Lee has been practicing as a licensed chiropodist for over 15 years at Beaches Foot Care Centre at Beachealth. Graduating with honors from the Michener Institute for Applied Health Sciences, Lada specializes in comprehensive foot care, diabetic wound management, nail surgery, and bespoke biomechanical orthotics. She takes great pride in creating tailored treatment plans that restore mobility and relieve foot and lower-limb pain for patients of all ages.`
  },
  'dr-adam-bletsoe': {
    name: 'Dr. Adam Bletsoe',
    role: 'Chiropractor',
    portal: 'Beachealth Clinic',
    bookingUrl: 'https://beachealth.janeapp.com/',
    image: '/images/team-adam.jpeg',
    bio: `
      <p style="font-size: 1.05rem; font-weight: 700; color: #0093d0; margin-bottom: 12px;">Move Better. Hurt Less. Get Back to Doing What You Love.</p>
      <p style="margin-bottom: 14px;">Dr. Adam Bletsoe combines hands-on chiropractic care with movement, contemporary pain science, and nervous-system-informed strategies. His approach can be simple and hands-on when that is what you need — or go deeper when pain has become persistent, recurring, or difficult to understand.</p>
      <p style="margin-bottom: 14px;">Whether you are dealing with a new injury, long-standing joint stiffness, athletic restrictions, or pain that flares with stress, Dr. Adam’s goal is to help you feel and function better with a clear, collaborative path forward.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 18px 0;">
        <strong style="color: #173753; display: block; margin-bottom: 8px;">Clinical Focus & Techniques:</strong>
        <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px; font-size: 0.9rem; color: #334155;">
          <li>• Hands-on spinal & joint adjustments</li>
          <li>• Gentle joint mobilization</li>
          <li>• Instrument-assisted adjusting & soft-tissue therapy</li>
          <li>• Pain Reprocessing Therapy (PRT) principles</li>
          <li>• Movement, rehabilitation & exercise coaching</li>
          <li>• TMJ jaw tension, headaches & posture care</li>
        </ul>
      </div>


      </div>
    `
  },
  'jared-cox': {
    name: 'Jared Cox',
    role: 'Osteopathic Manual Practitioner, Holistic Nutritionist & Personal Trainer',
    portal: 'Beachealth Clinic',
    bookingUrl: 'https://beachealth.janeapp.com/',
    image: '/images/team-jared.jpg',
    bio: `Jared is a registered Osteopathic Manual Practitioner, certified Holistic Nutritionist, and Personal Trainer with a specialized passion for sports injuries, spinal rehabilitation, and chronic pain management. He uses gentle osteopathic articular techniques, visceral mobilization, and cranial work combined with functional nutrition to resolve the underlying root causes of systemic inflammation and structural imbalance.`
  },
  'patrice-wilson': {
    name: 'Patrice Wilson',
    role: 'Registered Massage Therapist (RMT)',
    portal: 'Beachealth Clinic',
    bookingUrl: 'https://beachealth.janeapp.com/#/registered-massage-therapy',
    image: '/images/team-patrice.jpg',
    bio: `Patrice Wilson is a graduate of Sutherland-Chan School & Teaching Clinic and an active member in good standing with the College of Massage Therapists of Ontario (CMTO) since 2004. With over two decades of clinical expertise, Patrice specializes in deep tissue therapy, trigger point release, myofascial manipulation, and prenatal massage, helping clients release deep chronic tension and improve postural alignment.`
  },
  'krystele-charles': {
    name: 'Krystele Charles',
    role: 'Registered Massage Therapist (RMT)',
    portal: 'Beachealth Clinic',
    bookingUrl: 'https://beachealth.janeapp.com/#/registered-massage-therapy',
    image: '/images/team-krystele.jpg',
    bio: `Krystele Charles is a compassionate Registered Massage Therapist dedicated to musculoskeletal recovery and pain reduction. Her clinical focus includes TMJ dysfunction massage, sports injury recovery, neck and shoulder tension relief, and stress reduction. Krystele coordinates with Beachealth’s osteopaths and chiropractors to augment structural recovery with targeted soft-tissue therapy.`
  },
  'shakiba-bani': {
    name: 'Shakiba Banifatemi',
    role: 'Pelvic Physiotherapist & Founder of Javia',
    portal: 'Javia Physiotherapy Booking',
    bookingUrl: 'https://javia.janeapp.com/locations/beachealth/book',
    image: '/images/team-shakiba.jpg',
    bio: `<p style="font-size: 1.05rem; font-weight: 700; color: #0093d0; margin-bottom: 12px;">Pelvic Physiotherapist & Founder of Javia</p>
<p style="margin-bottom: 14px;">Shakiba specializes in pelvic health, running-related injuries, and movement rehabilitation. As a physiotherapist and passionate runner, she combines clinical knowledge with her personal experience in running, strength training, and Pilates to help clients recover, prevent injuries, and remain active throughout life.</p>
<div style="background: #f4f9fd; border: 1px solid rgba(0, 147, 208, 0.25); border-radius: 10px; padding: 16px; margin: 18px 0;">
  <strong style="color: #007cb0; display: block; margin-bottom: 8px;">Areas of Practice & Clinical Focus:</strong>
  <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px; font-size: 0.9rem; color: #115e59;">
    <li>• Pelvic Health Physiotherapy (Pre/Postnatal)</li>
    <li>• Running Assessment & Injury Prevention</li>
    <li>• Movement Rehabilitation & Strength Training</li>
    <li>• Musculoskeletal Recovery & Return-to-Sport</li>
  </ul>
</div>`
  },
  'shakiba-banifatemi': {
    name: 'Shakiba Banifatemi',
    role: 'Pelvic Physiotherapist & Founder of Javia',
    portal: 'Javia Physiotherapy Booking',
    bookingUrl: 'https://javia.janeapp.com/locations/beachealth/book',
    image: '/images/team-shakiba.jpg',
    bio: `<p style="font-size: 1.05rem; font-weight: 700; color: #0093d0; margin-bottom: 12px;">Pelvic Physiotherapist & Founder of Javia</p>
<p style="margin-bottom: 14px;">Shakiba specializes in pelvic health, running-related injuries, and movement rehabilitation. As a physiotherapist and passionate runner, she combines clinical knowledge with her personal experience in running, strength training, and Pilates to help clients recover, prevent injuries, and remain active throughout life.</p>
<div style="background: #f4f9fd; border: 1px solid rgba(0, 147, 208, 0.25); border-radius: 10px; padding: 16px; margin: 18px 0;">
  <strong style="color: #007cb0; display: block; margin-bottom: 8px;">Areas of Practice & Clinical Focus:</strong>
  <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px; font-size: 0.9rem; color: #115e59;">
    <li>• Pelvic Health Physiotherapy (Pre/Postnatal)</li>
    <li>• Running Assessment & Injury Prevention</li>
    <li>• Movement Rehabilitation & Strength Training</li>
    <li>• Musculoskeletal Recovery & Return-to-Sport</li>
  </ul>
</div>`
  },
  'amin-montazeri': {
    name: 'Amin Montazeri',
    role: 'Registered Physiotherapist (Javia)',
    portal: 'Javia Physiotherapy Booking',
    bookingUrl: 'https://javia.janeapp.com/locations/beachealth/book',
    image: '/images/team-amin.jpg',
    bio: `<p style="font-size: 1.05rem; font-weight: 700; color: #0093d0; margin-bottom: 12px;">Registered Physiotherapist (Javia)</p>
<p style="margin-bottom: 14px;">Amin focuses on musculoskeletal and orthopaedic physiotherapy, helping clients manage pain, recover from injuries, and restore movement and function. His treatment approach incorporates therapeutic exercise, manual therapy, dry needling, and electro-acupuncture when appropriate.</p>
<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 18px 0;">
  <strong style="color: #173753; display: block; margin-bottom: 8px;">Clinical Focus & Techniques:</strong>
  <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px; font-size: 0.9rem; color: #334155;">
    <li>• Musculoskeletal & Orthopaedic Physiotherapy</li>
    <li>• Pre- & Post-Operative Rehabilitation</li>
    <li>• Manual Therapy & Joint Mobilization</li>
    <li>• Dry Needling & Electro-Acupuncture</li>
    <li>• Therapeutic Exercise & Active Rehab</li>
  </ul>
</div>`
  },
  'adriana-lis': {
    name: 'Adriana Lis Pereira',
    role: 'Clinical Pilates Instructor & Physiotherapy Assistant',
    portal: 'Beachealth Clinic',
    bookingUrl: 'https://beachealth.janeapp.com/#/pilates-physio-pilates',
    image: '/images/team-lis.jpg',
    bio: `<p style="font-size: 1.05rem; font-weight: 700; color: #0093d0; margin-bottom: 12px;">Clinical Pilates Instructor &amp; Physiotherapy Assistant</p>
<p style="margin-bottom: 14px;">Adriana Lis Pereira holds a PhD in Medical Sciences from the University of São Paulo and a specialization in Neuroscience from UNICAMP. At Beachealth, she delivers therapeutic exercise and rehab programs under the supervision of a Registered Physiotherapist, along with Clinical Pilates sessions focused on posture, stability, strength, and mobility.</p>
<p style="margin-bottom: 14px; font-weight: 600; color: #0284c7;">Clients can also choose to book private sessions with Adriana Lis Pereira.</p>
<div style="background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 10px; padding: 16px; margin: 18px 0;">
  <strong style="color: #0369a1; display: block; margin-bottom: 8px;">Areas of Practice & Movement Focus:</strong>
  <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px; font-size: 0.9rem; color: #0369a1;">
    <li>• Postural Re-education & Alignment</li>
    <li>• Core Stability & Functional Strengthening</li>
    <li>• Clinical & Therapeutic Pilates</li>
    <li>• Breathing Techniques & Breath Control</li>
    <li>• Private Mindful Movement Sessions</li>
  </ul>
</div>


</div>`
  }};

const SERVICE_DATA = {
  'osteopathy': {
    pageUrl: '/osteopathy.html',
    title: 'Osteopathy',
    portal: 'Beachealth Services',
    bookingUrl: 'https://beachealth.janeapp.com/#/osteopathy',
    image: '/images/osteo-card.jpg',
    desc: 'Osteopathy is a whole-body manual therapy that recognizes the profound link between body structure, joint alignment, and overall health. Rather than merely masking symptoms, osteopathic practitioners evaluate how the musculoskeletal system, nervous system, and organs interact to cause restriction or pain.',
    points: [
      'Gentle joint mobilization & myofascial release',
      'Craniosacral & visceral techniques',
      'Effective for chronic neck, back, pelvic & joint pain',
      'Restores autonomic nervous system balance'
    ]
  },
  'chiropody': {
    pageUrl: '/chiropody.html',
    title: 'Chiropody and Foot Care',
    portal: 'Beaches Foot Care Centre',
    bookingUrl: 'https://beachesfootcare.janeapp.com/',
    image: '/images/chiropody-card.jpg',
    desc: 'Chiropodists are primary healthcare foot specialists who diagnose and treat conditions affecting the feet and lower limbs. From painful ingrown toenails and plantar warts to custom foot orthotics and diabetic wound prevention, our chiropodists keep you walking pain-free.',
    points: [
      'Custom Biomechanical Foot Orthotics',
      'Conservative & minor surgical nail treatments',
      'Plantar fasciitis & heel spur therapies',
      'Diabetic foot health screening and care'
    ]
  },
  'massage-therapy': {
    pageUrl: '/massage-therapy.html',
    title: 'Massage Therapy',
    portal: 'Beachealth Services',
    bookingUrl: 'https://beachealth.janeapp.com/#/registered-massage-therapy',
    image: '/images/massage-card.jpg',
    desc: 'Massage therapy involves the clinical manipulation of the soft tissues of the body—muscles, connective tissues, tendons, ligaments, and joints. Our registered therapists work collaboratively to optimize physical function, relieve chronic spasms, and eliminate trigger points.',
    points: [
      'Deep tissue therapy & myofascial release',
      'TMJ specialized massage for jaw clenching & headaches',
      'Sports injury recovery and maintenance',
      'Prenatal & postnatal massage protocols'
    ]
  },
  'physiotherapy': {
    pageUrl: '/physiotherapy.html',
    title: 'Physiotherapy',
    portal: 'Javia Physiotherapy Booking',
    bookingUrl: 'https://javia.janeapp.com/locations/beachealth/book',
    image: '/images/physio-hero.jpg',
    desc: 'Beachealth has partnered with <a href="https://javia.ca/" target="_blank" rel="noopener" style="color: #0093d0; text-decoration: underline; font-weight: 700;">Javia</a>, a physiotherapy and movement-focused healthcare company dedicated to helping people move better, recover from injuries, build strength, and maintain an active, healthy lifestyle.',
    points: [
      'Musculoskeletal & Orthopaedic Physiotherapy',
      'Pre-Operative & Post-Operative Rehabilitation',
      'Pelvic Health Physiotherapy',
      'Running Assessment & Rehabilitation',
      'Dry Needling & Electro-Acupuncture',
      'Strength, Mobility & Injury Prevention'
    ],
    customHtml: `<div class="service-modal-rich">
  <img src="/images/physio-hero.jpg" alt="Physiotherapy in Partnership with Javia" style="width: 100%; height: 240px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />
  <div style="display: inline-block; background: #0093d0; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">In Partnership with Javia</div>
  <h2 style="font-size: 1.7rem; color: #173753; margin-bottom: 8px; font-weight: 800;">Physiotherapy at Beach Health</h2>
  <p style="font-size: 1.05rem; font-weight: 600; color: #0093d0; margin-bottom: 16px;">Move better. Recover from injuries. Build strength. Maintain an active, healthy lifestyle.</p>
  <p style="font-size: 0.98rem; line-height: 1.65; color: #334155; margin-bottom: 16px;">Beachealth has partnered with <strong>Javia</strong>, a physiotherapy and movement-focused healthcare company dedicated to helping people move better, recover from injuries, build strength, and maintain an active, healthy lifestyle.</p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
    <h3 style="font-size: 1.15rem; color: #173753; font-weight: 800; margin-bottom: 12px;">Our Physiotherapy Services Include:</h3>
    <ul style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem; color: #334155;">
      <li style="display: flex; gap: 8px; align-items: flex-start;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3" style="flex-shrink: 0; margin-top: 3px;"><polyline points="20 6 9 17 4 12"/></svg> <span><strong>Musculoskeletal &amp; Orthopaedic Physiotherapy:</strong> Assessment and treatment of muscle, joint, and sports-related injuries, chronic pain, and movement limitations.</span></li>
      <li style="display: flex; gap: 8px; align-items: flex-start;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3" style="flex-shrink: 0; margin-top: 3px;"><polyline points="20 6 9 17 4 12"/></svg> <span><strong>Pre-Operative &amp; Post-Operative Rehabilitation:</strong> Individualized rehabilitation programs to improve strength, mobility, and physical function before surgery and support safe recovery.</span></li>
      <li style="display: flex; gap: 8px; align-items: flex-start;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3" style="flex-shrink: 0; margin-top: 3px;"><polyline points="20 6 9 17 4 12"/></svg> <span><strong>Pelvic Health Physiotherapy:</strong> Specialized care for pelvic floor dysfunction, prenatal and postnatal recovery, and women's pelvic health.</span></li>
      <li style="display: flex; gap: 8px; align-items: flex-start;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3" style="flex-shrink: 0; margin-top: 3px;"><polyline points="20 6 9 17 4 12"/></svg> <span><strong>Running Assessment &amp; Rehabilitation:</strong> Running gait assessment, injury prevention, rehabilitation, and return-to-running programs.</span></li>
      <li style="display: flex; gap: 8px; align-items: flex-start;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3" style="flex-shrink: 0; margin-top: 3px;"><polyline points="20 6 9 17 4 12"/></svg> <span><strong>Dry Needling &amp; Electro-Acupuncture:</strong> Treatment approaches offered when clinically appropriate.</span></li>
      <li style="display: flex; gap: 8px; align-items: flex-start;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3" style="flex-shrink: 0; margin-top: 3px;"><polyline points="20 6 9 17 4 12"/></svg> <span><strong>Strength, Mobility &amp; Injury Prevention:</strong> Individualized exercise programs to improve movement, function, and long-term physical health.</span></li>
    </ul>
  </div>
  <div style="background: #f4f9fd; border: 1.5px solid #0093d0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
    <h3 style="font-size: 1.15rem; color: #173753; font-weight: 800; margin-bottom: 8px;">Meet Our Physiotherapists</h3>
    <p style="font-size: 0.92rem; color: #173753; line-height: 1.6; margin-bottom: 10px;">
      <strong>Shakiba Banifatemi</strong> – Pelvic Physiotherapist<br>
      <span style="font-size: 0.86rem; color: #64748b;">Specializes in pelvic health, running-related injuries, and movement rehabilitation.</span>
    </p>
    <p style="font-size: 0.92rem; color: #173753; line-height: 1.6; margin: 0;">
      <strong>Amin Montazeri</strong> – Registered Physiotherapist<br>
      <span style="font-size: 0.86rem; color: #64748b;">Focuses on musculoskeletal and orthopaedic physiotherapy, therapeutic exercise, manual therapy, and dry needling.</span>
    </p>
  </div>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <a href="https://javia.janeapp.com/locations/beachealth/book" target="_blank" rel="noopener" class="btn btn-primary" style="background: #0093d0; border-color: #0093d0;">Book Now</a>
    <a href="/physiotherapy.html" class="btn btn-secondary">Learn More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <a href="tel:4165464887" class="btn btn-outline-dark">Call (416) 546-4887</a>
  </div>
</div>`
  },
  'clinical-pilates': {
    pageUrl: '/clinical-pilates.html',
    title: 'Clinical Pilates',
    portal: 'Beachealth Clinic',
    bookingUrl: 'https://beachealth.janeapp.com/#/pilates-physio-pilates',
    image: '/images/pilates-card.jpeg',
    desc: 'Clinical Pilates combines Pilates-based movements with physiotherapy principles to improve strength, mobility, posture, balance, and movement control.',
    points: [
      'Clinical & Therapeutic Pilates',
      'Pilates for Strength & Mobility',
      'Postural Re-education',
      'Core Stability & Functional Strengthening',
      'Breathing Techniques & Breath Control',
      'Injury Recovery & Prevention'
    ],
    customHtml: `<div class="service-modal-rich">
  <img src="/images/pilates-card.jpeg" alt="Clinical Pilates at Beach Health" style="width: 100%; height: 240px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />
  <h2 style="font-size: 1.7rem; color: #173753; margin-bottom: 8px; font-weight: 800;">Clinical Pilates at Beach Health</h2>
  <p style="font-size: 1.05rem; font-weight: 600; color: #0093d0; margin-bottom: 16px;">Individualized, goal-oriented exercise programs supporting rehabilitation and long-term well-being.</p>
  <p style="font-size: 0.98rem; line-height: 1.65; color: #334155; margin-bottom: 14px;">Clinical Pilates combines Pilates-based movements with physiotherapy principles to improve strength, mobility, posture, balance, and movement control.</p>
  <p style="font-size: 0.98rem; line-height: 1.65; color: #334155; margin-bottom: 18px;">Our focus is on individualized, goal-oriented exercise programs that support rehabilitation, injury prevention, and long-term physical well-being.</p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
    <h3 style="font-size: 1.15rem; color: #173753; font-weight: 800; margin-bottom: 10px;">Services Can Include:</h3>
    <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.9rem; color: #334155;">
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Clinical &amp; Therapeutic Pilates</span></li>
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Pilates for Strength &amp; Mobility</span></li>
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Postural Re-education</span></li>
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Core Stability &amp; Functional Strengthening</span></li>
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Breathing Techniques &amp; Breath Control</span></li>
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Injury Recovery &amp; Prevention</span></li>
    </ul>
  </div>
  <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-left: 5px solid #0093d0; border-radius: 10px; padding: 16px 18px; margin-bottom: 20px;">
    <p style="font-size: 0.92rem; color: #1e293b; line-height: 1.6; margin-bottom: 10px;">Clinical Pilates delivered as physiotherapy treatment requires an initial physiotherapy assessment and an individualized treatment plan. Our physiotherapy assistants can then guide clients through their prescribed exercises under physiotherapist supervision.</p>
    <p style="font-size: 0.92rem; color: #0284c7; font-weight: 700; margin: 0;">Clients can also choose to book private sessions with Adriana Lis Pereira</p>
  </div>
  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
    <h3 style="font-size: 1.15rem; color: #173753; font-weight: 800; margin-bottom: 8px;">Adriana Lis Pereira</h3>
    <div style="color: #0093d0; font-size: 0.9rem; font-weight: 700; margin-bottom: 10px;">Clinical Pilates Instructor &amp; Physiotherapy Assistant</div>
    <p style="font-size: 0.88rem; color: #475569; line-height: 1.55; margin: 0;">Adriana Lis Pereira holds a PhD in Medical Sciences from the University of São Paulo and a specialization in Neuroscience from UNICAMP. At Beachealth, she delivers therapeutic exercise and rehab programs under the supervision of a Registered Physiotherapist, along with Clinical Pilates sessions focused on posture, stability, strength, and mobility.</p>
  </div>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <a href="https://beachealth.janeapp.com/#/pilates-physio-pilates" target="_blank" rel="noopener" class="btn btn-primary">Book Clinical Pilates</a>
    <a href="/clinical-pilates.html" class="btn btn-secondary">Learn More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
  </div>
</div>`
  },
  'physio-pilates': {
    pageUrl: '/clinical-pilates.html',
    title: 'Clinical Pilates',
    portal: 'Beachealth Clinic',
    bookingUrl: 'https://beachealth.janeapp.com/#/pilates-physio-pilates',
    image: '/images/pilates-card.jpeg',
    desc: 'Clinical Pilates combines Pilates-based movements with physiotherapy principles to improve strength, mobility, posture, balance, and movement control.',
    points: [
      'Clinical & Therapeutic Pilates',
      'Pilates for Strength & Mobility',
      'Postural Re-education',
      'Core Stability & Functional Strengthening',
      'Breathing Techniques & Breath Control',
      'Injury Recovery & Prevention'
    ],
    customHtml: `<div class="service-modal-rich">
  <img src="/images/pilates-card.jpeg" alt="Clinical Pilates at Beach Health" style="width: 100%; height: 240px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />
  <h2 style="font-size: 1.7rem; color: #173753; margin-bottom: 8px; font-weight: 800;">Clinical Pilates at Beach Health</h2>
  <p style="font-size: 1.05rem; font-weight: 600; color: #0093d0; margin-bottom: 16px;">Individualized, goal-oriented exercise programs supporting rehabilitation and long-term well-being.</p>
  <p style="font-size: 0.98rem; line-height: 1.65; color: #334155; margin-bottom: 14px;">Clinical Pilates combines Pilates-based movements with physiotherapy principles to improve strength, mobility, posture, balance, and movement control.</p>
  <p style="font-size: 0.98rem; line-height: 1.65; color: #334155; margin-bottom: 18px;">Our focus is on individualized, goal-oriented exercise programs that support rehabilitation, injury prevention, and long-term physical well-being.</p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
    <h3 style="font-size: 1.15rem; color: #173753; font-weight: 800; margin-bottom: 10px;">Services Can Include:</h3>
    <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.9rem; color: #334155;">
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Clinical &amp; Therapeutic Pilates</span></li>
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Pilates for Strength &amp; Mobility</span></li>
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Postural Re-education</span></li>
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Core Stability &amp; Functional Strengthening</span></li>
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Breathing Techniques &amp; Breath Control</span></li>
      <li style="display: flex; gap: 8px; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>Injury Recovery &amp; Prevention</span></li>
    </ul>
  </div>
  <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-left: 5px solid #0093d0; border-radius: 10px; padding: 16px 18px; margin-bottom: 20px;">
    <p style="font-size: 0.92rem; color: #1e293b; line-height: 1.6; margin-bottom: 10px;">Clinical Pilates delivered as physiotherapy treatment requires an initial physiotherapy assessment and an individualized treatment plan. Our physiotherapy assistants can then guide clients through their prescribed exercises under physiotherapist supervision.</p>
    <p style="font-size: 0.92rem; color: #0284c7; font-weight: 700; margin: 0;">Clients can also choose to book private sessions with Adriana Lis Pereira</p>
  </div>
  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
    <h3 style="font-size: 1.15rem; color: #173753; font-weight: 800; margin-bottom: 8px;">Adriana Lis Pereira</h3>
    <div style="color: #0093d0; font-size: 0.9rem; font-weight: 700; margin-bottom: 10px;">Clinical Pilates Instructor &amp; Physiotherapy Assistant</div>
    <p style="font-size: 0.88rem; color: #475569; line-height: 1.55; margin: 0;">Adriana Lis Pereira holds a PhD in Medical Sciences from the University of São Paulo and a specialization in Neuroscience from UNICAMP. At Beachealth, she delivers therapeutic exercise and rehab programs under the supervision of a Registered Physiotherapist, along with Clinical Pilates sessions focused on posture, stability, strength, and mobility.</p>
  </div>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <a href="https://beachealth.janeapp.com/#/pilates-physio-pilates" target="_blank" rel="noopener" class="btn btn-primary">Book Clinical Pilates</a>
    <a href="/clinical-pilates.html" class="btn btn-secondary">Learn More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
  </div>
</div>`
  },
  'shockwave-therapy': {
    pageUrl: '/shockwave-therapy.html',
    title: 'Shockwave Therapy',
    portal: 'Beachealth Services',
    bookingUrl: 'https://beachealth.janeapp.com/',
    image: '/images/shockwave-card.jpeg',
    desc: 'Shockwave therapy delivers acoustic sound wave pulses into chronic, non-healing connective tissue. These acoustic pulses stimulate micro-vascularization, break down calcium deposits, and trigger cellular healing cascades in chronic tendons.',
    points: [
      'Proven effective for plantar fasciitis & Achilles tendinitis',
      'Tennis elbow, golfer’s elbow & rotator cuff tendinopathy',
      'Non-invasive with zero surgical downtime',
      'Accelerates collagen production & neovascularization'
    ]
  },
  'chiropractic': {
    pageUrl: '/chiropractic.html',
    title: 'Chiropractic Care',
    portal: 'Beachealth Services',
    bookingUrl: 'https://beachealth.janeapp.com/',
    image: '/images/chiro-hero.jpeg',
    desc: 'Move Better. Hurt Less. Get Back to Doing What You Love. Hands-on chiropractic care combined with movement and pain science with Dr. Adam Bletsoe.',
    points: [
      'Gentle spinal & extremity joint adjustments',
      'Joint mobilization & instrument-assisted therapy',
      'Pain Reprocessing Therapy & nervous-system work',
      'Headaches, TMJ jaw tension & ergonomic rehab',
      'Sports and running injury recovery plans'
    ],
    customHtml: `
      <div class="service-modal-rich">
        <img src="/images/chiro-hero.jpeg" alt="Dr. Adam Bletsoe Chiropractic Care" style="width: 100%; height: 240px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />
        <h2 style="font-size: 1.7rem; color: #173753; margin-bottom: 8px; font-weight: 800;">Chiropractic Care with Dr. Adam Bletsoe</h2>
        <p style="font-size: 1.05rem; font-weight: 600; color: #0093d0; margin-bottom: 16px;">Move Better. Hurt Less. Get Back to Doing What You Love.</p>

        <p style="font-size: 0.98rem; line-height: 1.65; color: #334155; margin-bottom: 14px;">
          Chiropractic care at Beachealth is designed to help you reduce pain, move more freely and feel more confident in your body.
        </p>
        <p style="font-size: 0.98rem; line-height: 1.65; color: #334155; margin-bottom: 14px;">
          <strong>Dr. Adam Bletsoe</strong> combines hands-on chiropractic care with movement, contemporary pain science and nervous-system-informed strategies. The approach can be simple and hands-on when that is what you need — or go deeper when pain has become persistent, recurring or difficult to understand.
        </p>
        <p style="font-size: 0.98rem; line-height: 1.65; color: #334155; margin-bottom: 20px;">
          Whether you are dealing with a new problem, an old injury, recurring stiffness or pain that seems to change with stress, the goal is the same: <em>Help you feel and function better — and give you a clear path forward.</em>
        </p>

        <!-- How It Works Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <h3 style="font-size: 1.15rem; color: #173753; font-weight: 800; margin-bottom: 10px;">How Chiropractic Care at Beachealth Works</h3>
          <p style="font-size: 0.9rem; color: #475569; line-height: 1.6; margin-bottom: 12px;">
            Bodies can become stiff, guarded or painful for many reasons—injury, physical strain, repetitive activity, sport, work, prolonged positions, or when the nervous system becomes protective. Treatment is adapted to your body and preferences:
          </p>
          <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px; font-size: 0.88rem; color: #334155;">
            <li style="display: flex; align-items: center; gap: 8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Chiropractic adjustments</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Gentle joint mobilization</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Instrument-assisted adjusting</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Soft-tissue treatment</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Movement & exercise rehab</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Breathing & nervous-system regulation</li>
            <li style="display: flex; align-items: center; gap: 8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Contemporary pain science</li>
          </ul>
        </div>

        <!-- Conditions Commonly Helped -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <h3 style="font-size: 1.15rem; color: #173753; font-weight: 800; margin-bottom: 10px;">Conditions We Commonly Help With</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
            <span style="background: #e6f4fb; color: #0093d0; padding: 3px 10px; border-radius: 14px; font-size: 0.8rem; font-weight: 600;">Back Pain</span>
            <span style="background: #e6f4fb; color: #0093d0; padding: 3px 10px; border-radius: 14px; font-size: 0.8rem; font-weight: 600;">Neck Pain</span>
            <span style="background: #e6f4fb; color: #0093d0; padding: 3px 10px; border-radius: 14px; font-size: 0.8rem; font-weight: 600;">Headaches</span>
            <span style="background: #e6f4fb; color: #0093d0; padding: 3px 10px; border-radius: 14px; font-size: 0.8rem; font-weight: 600;">Shoulder Pain</span>
            <span style="background: #e6f4fb; color: #0093d0; padding: 3px 10px; border-radius: 14px; font-size: 0.8rem; font-weight: 600;">Jaw Tension & TMJ</span>
            <span style="background: #e6f4fb; color: #0093d0; padding: 3px 10px; border-radius: 14px; font-size: 0.8rem; font-weight: 600;">Stiffness & Restrictions</span>
            <span style="background: #e6f4fb; color: #0093d0; padding: 3px 10px; border-radius: 14px; font-size: 0.8rem; font-weight: 600;">Sport Injuries</span>
            <span style="background: #e6f4fb; color: #0093d0; padding: 3px 10px; border-radius: 14px; font-size: 0.8rem; font-weight: 600;">Persistent Pain</span>
          </div>
          <p style="font-size: 0.86rem; color: #64748b; font-style: italic; margin: 0;">You do not need to know exactly what is causing your pain before coming in—part of the first visit is figuring that out together.</p>
        </div>

        <!-- 3 Steps -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 1.15rem; color: #173753; font-weight: 800; margin-bottom: 12px;">What to Expect at Your First Visit</h3>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; gap: 12px; align-items: flex-start; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 14px; border-radius: 8px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #0093d0; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; flex-shrink: 0;">1</div>
              <div><strong style="color: #173753; font-size: 0.9rem;">Understand Your Story:</strong> <span style="font-size: 0.86rem; color: #475569;">Explore symptoms, history, lifestyle, and goals.</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 14px; border-radius: 8px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #0093d0; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; flex-shrink: 0;">2</div>
              <div><strong style="color: #173753; font-size: 0.9rem;">Examine What Is Going On:</strong> <span style="font-size: 0.86rem; color: #475569;">Physical exam evaluating mobility, nerve function, and joint mechanics.</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 14px; border-radius: 8px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #0093d0; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; flex-shrink: 0;">3</div>
              <div><strong style="color: #173753; font-size: 0.9rem;">Build a Plan Together:</strong> <span style="font-size: 0.86rem; color: #475569;">Collaborative roadmap and hands-on treatment when appropriate on day one.</span></div>
            </div>
          </div>
        </div>

        <!-- FAQs -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 22px;">
          <h3 style="font-size: 1.15rem; color: #173753; font-weight: 800; margin-bottom: 12px;">Frequently Asked Questions</h3>
          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem; color: #334155;">
            <div>
              <strong style="color: #173753;">Does chiropractic care hurt?</strong>
              <p style="margin: 4px 0 0; color: #475569;">No. Treatment may occasionally feel briefly sensitive in guarded areas, but most patients experience it as pressure, stretching, or massage-like relief.</p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 8px;">
              <strong style="color: #173753;">Do I have to be adjusted or "cracked"?</strong>
              <p style="margin: 4px 0 0; color: #475569;">No. Adjustments are always optional. Treatment can include gentle joint mobilization, instrument-assisted techniques, soft-tissue work, and pain education.</p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 8px;">
              <strong style="color: #173753;">Will I have to come forever?</strong>
              <p style="margin: 4px 0 0; color: #475569;">No. Dr. Adam's goal is empowerment, not dependency. We give you tools and strategies to stay well independently.</p>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="https://beachealth.janeapp.com/" target="_blank" rel="noopener" class="btn btn-primary">Book Chiropractic</a>
          <a href="/chiropractic.html" class="btn btn-secondary">Learn More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    `
  },
  'dry-needling': {
    pageUrl: '/dry-needling.html',
    title: 'Dry Needling',
    portal: 'Beachealth Services',
    bookingUrl: 'https://beachealth.janeapp.com/#/acupuncture',
    image: '/images/dry-needling-hero.jpg',
    desc: 'Dry needling involves inserting a sterile, ultra-fine filament needle into myofascial trigger points—taut muscular bands that refer pain and restrict mobility. It produces a local twitch response, instantly relieving deep intramuscular spasms.',
    points: [
      'Immediate release of deep muscular knots',
      'Reduces neuro-inflammatory chemical buildup',
      'Speeds recovery in chronic pain and sports injuries',
      'Administered by certified Osteopaths and Chiropractors'
    ]
  }
};
SERVICE_DATA['clinical-pilates'] = SERVICE_DATA['physio-pilates'];

const BLOG_DATA = {
  'desk-posture-tech-neck': {
    title: 'The "Tech Neck" Myth: Why Movement Breaks Beat Perfect Posture',
    category: 'Chiropractic Care',
    author: 'Dr. Adam Bletsoe, Chiropractor',
    bookingUrl: 'https://beachealth.janeapp.com/',
    bookingLabel: 'Book Chiropractic Care',
    content: `
      <p>Walk through any coffee shop in The Beaches or scan a row of work-from-home setups, and you’ll see the exact same thing: heads craned forward, shoulders creeping toward ears, and spines curved into a gentle "C" shape over laptops. It’s natural to feel guilty about slouching. But here’s the clinical reality: <strong>there is no single "perfect posture" that your body is meant to freeze in for eight hours straight.</strong></p>
      <br>
      <h4>Why Freezing Like a Soldier Doesn’t Work</h4>
      <p>When people try to fix "bad posture," they often jerk their shoulder blades back, puff out their chest, and hold themselves rigid. Within fifteen minutes, muscles fatigue, upper back burning sets in, and they slump back down. That’s because posture isn’t a statue; it’s a dynamic state. Your cervical spine and upper thoracic joints are designed to move, lubricate, and share load through varied positions.</p>
      <br>
      <h4>The Mechanical Cost of the Forward Head Position</h4>
      <p>For every inch your head drifts forward past your shoulders, your neck muscles have to support an extra 10 pounds of gravitational weight. If your head is hanging forward at 45 degrees over a phone or lower screen, your suboccipital muscles and upper trapezius are effectively holding up the weight of a bowling ball all afternoon. Over weeks and months, that constant tension leads to facet joint irritation, chronic upper back knots, and tension headaches wrapping around your temples.</p>
      <br>
      <h4>Three Practical Fixes That Actually Work</h4>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>The 30-Minute Movement Snack:</strong> Instead of obsessing over sitting like a mannequin, set a gentle timer every 30 minutes. Stand up, roll your shoulders backward three times, tuck your chin gently (creating a mild double chin for three seconds), and sit back down. Movement resets tissue tension faster than posture braces.</li>
        <li><strong>Elevate Your Screen to Eye Level:</strong> If you use a laptop at your kitchen table or desk, elevate it on a riser or stack of books and plug in an external keyboard. Bringing the top third of your screen to eye level immediately eliminates 30 degrees of neck flexion.</li>
        <li><strong>Targeted Spinal Mobilization:</strong> When facet joints in the upper back and neck become locked or irritated from sustained positions, gentle chiropractic adjustments and joint mobilization restore normal glide and take protective pressure off surrounding muscles.</li>
      </ul>
      <br>
      <p>If you’ve been dealing with stubborn neck stiffness, burning between your shoulder blades, or afternoon headaches that ibuprofen barely touches, a thorough cervical spine assessment can pinpoint whether joint restriction or nervous system fatigue is driving the pain.</p>
    `
  },
  'sciatica-disc-relief': {
    title: 'Sciatica and Disc Bulges: Why You Don’t Have to Live in Fear of Bending',
    category: 'Chiropractic Care',
    author: 'Dr. Adam Bletsoe, Chiropractor',
    bookingUrl: 'https://beachealth.janeapp.com/',
    bookingLabel: 'Book Chiropractic Care',
    content: `
      <p>Few things are as unnerving as sharp, electric pain shooting down your buttock, hamstring, and into your calf. When patients in East Toronto visit our clinic with sciatica, they often arrive carrying an MRI report that reads like an eviction notice for their spine: <em>"L4-L5 disc protrusion," "lumbar degenerative disc disease,"</em> or <em>"mild canal narrowing."</em> The first thing they ask is, <em>"Is my back permanently damaged? Will I ever bend over or lift my kids again?"</em></p>
      <br>
      <h4>The Truth About Lumbar Discs</h4>
      <p>Here is what imaging reports rarely explain: spinal disc bulges are astonishingly common in people who have zero pain whatsoever. Large-scale MRI studies show that over 50% of healthy, pain-free 30-to-40-year-olds have bulging discs. Discs are tough, fibrocartilaginous shock absorbers—not delicate jelly donuts waiting to explode the moment you tie your shoes.</p>
      <br>
      <h4>Why Sciatica Flares Up</h4>
      <p>Sciatica isn't a disease; it’s a descriptive term meaning the sciatic nerve is chemically irritated or mechanically sensitized as it exits the lumbar spine. Acute flare-ups are usually driven by a combination of local inflammatory cytokines, sustained flexed sitting, and protective muscular guarding from the glutes and piriformis. The brain senses a threat and locks down the entire lower back into a rigid spasm.</p>
      <br>
      <h4>How We Decompress and Desensitize the Nerve</h4>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>Directional Preference & Decompression:</strong> Many disc-related sciatic irritations have a "directional preference." For instance, gentle prone extension exercises (like press-ups) often push the nuclear material forward and centralize pain, bringing it out of the leg and back toward the waistline—which is a major sign of healing.</li>
        <li><strong>Gentle Chiropractic Adjustments:</strong> Precise spinal adjustments to adjacent stiff sacroiliac (SI) and upper lumbar joints offload the irritated nerve root, reduce reflex muscle spasms, and restore fluid dynamics inside the spinal canal.</li>
        <li><strong>Nerve Gliding:</strong> Gentle neural mobilization drills slide the sciatic nerve through its anatomical tunnels without aggravating it, reducing scar-tissue tethering and restoring comfortable leg extension.</li>
      </ul>
      <br>
      <p>Most cases of sciatica resolve completely with non-invasive, conservative management within 6 to 12 weeks. You do not have to live in fear of your lower back; with the right movement strategy and chiropractic guidance, your spine can regain its full, resilient strength.</p>
    `
  },
  'cervicogenic-headaches-jaw': {
    title: 'Cervicogenic Headaches & Jaw Clenching: When Neck Tension Triggers Head Pain',
    category: 'Chiropractic Care',
    author: 'Dr. Adam Bletsoe, Chiropractor',
    bookingUrl: 'https://beachealth.janeapp.com/',
    bookingLabel: 'Book Chiropractic Care',
    content: `
      <p>Do you regularly wake up with a dull, throbbing band around your forehead or a gripping pressure at the base of your skull that creeps over one side of your head? Have you noticed that during stressful workdays, your jaw feels sore, your teeth clench tightly, and the headache intensifies by 3:00 PM?</p>
      <br>
      <h4>The Neck-Head-Jaw Connection Explained</h4>
      <p>Many patients spend years treating what they believe are chronic migraines or sinus pressure, cycling through pain medications with only fleeting relief. In many cases, the true source is <strong>cervicogenic headache</strong>—a headache where the primary pain generator lives in the upper three joints of the cervical spine (C1, C2, and C3) or the temporomandibular joint (TMJ).</p>
      <br>
      <p>Nerve signals from the top of your neck feed directly into the trigeminocervical nucleus—a major sensory relay station in the brainstem that also receives sensory input from your face, forehead, and jaw. When the upper neck joints become stiff or suboccipital muscles contract into chronic spasms, your brain can't distinguish where the irritation started and "refers" the pain forward into your temple, forehead, or behind your eyeball.</p>
      <br>
      <h4>Signs Your Headache Originates in Your Neck or Jaw:</h4>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li>Pain starts at the base of your skull and radiates upward in a "ram's horn" pattern over your head.</li>
        <li>Your headache is triggered or worsened by keeping your neck in one position (like working at a monitor) or turning your head fully to one side.</li>
        <li>You clench your teeth during sleep or catch yourself bracing your jaw during high-focus tasks.</li>
        <li>Pressure on the upper cervical joints or suboccipital muscles reproduces your exact headache symptoms.</li>
      </ul>
      <br>
      <h4>How Chiropractic Care Breaks the Cycle</h4>
      <p>By restoring gentle, targeted mobility to the restricted upper cervical vertebrae, chiropractic adjustments reduce the constant sensory overload bombarding the trigeminocervical nucleus. When combined with soft-tissue release of the masseter (jaw) muscles, pterygoids, and upper trapezius, the frequency and intensity of tension headaches drop dramatically—often providing clarity and relief that medication alone couldn’t deliver.</p>
    `
  },
  'chiropractic-joint-pop': {
    title: 'What Actually Happens When a Joint "Pops"? The Science of Adjustments',
    category: 'Chiropractic Science',
    author: 'Dr. Adam Bletsoe, Chiropractor',
    bookingUrl: 'https://beachealth.janeapp.com/',
    bookingLabel: 'Book Chiropractic Care',
    content: `
      <p>It’s the number one question new patients ask when visiting a chiropractor: <em>"What is that cracking sound? Are my bones grinding against each other?"</em></p>
      <br>
      <p>The short answer: <strong>No, your bones are not grinding, snapping, or cracking.</strong> In fact, the audible release heard during a spinal adjustment is completely natural, painless, and rooted in fascinating joint physics.</p>
      <br>
      <h4>The Physics of Cavitation (The Gas Bubble Effect)</h4>
      <p>Every movable joint in your spine (called a facet joint) is encased in a protective fibrous capsule filled with lubricating synovial fluid. This fluid contains dissolved gases, including nitrogen, oxygen, and carbon dioxide. Think of it like a sealed bottle of carbonated mineral water.</p>
      <br>
      <p>During a gentle, high-velocity low-amplitude (HVLA) chiropractic adjustment, the chiropractor applies a quick, precise stretch to the joint capsule. This sudden, slight increase in joint volume causes an instantaneous drop in internal fluid pressure. Because of this pressure vacuum, dissolved nitrogen gas rapidly comes out of solution and forms a microscopic gas bubble. The sudden release of this bubble is what produces the audible "pop"—a physical phenomenon known as <strong>cavitation</strong>.</p>
      <br>
      <h4>What Happens in Your Body Immediately Afterward?</h4>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>Instant Muscle Relaxation:</strong> Deep inside your joint capsules and surrounding spinal ligaments live specialized sensory nerve endings called mechanoreceptors and Golgi tendon organs. The quick stretch of an adjustment fires off a massive sensory volley to your spinal cord, which reflexively shuts down chronic protective muscle spasm (a process called the arthrokinetic reflex).</li>
        <li><strong>Endorphin & Neurochemical Release:</strong> Cavitation stimulates the production of natural pain-inhibiting endorphins and neurotensin, explaining the immediate feeling of lightness and tension relief patients report stepping off the table.</li>
        <li><strong>Restored Joint Glide:</strong> Facet joints that were restricted or slightly locked regain their natural physiological motion, allowing you to turn your head and bend your back with fluid freedom.</li>
      </ul>
      <br>
      <p>At Beachealth, adjustments are tailored to your comfort level. Whether you prefer traditional hands-on adjustments or gentler low-force mobilizations that don't involve any popping at all, the goal is always the same: restoring optimal mechanics so your body can heal itself.</p>
    `
  },
  'plantar-fasciitis-morning-heel-pain': {
    title: 'Morning Heel Stabbing Pain? The Real Story Behind Plantar Fasciitis',
    category: 'Chiropody & Foot Care',
    author: 'Lada Milos Lee, Registered Chiropodist',
    bookingUrl: 'https://beachesfootcare.janeapp.com/',
    bookingLabel: 'Book Foot Care',
    content: `
      <p>You wake up, swing your legs out of bed, and the moment your heel touches the floor, a sharp, stabbing sensation shoots through your arch like stepping directly onto a nail. You limp to the bathroom, and after five or ten minutes of walking around, the pain eases to a dull ache—only to flare right back up when you stand up after sitting through lunch.</p>
      <br>
      <p>Sound familiar? At Beaches Foot Care Centre, this is by far the most common condition we see. And while most people call it "plantar fasciitis," the medical reality is often misunderstood.</p>
      <br>
      <h4>Why It’s Often Not True "Inflammation"</h4>
      <p>The suffix <em>"-itis"</em> implies acute inflammation. However, clinical biopsies of long-standing heel pain consistently show an absence of inflammatory cells. Instead, chronic heel pain is usually <strong>plantar fasciosis</strong>: microscopic tearing, collagen disorganization, and diminished blood flow at the point where the plantar fascia attaches to the calcaneus (heel bone).</p>
      <br>
      <p>During the night while you sleep, your foot naturally rests in a pointed, relaxed position (plantarflexion). The micro-tears attempt to knit back together in a shortened state. When you take your first morning step, your entire body weight forcefully yanks that newly repaired tissue open—triggering immediate, sharp pain.</p>
      <br>
      <h4>Why Calf Stretching Alone Rarely Solves It</h4>
      <p>Many patients spend months rolling their foot on frozen water bottles or stretching their calves against a wall without lasting results. While calf flexibility matters, plantar fascia strain is almost always driven by an underlying biomechanical fault—such as excessive subtalar pronation (flattening arches that overstretch the fascia) or a high, rigid cavus arch that cannot absorb ground impact forces walking along hard pavement or boardwalks.</p>
      <br>
      <h4>Clinical Solutions That Create Lasting Relief</h4>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>Custom Biomechanical Orthotics:</strong> By capturing a precise 3D cast of your foot in its subtalar neutral position, custom orthotics support the medial longitudinal arch, prevent excess fascia elongation, and disperse heel strike pressures.</li>
        <li><strong>Radial Shockwave Therapy:</strong> For chronic, stubborn cases, shockwave delivers acoustic soundwaves deep into the degenerative fascia tissue, stimulating neovascularization (new blood vessel growth) and jumpstarting real collagen remodeling.</li>
        <li><strong>Footwear Audit & Night Splinting:</strong> Wearing supportive, rigid-soled indoor footwear (rather than walking barefoot on hardwood or tile floors) prevents repeated micro-trauma while tissue heals.</li>
      </ul>
      <br>
      <p>You don't have to limp through your mornings. An in-depth chiropody evaluation can identify whether mechanical strain, footwear, or tissue degeneration is driving your heel pain and map out a clear path to pain-free walking.</p>
    `
  },
  'custom-orthotics-vs-store-insoles': {
    title: 'Custom Orthotics vs. Pharmacy Insoles: What Makes the Difference?',
    category: 'Chiropody & Orthotics',
    author: 'Lada Milos Lee, Registered Chiropodist',
    bookingUrl: 'https://beachesfootcare.janeapp.com/',
    bookingLabel: 'Book Foot Care',
    content: `
      <p>Step into any pharmacy or sporting goods store, and you’ll find entire aisles lined with memory foam insoles, gel cups, and arch support inserts promising instant relief for aching feet. At $30 to $60 a pair, they sound like a tempting alternative to custom medical orthotics prescribed by a licensed Chiropodist. So what are you actually paying for—and does your body truly need custom correction?</p>
      <br>
      <h4>When Over-the-Counter Insoles Are Totally Fine</h4>
      <p>Let’s be honest: over-the-counter (OTC) inserts have their place. If you have reasonably neutral foot mechanics and your main issue is foot fatigue from standing on concrete floors at work, a basic cushioning insole can provide pleasant shock absorption. Think of OTC insoles like non-prescription reading glasses from a drugstore: they magnify slightly, and for mild tiredness, they might suffice.</p>
      <br>
      <h4>Where Store-Bought Inserts Fall Short</h4>
      <p>The major limitation of store-bought inserts is that they are mass-manufactured on a generic average arch mold using compressible foams. They offer soft cushioning, but <strong>cushioning is not mechanical correction</strong>. If your foot collapses inward (overpronation), your heel tilts, or your first metatarsophalangeal joint is jamming during push-off, soft foam will simply compress under your body weight within a few weeks, doing nothing to alter abnormal kinetic torque traveling up into your shins, knees, and hips.</p>
      <br>
      <h4>The Anatomy of a Prescription Custom Orthotic</h4>
      <p>A true custom orthotic is a regulated medical device engineered from a non-weight-bearing 3D anatomical model of your foot captured by a registered Chiropodist. Here is how custom orthotics solve root-cause biomechanics:</p>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>Subtalar Joint Neutral Alignment:</strong> We capture your foot in its ideal anatomical neutral position—not the deformed, flattened position it takes when you stand on a generic scanning mat at a shoe store.</li>
        <li><strong>Prescribed Rigidity & Materials:</strong> Depending on your weight, activity level (e.g. running along the Martin Goodman Trail vs. everyday dress shoes), and pathology, the orthotic shell is crafted from semi-rigid polypropylene, carbon composite, or dual-density EVA designed to resist specific torsional forces.</li>
        <li><strong>Targeted Biomechanical Accommodations:</strong> We incorporate custom metatarsal pads, deep heel cups, medial rearfoot posting, or first-ray cutouts to offload bunions, neuroma impingements, or Achilles tendon overload.</li>
      </ul>
      <br>
      <p>Most private extended health insurance plans in Ontario cover custom orthotics when prescribed and dispensed by a licensed Chiropodist. If you’re struggling with recurring shin splints, runner’s knee, or persistent arch pain, a comprehensive biomechanical gait assessment will tell you exactly what your feet require.</p>
    `
  },
  'ingrown-toenail-clinical-relief': {
    title: 'Stop "Bathroom Surgery": Safe, Permanent Relief for Ingrown Toenails',
    category: 'Chiropody & Foot Care',
    author: 'Lada Milos Lee, Registered Chiropodist',
    bookingUrl: 'https://beachesfootcare.janeapp.com/',
    bookingLabel: 'Book Foot Care',
    content: `
      <p>Almost everyone who has suffered from an ingrown toenail (onychocryptosis) has tried it at least once: sitting on the edge of the bathtub with nail clippers, tweezers, or manicure scissors, desperately trying to dig out the sharp corner of nail that is stabbing into the red, tender skin of the big toe.</p>
      <br>
      <p>Unfortunately, this "bathroom surgery" almost always makes things worse. When you blindly clip down the side of a curved toenail, it’s virtually impossible to reach the deep base. You end up leaving behind a jagged, microscopic spike of nail (a spicule). As the nail continues to grow forward, that hidden spike digs deeper into the surrounding flesh, triggering acute bacterial infection, throbbing swelling, and hypergranulation tissue.</p>
      <br>
      <h4>Why Do Toenails Become Ingrown?</h4>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>Improper Trimming:</strong> Rounding or tapering the edges of your toenails down into the corners encourages the nail border to curve and pierce the periungual skin. Toenails should always be cut straight across.</li>
        <li><strong>Tight Footwear:</strong> Shoes with narrow, pointed toe boxes or tight athletic footwear compress the toes together, jamming the lateral nail fold against the hard nail plate.</li>
        <li><strong>Natural Involuted or Pincer Anatomy:</strong> Many individuals genetically have curved, C-shaped nail plates that naturally direct nail growth into the nail sulcus.</li>
        <li><strong>Repetitive Micro-Trauma:</strong> Runners, soccer players, and hikers frequently jam their toes into the front of their shoes on downhill descents, causing micro-damage to the nail bed.</li>
      </ul>
      <br>
      <h4>How a Chiropodist Fixes It Safely</h4>
      <p>At Beaches Foot Care Centre, you have two clear, clinically proven pathways:</p>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>Conservative Clinical Debridement:</strong> For early-stage ingrowns, a chiropodist uses sterile, medical-grade instruments to gently clear the offending nail border, resect the spike without cutting healthy skin, and pack the sulcus with soothing antiseptic relief. There is no downtime, and pain relief is usually immediate.</li>
        <li><strong>Permanent Partial Nail Avulsion (PNA):</strong> For chronic, recurring ingrowns that keep coming back, we perform a minor in-clinic procedure under local anesthesia. We gently remove only the narrow 2mm sliver of offending nail border (leaving the rest of your nail looking completely normal and intact) and apply a gentle chemical agent (phenol) to the nail matrix. This prevents that tiny edge from ever growing back, permanently ending the cycle with a 98% success rate.</li>
      </ul>
      <br>
      <p>You don't have to suffer with throbbing toes or dread putting on running shoes. Book an assessment with a licensed Chiropodist to resolve painful toenails safely and permanently.</p>
    `
  },
  'diabetic-foot-care-prevention': {
    title: 'Diabetic Foot Health: Simple Daily Checks That Prevent Complications',
    category: 'Chiropody & Foot Care',
    author: 'Lada Milos Lee, Registered Chiropodist',
    bookingUrl: 'https://beachesfootcare.janeapp.com/',
    bookingLabel: 'Book Foot Care',
    content: `
      <p>If you or someone you love lives with Type 1 or Type 2 diabetes, you’ve likely been told that taking care of your feet is critical. Yet many patients are never clearly taught <em>why</em> the feet are so vulnerable, or what specific warning signs require urgent attention.</p>
      <br>
      <h4>The Dual Challenge: Neuropathy and Circulation</h4>
      <p>Over time, elevated blood glucose levels can affect two vital systems in your lower extremities:</p>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>Diabetic Peripheral Neuropathy (Loss of Sensation):</strong> Microvascular changes can damage the fine sensory nerve fibers that transmit pain. When neuropathy develops, you may not feel a pebble inside your shoe, a blister from tight socks, or the pressure of a thickened callous. Pain is the body’s warning siren—without it, minor skin breakdown can go unnoticed for days.</li>
        <li><strong>Peripheral Arterial Disease (Reduced Blood Flow):</strong> Diabetes can narrow small arteries, reducing blood circulation to the toes. Without adequate blood supply and oxygen, even a small scratch or crack in the heel heals very slowly, dramatically increasing the risk of infection.</li>
      </ul>
      <br>
      <h4>The Golden Rules of Daily At-Home Foot Care</h4>
      <p>Incorporating a simple two-minute daily routine can prevent over 85% of diabetes-related foot complications:</p>
      <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
        <li><strong>The Daily Mirror Inspection:</strong> Every evening before bed, inspect the tops, bottoms, and between the toes of both feet under good lighting. If you have difficulty bending, place a handheld mirror on the floor or ask a family member to check for redness, blisters, or breaks in the skin.</li>
        <li><strong>Never Walk Barefoot:</strong> Even indoors on carpet or hardwood, always wear supportive, hard-soled slippers or shoes. A stray sewing pin, pet claw, or sharp piece of debris can cause a puncture wound that goes unfelt.</li>
        <li><strong>Moisturize the Heels, Never Between the Toes:</strong> Apply a urea-based foot cream to the heels and soles to prevent deep skin fissures. However, avoid applying cream between the toes, as excess moisture in those skin folds can foster fungal infections.</li>
        <li><strong>Never Use Drugstore Callous Acids or Blades:</strong> Over-the-counter salicylic acid callous pads and razor blades can cause chemical burns and deep wounds on diabetic skin. Always have callouses reduced by a licensed Chiropodist using autoclave-sterilized instruments.</li>
      </ul>
      <br>
      <h4>The Role of Routine Chiropody Checkups</h4>
      <p>At Beaches Foot Care Centre, our comprehensive diabetic foot assessments include non-invasive neurological monofilament testing, Doppler vascular pulses evaluation, dermatological checks, and safe, medical-grade toenail maintenance. Regular preventative visits ensure your feet stay healthy, comfortable, and active for years to come.</p>
    `
  }
};

/* "Dr. Adam Bletsoe" -> "Dr. Adam", "Lada Milos Lee" -> "Lada" */
function shortName(name) {
  if (name.includes('Adriana Lis')) return 'Adriana Lis Pereira';
  const parts = name.split(' ');
  return parts[0].endsWith('.') ? parts.slice(0, 2).join(' ') : parts[0];
}

/* Lock page scroll behind drawers/modals. The page scrolls on <html>
   (it has overflow-x: hidden), so both html and body must be locked. */
function setScrollLock(locked) {
  const root = document.documentElement;
  if (locked) {
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.setProperty('--scrollbar-width', `${scrollbar}px`);
    root.classList.add('scroll-locked');
  } else {
    root.classList.remove('scroll-locked');
  }
}

function getServiceUrlForTeam(id) {
  if (!id) return null;
  if (id.includes('adam') || id.includes('chiro')) return '/chiropractic.html';
  if (id.includes('jared') || id.includes('osteo')) return '/osteopathy.html';
  if (id.includes('shakiba') || id.includes('amin') || id.includes('physio')) return '/physiotherapy.html';
  if (id.includes('lis') || id.includes('pilates')) return '/clinical-pilates.html';
  if (id.includes('lada') || id.includes('foot')) return '/chiropody.html';
  if (id.includes('patrice') || id.includes('krystele') || id.includes('massage')) return '/massage-therapy.html';
  return null;
}

function initModals() {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-body-container') || document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close-btn') || document.getElementById('modal-close');

  if (!modalOverlay || !modalContent) return;

  let lastTrigger = null;

  function closeModal() {
    if (!modalOverlay.classList.contains('open')) return;
    modalOverlay.classList.remove('open');
    setScrollLock(false);
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
  }

  function openModal(html) {
    lastTrigger = document.activeElement;
    modalContent.innerHTML = html;
    modalContent.scrollTop = 0; // always open at the top
    modalOverlay.classList.add('open');
    setScrollLock(true);
    if (modalClose) modalClose.focus({ preventScroll: true });
    // Close buttons inside injected content (e.g. policy "Understood")
    modalContent.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', closeModal));
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });

  // Global Keydown Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  // 1. Team Bio Modals
  document.querySelectorAll('[data-team-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.getAttribute('data-team-id');
      const member = TEAM_DATA[id];
      if (member.customHtml) {
        openModal(member.customHtml);
        return;
      }

      const html = `
        <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
          <img src="${member.image}" alt="${member.name}" style="width: 140px; height: 160px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.1);" />
          <div style="flex: 1; min-width: 220px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #0093d0; text-transform: uppercase;">${member.portal || 'Practitioner Profile'}</div>
            <h3 style="font-size: 1.6rem; color: #173753; margin: 4px 0 8px;">${member.name}</h3>
            <p style="font-size: 0.95rem; font-weight: 600; color: #64748b; margin-bottom: 14px;">${member.role}</p>
            <a href="${member.bookingUrl || 'https://beachealth.janeapp.com/'}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Book with ${shortName(member.name)}</a>
          </div>
        </div>
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 1rem; line-height: 1.7; color: #334155;">
          ${member.bio}
          ${(() => {
            const sUrl = member.serviceUrl || getServiceUrlForTeam(id);
            return sUrl ? `
              <div style="margin-top: 16px;">
                <a href="${sUrl}" style="color: #0093d0; font-weight: 700; text-decoration: underline;">Learn More →</a>
              </div>
            ` : '';
          })()}
        </div>
      `;
      openModal(html);
    });
  });

  // Make entire team card clickable to open bio modal (while preserving direct booking link)
  document.querySelectorAll('.team-card').forEach(card => {
    const btn = card.querySelector('.service-btn-details[data-team-id], [data-team-id]');
    if (!btn) return;
    card.style.cursor = 'pointer';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View bio for ${card.querySelector('.team-name')?.textContent || 'practitioner'}`);
    
    card.addEventListener('click', e => {
      // If clicking directly on an anchor link (e.g. "Book Now"), allow standard navigation
      if (e.target.closest('a')) return;
      // If clicking the button itself, allow its click handler to fire naturally
      if (e.target.closest('[data-team-id]') === btn) return;
      
      e.preventDefault();
      btn.click();
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a') || e.target.closest('button')) return;
        e.preventDefault();
        btn.click();
      }
    });
  });

  // 2. Service Detail Modals
  document.querySelectorAll('[data-service-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.getAttribute('data-service-id');
      const service = SERVICE_DATA[id];
      if (!service) return;

      if (false && service.customHtml) {
        openModal(service.customHtml);
        return;
      }

      const pointsHtml = service.points.map(p => `
        <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${p}</span>
        </li>
      `).join('');

      const html = `
        <div>
          <img src="${service.image}" alt="${service.title}" style="width: 100%; height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />
          <h3 style="font-size: 1.6rem; color: #173753; margin-bottom: 12px;">${service.title}</h3>
          <p style="font-size: 1.02rem; line-height: 1.65; color: #334155; margin-bottom: 20px;">${service.desc}</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <h4 style="font-size: 1rem; color: #173753; margin-bottom: 12px; font-weight: 700;">Clinical Focus & Benefits:</h4>
            <ul style="font-size: 0.95rem; color: #334155;">${pointsHtml}</ul>
          </div>
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <a href="${service.bookingUrl || 'https://beachealth.janeapp.com/'}" target="_blank" rel="noopener" class="btn btn-primary">Book Now</a>
            ${service.pageUrl ? `<a href="${service.pageUrl}" class="btn btn-secondary">Learn More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>` : ''}
            <a href="tel:4165464887" class="btn btn-outline-dark">Call (416) 546-4887</a>
          </div>
        </div>
      `;
      openModal(html);
    });
  });

  // Make entire service card clickable to open service modal (while preserving direct booking link)
  document.querySelectorAll('.service-card').forEach(card => {
    const btn = card.querySelector('.service-btn-details[data-service-id], [data-service-id]');
    if (!btn) return;
    card.style.cursor = 'pointer';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View details for ${card.querySelector('.service-title')?.textContent || 'service'}`);
    
    card.addEventListener('click', e => {
      // If clicking directly on an anchor link (e.g. "Book Now"), allow standard navigation
      if (e.target.closest('a')) return;
      // If clicking the button itself, allow its click handler to fire naturally
      if (e.target.closest('[data-service-id]') === btn) return;
      
      e.preventDefault();
      btn.click();
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a') || e.target.closest('button')) return;
        e.preventDefault();
        btn.click();
      }
    });
  });

  // 3. Blog Reader Modals & Card Clickability
  document.querySelectorAll('.blog-card').forEach(card => {
    const btn = card.querySelector('.blog-btn[data-blog-id]');
    if (!btn) return;
    card.style.cursor = 'pointer';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Read article: ${card.querySelector('.blog-title')?.textContent || 'blog post'}`);

    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      if (e.target.closest('[data-blog-id]') === btn) return;
      e.preventDefault();
      btn.click();
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a') || e.target.closest('button')) return;
        e.preventDefault();
        btn.click();
      }
    });
  });

  document.querySelectorAll('[data-blog-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.getAttribute('data-blog-id');
      const post = BLOG_DATA[id];
      if (!post) return;

      const bookingUrl = post.bookingUrl || 'https://beachealth.janeapp.com/';
      const bookingLabel = post.bookingLabel || 'Book Online';
      const authorText = post.author ? `<div style="font-size: 0.88rem; color: #64748b; margin: 4px 0 16px; font-weight: 600;">By ${post.author}</div>` : '';

      const html = `
        <div>
          <span style="color: #0093d0; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${post.category}</span>
          <h3 style="font-size: 1.6rem; color: #173753; margin: 8px 0 4px; line-height: 1.3;">${post.title}</h3>
          ${authorText}
          <div style="font-size: 1.02rem; line-height: 1.7; color: #334155; margin-bottom: 28px;">
            ${post.content}
          </div>
          <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
            <div>
              <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 2px;">Have questions about this condition?</p>
              <h5 style="color: #173753; font-size: 1.05rem;">Schedule an evaluation with our clinical team.</h5>
            </div>
            <a href="${bookingUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">${bookingLabel}</a>
          </div>
        </div>
      `;
      openModal(html);
    });
  });

  // 4. Booking Quick Dialog Modal (Two JaneApp Portals)
  document.querySelectorAll('[data-open-booking]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const html = `
        <div style="text-align: center;">
          <div style="width: 54px; height: 54px; border-radius: 50%; background: #e6f4fb; color: #0093d0; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <h3 style="font-size: 1.65rem; color: #173753; margin-bottom: 8px; font-weight: 800;">Select Booking Portal</h3>
          <p style="color: #64748b; font-size: 0.95rem; max-width: 480px; margin: 0 auto 24px; line-height: 1.5;">Our clinic operates two separate JaneApp schedules. Please choose the service department you wish to book:</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px; text-align: left;">
            
            <!-- Portal 1: Beachealth Clinic -->
            <div style="border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px 18px; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s;" onmouseover="this.style.borderColor='#0093d0'; this.style.boxShadow='0 8px 24px rgba(0,147,208,0.15)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
              <div>
                <div style="display: flex; align-items: center; justify-content: flex-end; margin-bottom: 10px;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h4 style="font-size: 1.2rem; color: #173753; font-weight: 800; margin-bottom: 6px;">Beachealth Services</h4>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 14px; line-height: 1.4;">Multi-disciplinary manual therapy, spinal rehab, and sports recovery.</p>
                <ul style="font-size: 0.84rem; color: #334155; margin-bottom: 18px; display: flex; flex-direction: column; gap: 6px;">
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Osteopathy</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Chiropractic Care</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Physiotherapy &amp; Clinical Pilates</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Massage Therapy</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Shockwave</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Dry Needle</li>
                </ul>
              </div>
              <a href="https://beachealth.janeapp.com/" target="_blank" rel="noopener" class="btn btn-primary" style="width: 100%; text-align: center; justify-content: center; font-size: 0.9rem; padding: 10px 16px;">
                Book Beachealth Services
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>

            <!-- Portal 2: Beaches Foot Care Centre -->
            <div style="border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px 18px; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s;" onmouseover="this.style.borderColor='#0093d0'; this.style.boxShadow='0 8px 24px rgba(0,147,208,0.15)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
              <div>
                <div style="display: flex; align-items: center; justify-content: flex-end; margin-bottom: 10px;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="2"><path d="M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1"/><path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M12 4v8"/></svg>
                </div>
                <h4 style="font-size: 1.2rem; color: #173753; font-weight: 800; margin-bottom: 6px;">Beaches Foot Care Centre</h4>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 14px; line-height: 1.4;">Registered Chiropody, nail and skin care, and bespoke orthotics.</p>
                <ul style="font-size: 0.84rem; color: #334155; margin-bottom: 18px; display: flex; flex-direction: column; gap: 6px;">
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Chiropody and Foot Care</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Custom Biomechanical Orthotics</li>
                </ul>
              </div>
              <a href="https://beachesfootcare.janeapp.com/" target="_blank" rel="noopener" class="btn btn-primary" style="width: 100%; text-align: center; justify-content: center; font-size: 0.9rem; padding: 10px 16px;">
                Book Beaches Foot Care
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>

          </div>

          <div style="background: #f8fafc; padding: 14px 18px; border-radius: 10px; font-size: 0.88rem; color: #475569; border: 1px solid #e2e8f0; display: inline-flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>Prefer to book by phone? Call reception at <a href="tel:4165464887" style="color: #0093d0; font-weight: 700; text-decoration: underline;">(416) 546-4887</a></span>
          </div>
        </div>
      `;
      openModal(html);
    });
  });

  // 5. Clinic Policy Modals (PHIPA Privacy, Terms, Cancellation)
  const POLICY_DATA = {
    'privacy': {
      title: 'Privacy Policy',
      subtitle: 'Ontario PHIPA & PIPEDA Regulatory Standards',
      content: `
        <p style="margin-bottom: 14px;">At Beachealth and Beaches Foot Care Centre, safeguarding your personal health information (PHI) is fundamental to our clinical practice. We adhere strictly to Ontario's <em>Personal Health Information Protection Act, 2004 (PHIPA)</em> and Canada's PIPEDA framework.</p>
        <h5 style="color: #173753; font-weight: 700; margin: 16px 0 8px; font-size: 1rem;">Collection & Purpose</h5>
        <p style="margin-bottom: 14px;">We collect relevant medical history, practitioner notes, and insurance information exclusively to provide coordinated multidisciplinary rehabilitation, ensure patient safety, and process direct insurance billing.</p>
        <h5 style="color: #173753; font-weight: 700; margin: 16px 0 8px; font-size: 1rem;">Electronic Medical Records Security</h5>
        <p style="margin-bottom: 14px;">All patient records and booking information are encrypted and hosted within SOC-2 certified Canadian cloud servers (Jane Software). Only your direct healthcare providers and clinic reception coordinators have authorized access.</p>
        <h5 style="color: #173753; font-weight: 700; margin: 16px 0 8px; font-size: 1rem;">Accessing Your Records</h5>
        <p>You have the right to review and request copies of your clinical files at any time. For questions regarding our privacy practices, contact our Privacy Officer at <a href="mailto:admin@beachealth.com" style="color: #0093d0; font-weight: 600;">admin@beachealth.com</a> or <a href="tel:4165464887" style="color: #0093d0; font-weight: 600;">(416) 546-4887</a>.</p>
      `
    },
    'terms': {
      title: 'Terms of Service',
      subtitle: 'Patient Care Agreements & Clinic Standards',
      content: `
        <p style="margin-bottom: 14px;">Welcome to Beachealth. By scheduling an appointment or using our healthcare services, you agree to the following terms:</p>
        <h5 style="color: #173753; font-weight: 700; margin: 16px 0 8px; font-size: 1rem;">Regulated Healthcare Professionals</h5>
        <p style="margin-bottom: 14px;">All assessments and treatments are delivered by independent practitioners licensed and registered with their respective Ontario Colleges (College of Chiropodists of Ontario, College of Chiropractors of Ontario, College of Massage Therapists of Ontario, Ontario Association of Osteopathic Manual Practitioners). Informed consent is gathered prior to any evaluation or therapeutic treatment.</p>
        <h5 style="color: #173753; font-weight: 700; margin: 16px 0 8px; font-size: 1rem;">Direct Billing & Fees</h5>
        <p style="margin-bottom: 14px;">Patients are responsible for payment of services at the time of their appointment. We provide direct billing to all major extended health insurance providers (Sun Life, Manulife, Canada Life, Green Shield, Desjardins, etc.). Any unpaid balance remains the patient's responsibility.</p>
        <h5 style="color: #173753; font-weight: 700; margin: 16px 0 8px; font-size: 1rem;">Safe Clinic Environment</h5>
        <p>Beachealth is committed to providing an inclusive, harassment-free environment for all patients, clinical practitioners, and administrative staff.</p>
      `
    },
    'cancellation': {
      title: 'Cancellation Policy',
      subtitle: '24-Hour Notice Guideline',
      content: `
        <p style="margin-bottom: 14px;">Our clinical practitioners reserve dedicated, one-on-one appointment time specifically for your rehabilitation. When an appointment is missed or cancelled without adequate notice, another patient awaiting care is unable to receive treatment.</p>
        <h5 style="color: #173753; font-weight: 700; margin: 16px 0 8px; font-size: 1rem;">24 Hours Advance Notice Required</h5>
        <p style="margin-bottom: 14px;">We kindly request at least <strong>24 hours notice</strong> to cancel or reschedule your visit. You can manage appointments 24/7 through your JaneApp account, or by contacting our front desk at <a href="tel:4165464887" style="color: #0093d0; font-weight: 600;">(416) 546-4887</a> or <a href="mailto:admin@beachealth.com" style="color: #0093d0; font-weight: 600;">admin@beachealth.com</a>.</p>
        <h5 style="color: #173753; font-weight: 700; margin: 16px 0 8px; font-size: 1rem;">Late Cancellation & No-Show Fees</h5>
        <p style="margin-bottom: 14px;">Appointments cancelled with less than 24 hours notice or missed without notification may be subject to a fee up to the full value of the scheduled service. Please note that extended health insurance plans do not reimburse missed appointment fees.</p>
        <h5 style="color: #173753; font-weight: 700; margin: 16px 0 8px; font-size: 1rem;">Unforeseen Circumstances</h5>
        <p>We recognize that genuine emergencies and unexpected illnesses happen. Please reach out to our team promptly so we can accommodate your situation with compassion.</p>
      `
    }
  };

  document.querySelectorAll('[data-policy-id]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const id = link.getAttribute('data-policy-id');
      const policy = POLICY_DATA[id];
      if (!policy) return;

      const html = `
        <div>
          <span style="color: #0093d0; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Clinic Policy</span>
          <h3 style="font-size: 1.65rem; color: #173753; margin: 8px 0 4px; font-weight: 800;">${policy.title}</h3>
          <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 20px;">${policy.subtitle}</p>
          <div style="font-size: 0.98rem; line-height: 1.7; color: #334155;">
            ${policy.content}
          </div>
          <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end;">
            <button type="button" class="btn btn-primary btn-sm" data-modal-close>Understood</button>
          </div>
        </div>
      `;
      openModal(html);
    });
  });
}

/* ==========================================================================
   5. CONTACT FORM (VALIDATION, ERROR & SUCCESS MESSAGES)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('toast-notification');
  const alertContainer = document.getElementById('form-alert-container');

  if (!form) return;

  const nameInput = document.getElementById('user-name');
  const emailInput = document.getElementById('user-email');
  const messageInput = document.getElementById('user-message');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  function clearErrors() {
    [nameInput, emailInput, messageInput].forEach(input => {
      if (input) {
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
      }
    });
    [nameError, emailError, messageError].forEach(err => {
      if (err) {
        err.style.display = 'none';
        err.textContent = '';
      }
    });
    if (alertContainer) alertContainer.innerHTML = '';
  }

  function setError(input, errorEl, message) {
    if (input) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  // Clear individual field errors on user input
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.classList.remove('is-invalid');
      if (nameError) nameError.style.display = 'none';
      if (alertContainer) alertContainer.innerHTML = '';
    });
  }
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('is-invalid');
      if (emailError) emailError.style.display = 'none';
      if (alertContainer) alertContainer.innerHTML = '';
    });
  }
  if (messageInput) {
    messageInput.addEventListener('input', () => {
      messageInput.classList.remove('is-invalid');
      if (messageError) messageError.style.display = 'none';
      if (alertContainer) alertContainer.innerHTML = '';
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const messageVal = messageInput ? messageInput.value.trim() : '';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasError = false;
    let firstInvalidInput = null;

    if (!nameVal || nameVal.length < 2) {
      setError(nameInput, nameError, 'Please enter your full name (at least 2 characters).');
      hasError = true;
      if (!firstInvalidInput) firstInvalidInput = nameInput;
    }

    if (!emailVal || !emailPattern.test(emailVal)) {
      setError(emailInput, emailError, 'Please provide a valid email address (e.g. name@domain.com).');
      hasError = true;
      if (!firstInvalidInput) firstInvalidInput = emailInput;
    }

    if (!messageVal || messageVal.length < 5) {
      setError(messageInput, messageError, 'Please enter your message or inquiry (at least 5 characters).');
      hasError = true;
      if (!firstInvalidInput) firstInvalidInput = messageInput;
    }

    if (hasError) {
      if (alertContainer) {
        alertContainer.innerHTML = `
          <div class="form-alert-error" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>Please complete all highlighted fields accurately before submitting.</span>
          </div>
        `;
      }
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }

    const phoneInput = document.getElementById('user-phone');
    const serviceInput = document.getElementById('user-service');
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    const serviceVal = serviceInput ? serviceInput.options[serviceInput.selectedIndex].text : 'General Inquiry';

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Redirecting inquiry to admin@beachealth.com...';
    submitBtn.disabled = true;

    // 1. Asynchronous dispatch to FormSubmit.co for admin@beachealth.com
    fetch('https://formsubmit.co/ajax/admin@beachealth.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: nameVal,
        email: emailVal,
        phone: phoneVal || 'Not provided',
        service: serviceVal,
        message: messageVal,
        _subject: `New Patient Website Inquiry: ${nameVal} (${serviceVal})`,
        _template: 'table'
      })
    }).catch(err => {
      console.warn('FormSubmit notice:', err);
    });

    // 2. Build prefilled mailto composer directed to admin@beachealth.com
    const mailSubject = encodeURIComponent(`New Patient Inquiry: ${nameVal} - ${serviceVal}`);
    const mailBody = encodeURIComponent(
`Hello Beachealth Reception,

You have received a new inquiry from the clinic website contact form:

• Patient Name: ${nameVal}
• Email: ${emailVal}
• Phone: ${phoneVal || 'Not provided'}
• Interested Service: ${serviceVal}

Message:
${messageVal}

---
Sent via Beachealth Website (https://beachealth.com)`
    );
    const mailtoUrl = `mailto:admin@beachealth.com?subject=${mailSubject}&body=${mailBody}`;

    // 3. Trigger redirect to user's default email client
    setTimeout(() => {
      try {
        window.location.href = mailtoUrl;
      } catch (e) {
        console.warn('Mailto redirect notice:', e);
      }
    }, 450);

    setTimeout(() => {
      const parentCard = form.parentElement;
      const userNameSafe = nameVal.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Render clean Success Card with direct email links
      parentCard.innerHTML = `
        <div class="form-success-card">
          <div style="width: 58px; height: 58px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h4 style="margin-bottom: 8px;">Inquiry Redirected to admin@beachealth.com</h4>
          <p style="margin-bottom: 18px;">Thank you, <strong>${userNameSafe}</strong>! Your inquiry has been routed directly to <strong style="color: #0093d0;"><a href="mailto:admin@beachealth.com" style="text-decoration: underline;">admin@beachealth.com</a></strong>. A clinic coordinator will reply within 1 business day.</p>
          
          <div style="background: #ffffff; padding: 18px; border-radius: 12px; border: 1px solid #bbf7d0; margin-bottom: 22px; text-align: left;">
            <div style="font-weight: 700; color: #173753; margin-bottom: 6px;">Sent Directly to Clinic Email</div>
            <p style="font-size: 0.88rem; color: #4b5563; margin-bottom: 14px;">If your email application did not launch automatically, you can open it with all your details prefilled:</p>
            
            <a href="${mailtoUrl}" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 14px; text-decoration: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Open in Mail App to admin@beachealth.com
            </a>

            <div style="border-top: 1px dashed #cbd5e1; padding-top: 12px; display: flex; gap: 10px; flex-wrap: wrap;">
              <a href="tel:4165464887" class="btn btn-secondary btn-sm">Call (416) 546-4887</a>
              <button class="btn btn-outline-dark btn-sm" id="btn-success-book">Book Online</button>
            </div>
          </div>

          <button type="button" class="btn btn-outline-dark btn-sm" id="btn-send-another">Send Another Message</button>
        </div>
      `;

      // Trigger JaneApp booking modal from success card
      const successBookBtn = document.getElementById('btn-success-book');
      if (successBookBtn) {
        successBookBtn.addEventListener('click', e => {
          e.preventDefault();
          const firstOpenBooking = document.querySelector('[data-open-booking]');
          if (firstOpenBooking) firstOpenBooking.click();
        });
      }

      // Reconnect Send Another Message button
      const resetBtn = document.getElementById('btn-send-another');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          window.location.reload();
        });
      }

      // Show toast notice
      if (toast) {
        toast.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Inquiry routed to admin@beachealth.com!</span>
          </div>
        `;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 5000);
      }
    }, 600);
  });
}

/* ==========================================================================
   6. REVIEWS SLIDER (PATIENT REVIEWS CAROUSEL)
   ========================================================================== */
const GOOGLE_BUSINESS_PROFILE_URL = 'https://www.google.com/maps/search/?api=1&query=Beachealth+350+Beech+Ave+Toronto';

function initReviewsSlider() {
  const track = document.querySelector('.reviews-track');
  const prevBtn = document.querySelector('.reviews-prev');
  const nextBtn = document.querySelector('.reviews-next');
  const cards = document.querySelectorAll('.review-slide-card');

  if (!track || !cards.length) return;

  function getStep() {
    const card = cards[0];
    const gap = 24;
    return card ? card.offsetWidth + gap : 360;
  }

  function scrollNext() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 15) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: getStep(), behavior: 'smooth' });
    }
  }

  function scrollPrev() {
    if (track.scrollLeft <= 15) {
      const maxScroll = track.scrollWidth - track.clientWidth;
      track.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: -getStep(), behavior: 'smooth' });
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoScroll('manual');
      scrollNext();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoScroll('manual');
      scrollPrev();
    });
  }

  // Automatic scrolling until pressed on them
  let autoScrollTimer = null;
  let isStopped = false;

  function stopAutoScroll(reason) {
    if (isStopped) return;
    isStopped = true;
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  function startAutoScroll() {
    if (autoScrollTimer) clearInterval(autoScrollTimer);
    autoScrollTimer = setInterval(() => {
      if (isStopped) return;
      scrollNext();
    }, 3800);
  }

  // Start auto-scroll automatically
  startAutoScroll();

  // Pause scrolling on track interaction
  track.addEventListener('mousedown', () => stopAutoScroll('pressed'));
  track.addEventListener('touchstart', () => stopAutoScroll('pressed'), { passive: true });
  track.addEventListener('pointerdown', () => stopAutoScroll('pressed'));

  // On clicking review card, redirect to Google Business Profile in new tab
  // (with drag-detection so swiping through cards on mobile doesn't trigger the click)
  let pointerStartX = 0;
  let pointerStartY = 0;
  let maxMoveDistance = 0;

  cards.forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('title', 'View verified reviews for Beachealth on Google Maps (opens in new tab)');

    card.addEventListener('pointerdown', e => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      maxMoveDistance = 0;
    });

    card.addEventListener('pointermove', e => {
      const dx = Math.abs(e.clientX - pointerStartX);
      const dy = Math.abs(e.clientY - pointerStartY);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxMoveDistance) {
        maxMoveDistance = dist;
      }
    });

    card.addEventListener('click', e => {
      stopAutoScroll('pressed');
      // If movement was minimal (< 8px), it's a deliberate click/tap
      if (maxMoveDistance < 8) {
        window.open(GOOGLE_BUSINESS_PROFILE_URL, '_blank', 'noopener,noreferrer');
      }
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        stopAutoScroll('pressed');
        window.open(GOOGLE_BUSINESS_PROFILE_URL, '_blank', 'noopener,noreferrer');
      }
    });
  });
}




/* ==========================================================================
   SMOOTH SCROLL FOR IN-PAGE ANCHORS
   Ensures deliberate smooth navigation on clicks, avoiding drag on page reload
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const hash = this.getAttribute('href');
      if (!hash || hash === '#' || this.hasAttribute('data-modal-target') || this.hasAttribute('data-team-id') || this.hasAttribute('data-policy-id')) return;
      
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', hash);
      }
    });
  });
}

/* ==========================================================================
   FLOATING "TEXT US" WIDGET (FormSubmit.co to admin@beachealth.com)
   ========================================================================== */
function initFloatingTextWidget() {
  if (document.querySelector('.floating-textus-container')) return;

  const container = document.createElement('div');
  container.className = 'floating-textus-container';
  container.innerHTML = `
    <!-- Floating Prompt Bubble -->
    <div class="textus-prompt-bubble" id="textus-prompt-bubble" role="button" tabindex="0" aria-label="Text us prompt">
      <button class="textus-bubble-close" id="textus-bubble-close" type="button" aria-label="Close message">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="textus-bubble-content">
        <img src="/images/reception-avatar.jpg" alt="Beach Health Reception" class="textus-avatar" />
        <div class="textus-bubble-text">
          <span class="textus-bubble-title">Hi there, any questions?</span>
          <span class="textus-bubble-action">Text us here!</span>
        </div>
      </div>
    </div>

    <!-- Text Us Popover Card -->
    <div class="textus-popover" id="textus-popover" role="dialog" aria-modal="true" aria-labelledby="textus-card-title">
      <div class="textus-header">
        <div class="textus-header-info">
          <div class="textus-header-avatar-wrap">
            <img src="/images/reception-avatar.jpg" alt="Beach Health Reception" class="textus-header-avatar" />
            <span class="textus-status-dot" title="Online"></span>
          </div>
          <div>
            <div class="textus-header-title" id="textus-card-title">Beach Health Reception</div>
            <div class="textus-header-sub">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              <span>Online • Fast Reply</span>
            </div>
          </div>
        </div>
        <button class="textus-close-btn" id="textus-popover-close" type="button" aria-label="Close dialog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="textus-body" id="textus-card-body">
        <p class="textus-intro">Have questions regarding treatments, bookings, or practitioner availability? Send us a quick text below:</p>
        <form id="floating-textus-form" novalidate>
          <div class="textus-field">
            <label for="textus-input-name" class="textus-label">Your Name <span style="color: #ef4444;">*</span></label>
            <input type="text" id="textus-input-name" name="name" class="textus-input" placeholder="e.g. Sarah Mitchell" required />
            <div class="textus-error-msg" id="textus-err-name"></div>
          </div>
          <div class="textus-field">
            <label for="textus-input-phone" class="textus-label">Mobile Phone Number <span style="color: #ef4444;">*</span></label>
            <input type="tel" id="textus-input-phone" name="phone" class="textus-input" placeholder="(416) 000-0000" required />
            <div class="textus-error-msg" id="textus-err-phone"></div>
          </div>
          <div class="textus-field">
            <label for="textus-input-email" class="textus-label">Email Address <span style="font-weight: 400; color: #94a3b8;">(optional)</span></label>
            <input type="email" id="textus-input-email" name="email" class="textus-input" placeholder="sarah@example.com" />
            <div class="textus-error-msg" id="textus-err-email"></div>
          </div>
          <div class="textus-field">
            <label for="textus-input-message" class="textus-label">How can we help? <span style="color: #ef4444;">*</span></label>
            <textarea id="textus-input-message" name="message" class="textus-textarea" rows="3" placeholder="Type your question or message here..." required></textarea>
            <div class="textus-error-msg" id="textus-err-message"></div>
          </div>
          <button type="submit" id="textus-submit-btn" class="textus-submit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            <span>Send Message</span>
          </button>
          <div class="textus-footer-note">
            Routed directly to clinic reception at <a href="mailto:admin@beachealth.com">admin@beachealth.com</a>
          </div>
        </form>
      </div>
    </div>

    <!-- Floating "Text us" Pill Button -->
    <button class="floating-textus-btn" id="floating-textus-btn" type="button" aria-label="Text us">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <line x1="9" y1="10" x2="15" y2="10"></line>
        <line x1="9" y1="14" x2="13" y2="14"></line>
      </svg>
      <span>Text us</span>
    </button>
  `;

  document.body.appendChild(container);

  const bubble = container.querySelector('#textus-prompt-bubble');
  const bubbleClose = container.querySelector('#textus-bubble-close');
  const popover = container.querySelector('#textus-popover');
  const popoverClose = container.querySelector('#textus-popover-close');
  const floatingBtn = container.querySelector('#floating-textus-btn');
  const form = container.querySelector('#floating-textus-form');
  const cardBody = container.querySelector('#textus-card-body');

  // Check if bubble was closed this session
  if (sessionStorage.getItem('textus_bubble_dismissed') === 'true') {
    if (bubble) bubble.style.display = 'none';
  }

  // Dismiss bubble only
  if (bubbleClose) {
    bubbleClose.addEventListener('click', e => {
      e.stopPropagation();
      if (bubble) bubble.style.display = 'none';
      sessionStorage.setItem('textus_bubble_dismissed', 'true');
    });
  }

  // Open popover from bubble
  if (bubble) {
    bubble.addEventListener('click', () => {
      popover.classList.add('active');
      bubble.style.display = 'none';
      const firstInput = container.querySelector('#textus-input-name');
      if (firstInput) setTimeout(() => firstInput.focus(), 150);
    });

    bubble.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        bubble.click();
      }
    });
  }

  // Toggle popover from floating button
  if (floatingBtn) {
    floatingBtn.addEventListener('click', () => {
      const isActive = popover.classList.contains('active');
      if (isActive) {
        popover.classList.remove('active');
      } else {
        popover.classList.add('active');
        if (bubble) bubble.style.display = 'none';
        const firstInput = container.querySelector('#textus-input-name');
        if (firstInput) setTimeout(() => firstInput.focus(), 150);
      }
    });
  }

  // Close popover from header close button
  if (popoverClose) {
    popoverClose.addEventListener('click', () => {
      popover.classList.remove('active');
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && popover.classList.contains('active')) {
      popover.classList.remove('active');
    }
  });

  // Close on click outside
  document.addEventListener('click', e => {
    if (popover.classList.contains('active')) {
      if (!container.contains(e.target)) {
        popover.classList.remove('active');
      }
    }
  });

  // Handle Form Submission via FormSubmit.co
  if (form) {
    const nameInput = form.querySelector('#textus-input-name');
    const phoneInput = form.querySelector('#textus-input-phone');
    const emailInput = form.querySelector('#textus-input-email');
    const messageInput = form.querySelector('#textus-input-message');
    const submitBtn = form.querySelector('#textus-submit-btn');

    function clearTextusErrors() {
      [nameInput, phoneInput, emailInput, messageInput].forEach(inp => {
        if (inp) {
          inp.classList.remove('is-invalid');
          inp.removeAttribute('aria-invalid');
        }
      });
      container.querySelectorAll('.textus-error-msg').forEach(err => {
        err.classList.remove('visible');
        err.textContent = '';
      });
    }

    function setTextusError(inp, errId, msg) {
      if (inp) {
        inp.classList.add('is-invalid');
        inp.setAttribute('aria-invalid', 'true');
      }
      const errEl = container.querySelector(errId);
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.add('visible');
      }
    }

    // Dynamic error clearing on user typing
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        nameInput.classList.remove('is-invalid');
        const err = container.querySelector('#textus-err-name');
        if (err) err.classList.remove('visible');
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        phoneInput.classList.remove('is-invalid');
        const err = container.querySelector('#textus-err-phone');
        if (err) err.classList.remove('visible');
      });
    }
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        emailInput.classList.remove('is-invalid');
        const err = container.querySelector('#textus-err-email');
        if (err) err.classList.remove('visible');
      });
    }
    if (messageInput) {
      messageInput.addEventListener('input', () => {
        messageInput.classList.remove('is-invalid');
        const err = container.querySelector('#textus-err-message');
        if (err) err.classList.remove('visible');
      });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      clearTextusErrors();

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const messageVal = messageInput ? messageInput.value.trim() : '';

      let hasError = false;
      let firstInvalid = null;

      // 1. Validate Name
      if (!nameVal || nameVal.length < 2) {
        setTextusError(nameInput, '#textus-err-name', 'Please enter your name.');
        hasError = true;
        if (!firstInvalid) firstInvalid = nameInput;
      }

      // 2. Validate Phone Number
      const cleanDigits = phoneVal.replace(/\D/g, '');
      if (!phoneVal) {
        setTextusError(phoneInput, '#textus-err-phone', 'Please enter your mobile phone number.');
        hasError = true;
        if (!firstInvalid) firstInvalid = phoneInput;
      } else if (/[a-zA-Z]/.test(phoneVal)) {
        setTextusError(phoneInput, '#textus-err-phone', 'Please enter numbers only (letters are not allowed).');
        hasError = true;
        if (!firstInvalid) firstInvalid = phoneInput;
      } else if (cleanDigits.length < 10) {
        setTextusError(phoneInput, '#textus-err-phone', 'Phone number must be at least 10 digits (e.g. 416-546-4887).');
        hasError = true;
        if (!firstInvalid) firstInvalid = phoneInput;
      } else if (cleanDigits.length > 15) {
        setTextusError(phoneInput, '#textus-err-phone', 'Phone number is too long (maximum 15 digits).');
        hasError = true;
        if (!firstInvalid) firstInvalid = phoneInput;
      }

      // 3. Validate Email (if provided)
      const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (emailVal && !emailPattern.test(emailVal)) {
        setTextusError(emailInput, '#textus-err-email', 'Please enter a valid email address (e.g. name@example.com).');
        hasError = true;
        if (!firstInvalid) firstInvalid = emailInput;
      }

      // 4. Validate Message
      if (!messageVal || messageVal.length < 5) {
        setTextusError(messageInput, '#textus-err-message', 'Please enter your question or message (at least 5 characters).');
        hasError = true;
        if (!firstInvalid) firstInvalid = messageInput;
      }

      if (hasError) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
          <span>Sending to reception...</span>
        `;
      }

      // 1. Asynchronous dispatch to FormSubmit.co for admin@beachealth.com
      fetch('https://formsubmit.co/ajax/admin@beachealth.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: nameVal,
          phone: phoneVal,
          email: emailVal || 'Not provided',
          message: messageVal,
          _subject: `New "Text Us" Question: ${nameVal} (${phoneVal})`,
          _template: 'table'
        })
      })
      .then(res => res.json())
      .catch(err => {
        console.warn('FormSubmit notice:', err);
      });

      // 2. Render confirmation screen
      setTimeout(() => {
        const safeName = nameVal.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safePhone = phoneVal.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        cardBody.innerHTML = `
          <div class="textus-success">
            <div class="textus-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="textus-success-title">Message Sent!</div>
            <p class="textus-success-desc">
              Thank you, <strong>${safeName}</strong>! Your message has been routed directly to clinic reception at <strong style="color: #0093d0;"><a href="mailto:admin@beachealth.com" style="text-decoration: underline;">admin@beachealth.com</a></strong>.
              <br><br>
              A coordinator will text or call you back shortly at <strong>${safePhone}</strong>.
            </p>
            <button type="button" id="textus-success-close-btn" class="btn btn-primary" style="width: 100%; justify-content: center; border-radius: 10px; margin-bottom: 12px; font-weight: 700;">Close</button>
            <div style="font-size: 0.8rem; color: #64748b;">
              Need immediate assistance? Call us at <a href="tel:4165464887" style="color: #0093d0; font-weight: 700;">(416) 546-4887</a>
            </div>
          </div>
        `;

        const closeBtn = cardBody.querySelector('#textus-success-close-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            popover.classList.remove('active');
          });
        }
      }, 500);
    });
  }
}
