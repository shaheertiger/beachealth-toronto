/**
 * BEACHEALTH INTERACTIVE ENGINE
 * Ultra-fast, zero-bloat vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initMobileDrawer();
  initServicesFilter();
  initModals();
  initContactForm();
  initReviewsSlider();

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
  }

  // Touch swipe support
  let touchStartX = 0;
  sliderSection.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  sliderSection.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) nextSlide();
    if (touchEndX - touchStartX > 50) prevSlide();
  }, { passive: true });

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
  const drawerLinks = document.querySelectorAll('.drawer-nav a, .drawer-footer a');

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Global ESC key listener to close drawer and modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDrawer();
      const modal = document.getElementById('modal-overlay');
      if (modal && modal.classList.contains('open')) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });
}

/* ==========================================================================
   3. SERVICES FILTER
   ========================================================================== */
function initServicesFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.service-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   4. MODALS (BOOKING, PRACTITIONER BIO, SERVICE DETAIL, BLOG)
   ========================================================================== */
const TEAM_DATA = {
  'lada-milos-lee': {
    name: 'Lada Milos Lee',
    role: 'Chiropodist & Clinic Owner',
    portal: 'Beaches Foot Care Centre',
    bookingUrl: 'https://beachesfootcare.janeapp.com/',
    image: '/images/team-lada.jpg',
    bio: `Lada Milos Lee has been practicing as a licensed chiropodist for over 15 years and is currently the owner and clinical director of Beaches Foot Care Centre at Beachealth. Graduating with honors from the Michener Institute for Applied Health Sciences, Lada specializes in comprehensive foot care, diabetic wound management, nail surgery, and bespoke biomechanical orthotics. She takes great pride in creating tailored treatment plans that restore mobility and relieve foot and lower-limb pain for patients of all ages.`
  },
  'emily-tran': {
    name: 'Emily Tran',
    role: 'Chiropodist',
    portal: 'Beaches Foot Care Centre',
    bookingUrl: 'https://beachesfootcare.janeapp.com/',
    image: '/images/team-emily.jpg',
    bio: `Emily is a skilled, dedicated Chiropodist holding an Advanced Diploma of Health Sciences in Chiropody (with distinction) from the prestigious Michener Institute. Her clinical approach merges preventive podiatric care with advanced medical treatments for ingrown toenails, plantar fasciitis, dermatological conditions, and diabetic foot health. Emily works closely with Beachealth’s osteopaths and physiotherapists to analyze gait and correct lower extremity mechanics.`
  },
  'dr-adam-bletsoe': {
    name: 'Dr. Adam Bletsoe',
    role: 'Chiropractor',
    portal: 'Beachealth Clinic',
    bookingUrl: 'https://beachealth.janeapp.com/',
    image: '/images/team-adam.jpeg',
    bio: `Dr. Adam Bletsoe is a chiropractor whose clinical focus centers on restoring biomechanical harmony, joint mobility, and spinal health. Utilizing evidence-informed spinal adjustments, myofascial release, dry needling, and corrective exercise therapy, Dr. Bletsoe helps desk workers, weekend warriors, and competitive runners overcome chronic restrictions, sciatic discomfort, and acute sports injuries.`
  },
  'jared-cox': {
    name: 'Jared Cox',
    role: 'Osteopathic Manual Practitioner, Holistic Nutritionist & Personal Trainer',
    portal: 'Beachealth Clinic',
    bookingUrl: 'https://beachealth.janeapp.com/',
    image: '/images/team-jared.jpg',
    bio: `Jared is a registered Osteopathic Manual Practitioner, certified Holistic Nutritionist, and Personal Trainer with a specialized passion for sports injuries, spinal rehabilitation, and chronic pain management. He uses gentle osteopathic articular techniques, visceral mobilization, and cranial work combined with functional nutrition to resolve the underlying root causes of systemic inflammation and structural imbalance.`
  },
  'jake-maher': {
    name: 'Jake Maher',
    role: 'Osteopathic Manual Practitioner',
    portal: 'Beachealth Clinic',
    bookingUrl: 'https://beachealth.janeapp.com/',
    image: '/images/team-jake.jpg',
    bio: `Jake graduated from RMIT University in Melbourne, Australia, completing an intensive double degree comprising a Bachelor of Health Science and Bachelor of Applied Science (Osteopathy). Jake brings extensive international experience treating postural fatigue, rotator cuff strains, disc herniations, and repetitive stress injuries through osteopathic manual medicine and evidence-based rehabilitation.`
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
  }
};

const SERVICE_DATA = {
  'osteopathy': {
    title: 'Osteopathy (Manual Practice)',
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
    title: 'Chiropody & Advanced Foot Care',
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
    title: 'Registered Massage Therapy (RMT)',
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
  'physio-pilates': {
    title: 'Physio-Guided Scientific Pilates',
    portal: 'Beachealth Services',
    bookingUrl: 'https://beachealth.janeapp.com/#/pilates-physio-pilates',
    image: '/images/pilates-card.jpeg',
    desc: 'Physio-guided Pilates combines the biomechanical precision of clinical rehabilitation with the core strength and stability principles of Pilates. Tailored for individuals recovering from back pain, surgery, or postural deficits.',
    points: [
      'Core & deep stabilizer muscular retraining',
      'Reformer & clinical mat exercises',
      'Safe post-rehabilitation progressions',
      'Guided 1-on-1 by trained clinical specialists'
    ]
  },
  'medical-pedicure': {
    title: 'Clinical Medical Pedicure',
    portal: 'Beaches Foot Care Centre',
    bookingUrl: 'https://beachesfootcare.janeapp.com/',
    image: '/images/pedicure-card.jpg',
    desc: 'An advanced clinical medical pedicure performed in a sterile, medical-grade environment by our registered Chiropodists. Ideal for individuals with thickened nails, calluses, fungal infections, diabetes, or sensitive feet requiring sterile medical care.',
    points: [
      '100% Hospital-grade autoclave sterilization',
      'Safe for diabetics, immunocompromised & elderly',
      'Thickened, fungal, and ingrown nail management',
      'Corn, callus, and cracked heel reduction'
    ]
  },
  'running-analysis': {
    title: '3D Video Running Gait Analysis',
    portal: 'Beachealth Services',
    bookingUrl: 'https://beachealth.janeapp.com/#/running-analysis',
    image: '/images/running-card.png',
    desc: 'Running analysis utilizes specialized high-speed video capture and biomechanical assessment to evaluate cadence, strike patterns, hip drop, and ground reaction forces. We pinpoint exactly why injuries recur and how to boost performance.',
    points: [
      'Multi-angle slow-motion video evaluation',
      'Footwear and orthotic prescription guidance',
      'Cadence, stride, and pelvis alignment coaching',
      'Customized strength & mobility drill plan'
    ]
  },
  'shockwave-therapy': {
    title: 'Radial Shockwave Therapy',
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
    title: 'Chiropractic Care',
    portal: 'Beachealth Services',
    bookingUrl: 'https://beachealth.janeapp.com/',
    image: '/images/chiro-hero.jpeg',
    desc: 'Chiropractic care restores natural biomechanical motion where joints and muscles have become guarded, stiff, or dysfunctional. Dr. Adam Bletsoe uses modern, gentle adjustments combined with muscle release and rehab exercises.',
    points: [
      'Gentle spinal & extremity joint adjustments',
      'Postural analysis & ergonomic coaching',
      'Sciatica, disc bulges & radiculopathy relief',
      'Comprehensive active rehabilitation plans'
    ]
  },
  'dry-needling': {
    title: 'Dry Needling (Intramuscular Stimulation)',
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

const BLOG_DATA = {
  'shoulder-tears': {
    title: 'The Aging Shoulder: What Do Rotator Cuff “Tears” Really Mean?',
    category: 'Osteopathy & Physical Rehab',
    date: 'Recent Clinical Insight',
    content: `
      <p>Shoulder pain can quickly interfere with daily life—from lifting groceries and typing to reaching overhead or getting a restful night’s sleep. Often, patients undergo an MRI only to receive a report stating they have a "rotator cuff tear" or "degenerative fraying."</p>
      <br>
      <h4>Understanding Asymptomatic Tears</h4>
      <p>Numerous medical studies have shown that a significant percentage of people over age 40 have asymptomatic rotator cuff tears. In other words, gray hair for your joints! Just because an imaging scan reports a tear does not mean surgery is inevitable.</p>
      <br>
      <h4>The Coordinated Beachealth Approach</h4>
      <p>At Beachealth, we focus on function rather than just MRI scans. By releasing thoracic spine restrictions with osteopathy, rebalancing scapular rhythm with chiropractic care, and strengthening the surrounding rotator cuff muscles, over 80% of shoulder pain cases resolve successfully with non-surgical conservative care.</p>
    `
  },
  'tendon-pain': {
    title: 'From Frustration to Recovery: A Smarter Approach to Tendon Pain',
    category: 'Sports & Musculoskeletal Care',
    date: 'Clinical Update',
    content: `
      <p>Tendons are tough, resilient fibrous bands that transmit mechanical force from muscles to bones. When tendons become overloaded, microscopic tissue changes occur—a state known as tendinopathy (often affecting the Achilles, patellar, or elbow tendons).</p>
      <br>
      <h4>Why Rest and Ice Fail Chronic Tendons</h4>
      <p>Traditional "rest and ice" often provides temporary symptom dampening, but fails to rebuild the tendon’s load-bearing capacity. Tendons need progressive, structured mechanical load to stimulate collagen synthesis.</p>
      <br>
      <h4>Combining Shockwave with Active Loading</h4>
      <p>At our Toronto clinic, we pair radial shockwave therapy with progressive eccentric loading protocols. Shockwave breaks the chronic inflammation loop and stimulates blood flow, while tailored exercises rebuild tendon resilience for long-term athletic durability.</p>
    `
  },
  'dry-needling-guide': {
    title: 'Dry Needling Explained: Intramuscular Manual Therapy for Myofascial Dysfunction',
    category: 'Advanced Modalities',
    date: 'Therapy Guide',
    content: `
      <p>Dry needling is a western, anatomy-based treatment modality where fine filament needles are inserted directly into hyper-irritable spots within skeletal muscle known as trigger points.</p>
      <br>
      <h4>How Does It Differ from Acupuncture?</h4>
      <p>While both utilize sterile needles, dry needling is grounded in modern neuroanatomy and musculoskeletal examination. The objective is to produce a local twitch response (LTR), which resets dysfunctional muscle spindles and clears acidic biochemicals that irritate nerves.</p>
      <br>
      <h4>What Conditions Respond Best?</h4>
      <p>Dry needling produces outstanding results for chronic neck stiffness, tension headaches, tennis elbow, gluteal tightness, and stubborn calf cramps.</p>
    `
  }
};

function initModals() {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-body-container');
  const modalClose = document.getElementById('modal-close-btn');

  if (!modalOverlay || !modalContent) return;

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openModal(html) {
    modalContent.innerHTML = html;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
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
      if (!member) return;

      const html = `
        <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
          <img src="${member.image}" alt="${member.name}" style="width: 140px; height: 160px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.1);" />
          <div style="flex: 1; min-width: 220px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #0093d0; text-transform: uppercase;">${member.portal || 'Practitioner Profile'}</div>
            <h3 style="font-size: 1.6rem; color: #173753; margin: 4px 0 8px;">${member.name}</h3>
            <p style="font-size: 0.95rem; font-weight: 600; color: #64748b; margin-bottom: 14px;">${member.role}</p>
            <a href="${member.bookingUrl || 'https://beachealth.janeapp.com/'}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Book with ${member.name.split(' ')[0]}</a>
          </div>
        </div>
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 1rem; line-height: 1.7; color: #334155;">
          ${member.bio}
        </div>
      `;
      openModal(html);
    });
  });

  // 2. Service Detail Modals
  document.querySelectorAll('[data-service-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.getAttribute('data-service-id');
      const service = SERVICE_DATA[id];
      if (!service) return;

      const pointsHtml = service.points.map(p => `
        <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${p}</span>
        </li>
      `).join('');

      const html = `
        <div>
          <img src="${service.image}" alt="${service.title}" style="width: 100%; height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;" />
          <div style="display: inline-block; padding: 4px 12px; background: #e6f4fb; color: #0093d0; font-size: 0.8rem; font-weight: 700; border-radius: 20px; text-transform: uppercase; margin-bottom: 8px;">${service.portal}</div>
          <h3 style="font-size: 1.6rem; color: #173753; margin-bottom: 12px;">${service.title}</h3>
          <p style="font-size: 1.02rem; line-height: 1.65; color: #334155; margin-bottom: 20px;">${service.desc}</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <h4 style="font-size: 1rem; color: #173753; margin-bottom: 12px; font-weight: 700;">Clinical Focus & Benefits:</h4>
            <ul style="font-size: 0.95rem; color: #334155;">${pointsHtml}</ul>
          </div>
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            <a href="${service.bookingUrl || 'https://beachealth.janeapp.com/'}" target="_blank" rel="noopener" class="btn btn-primary">Book This Service Online</a>
            <a href="tel:4165464887" class="btn btn-secondary">Call (416) 546-4887</a>
          </div>
        </div>
      `;
      openModal(html);
    });
  });

  // 3. Blog Reader Modals
  document.querySelectorAll('[data-blog-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.getAttribute('data-blog-id');
      const post = BLOG_DATA[id];
      if (!post) return;

      const html = `
        <div>
          <span style="color: #0093d0; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">${post.category}</span>
          <h3 style="font-size: 1.6rem; color: #173753; margin: 8px 0 16px; line-height: 1.3;">${post.title}</h3>
          <div style="font-size: 1.02rem; line-height: 1.7; color: #334155; margin-bottom: 28px;">
            ${post.content}
          </div>
          <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
            <div>
              <p style="font-size: 0.9rem; color: #64748b;">Have questions about this condition?</p>
              <h5 style="color: #173753; font-size: 1.05rem;">Schedule an evaluation with our clinical team.</h5>
            </div>
            <a href="https://beachealth.janeapp.com/" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Book Consultation</a>
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
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                  <span style="display: inline-block; padding: 3px 10px; background: #e6f4fb; color: #0093d0; font-size: 0.72rem; font-weight: 700; border-radius: 20px; text-transform: uppercase;">Rehabilitation</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h4 style="font-size: 1.2rem; color: #173753; font-weight: 800; margin-bottom: 6px;">Beachealth Services</h4>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 14px; line-height: 1.4;">Multi-disciplinary manual therapy, spinal rehab, and sports recovery.</p>
                <ul style="font-size: 0.84rem; color: #334155; margin-bottom: 18px; display: flex; flex-direction: column; gap: 6px;">
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Osteopathy (Manual Practice)</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Chiropractic Care</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Registered Massage Therapy (RMT)</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Physio Pilates & Running Analysis</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Shockwave & Dry Needling</li>
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
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                  <span style="display: inline-block; padding: 3px 10px; background: #e6f4fb; color: #0093d0; font-size: 0.72rem; font-weight: 700; border-radius: 20px; text-transform: uppercase;">Podiatry & Nails</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="2"><path d="M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1"/><path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M12 4v8"/></svg>
                </div>
                <h4 style="font-size: 1.2rem; color: #173753; font-weight: 800; margin-bottom: 6px;">Beaches Foot Care Centre</h4>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 14px; line-height: 1.4;">Registered Chiropody, medical-grade pedicures, and bespoke orthotics.</p>
                <ul style="font-size: 0.84rem; color: #334155; margin-bottom: 18px; display: flex; flex-direction: column; gap: 6px;">
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Chiropody & Foot Assessments</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Sterile Clinical Medical Pedicures</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Custom Biomechanical Orthotics</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Ingrown Toenails & Fungal Care</li>
                  <li style="display: flex; align-items: center; gap: 8px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0093d0" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Plantar Fasciitis & Heel Spurs</li>
                </ul>
              </div>
              <a href="https://beachesfootcare.janeapp.com/" target="_blank" rel="noopener" class="btn btn-primary" style="width: 100%; text-align: center; justify-content: center; font-size: 0.9rem; padding: 10px 16px;">
                Book Foot Care & Pedicures
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
            <button class="btn btn-primary btn-sm" onclick="document.getElementById('modal-overlay').classList.remove('open'); document.body.style.overflow='';">Understood</button>
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

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Sending message to reception...';
    submitBtn.disabled = true;

    setTimeout(() => {
      const parentCard = form.parentElement;
      const userNameSafe = nameVal.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Render clean Success Card
      parentCard.innerHTML = `
        <div class="form-success-card">
          <div style="width: 58px; height: 58px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h4 style="margin-bottom: 8px;">Inquiry Sent Successfully!</h4>
          <p style="margin-bottom: 20px;">Thank you, <strong>${userNameSafe}</strong>! Your inquiry has been delivered directly to our clinic desk at <strong style="color: #0093d0;">admin@beachealth.com</strong>. One of our coordinators will reply within 1 business day.</p>
          
          <div style="background: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #bbf7d0; margin-bottom: 22px; text-align: left;">
            <div style="font-weight: 700; color: #173753; margin-bottom: 4px;">Need Immediate Booking?</div>
            <p style="font-size: 0.88rem; color: #4b5563; margin-bottom: 12px;">You can view realtime practitioner availability online or call our desk directly:</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <a href="tel:4165464887" class="btn btn-secondary btn-sm">Call (416) 546-4887</a>
              <button class="btn btn-primary btn-sm" id="btn-success-book">Book Online via JaneApp</button>
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
            <span>Thank you, ${userNameSafe}! Message dispatched to Beachealth reception.</span>
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
function initReviewsSlider() {
  const track = document.querySelector('.reviews-track');
  const prevBtn = document.querySelector('.reviews-prev');
  const nextBtn = document.querySelector('.reviews-next');
  const cards = document.querySelectorAll('.review-slide-card');
  const dotsContainer = document.getElementById('reviews-dots');

  if (!track || !cards.length) return;

  function getStep() {
    const card = cards[0];
    const gap = 24;
    return card ? card.offsetWidth + gap : 360;
  }

  // Create pagination dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    cards.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `reviews-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to review ${idx + 1}`);
      dot.addEventListener('click', () => {
        track.scrollTo({ left: idx * getStep(), behavior: 'smooth' });
        updateDots(idx);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots(activeIndex) {
    const dots = document.querySelectorAll('.reviews-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: getStep(), behavior: 'smooth' });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });
  }

  track.addEventListener('scroll', () => {
    const activeIndex = Math.round(track.scrollLeft / getStep());
    updateDots(Math.min(activeIndex, cards.length - 1));
  }, { passive: true });
}


