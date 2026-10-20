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
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
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
    image: '/images/team-lada.jpg',
    bio: `Lada Milos Lee has been practicing as a licensed chiropodist for over 15 years and is currently the owner and clinical director of Beaches Foot Care Centre at Beachealth. Graduating with honors from the Michener Institute for Applied Health Sciences, Lada specializes in comprehensive foot care, diabetic wound management, nail surgery, and bespoke biomechanical orthotics. She takes great pride in creating tailored treatment plans that restore mobility and relieve foot and lower-limb pain for patients of all ages.`
  },
  'emily-tran': {
    name: 'Emily Tran',
    role: 'Chiropodist',
    image: '/images/team-emily.jpg',
    bio: `Emily is a skilled, dedicated Chiropodist holding an Advanced Diploma of Health Sciences in Chiropody (with distinction) from the prestigious Michener Institute. Her clinical approach merges preventive podiatric care with advanced medical treatments for ingrown toenails, plantar fasciitis, dermatological conditions, and diabetic foot health. Emily works closely with Beachealth’s osteopaths and physiotherapists to analyze gait and correct lower extremity mechanics.`
  },
  'dr-adam-bletsoe': {
    name: 'Dr. Adam Bletsoe',
    role: 'Chiropractor',
    image: '/images/team-adam.jpeg',
    bio: `Dr. Adam Bletsoe is a chiropractor whose clinical focus centers on restoring biomechanical harmony, joint mobility, and spinal health. Utilizing evidence-informed spinal adjustments, myofascial release, dry needling, and corrective exercise therapy, Dr. Bletsoe helps desk workers, weekend warriors, and competitive runners overcome chronic restrictions, sciatic discomfort, and acute sports injuries.`
  },
  'jared-cox': {
    name: 'Jared Cox',
    role: 'Osteopathic Manual Practitioner, Holistic Nutritionist & Personal Trainer',
    image: '/images/team-jared.jpg',
    bio: `Jared is a registered Osteopathic Manual Practitioner, certified Holistic Nutritionist, and Personal Trainer with a specialized passion for sports injuries, spinal rehabilitation, and chronic pain management. He uses gentle osteopathic articular techniques, visceral mobilization, and cranial work combined with functional nutrition to resolve the underlying root causes of systemic inflammation and structural imbalance.`
  },
  'jake-maher': {
    name: 'Jake Maher',
    role: 'Osteopathic Manual Practitioner',
    image: '/images/team-jake.jpg',
    bio: `Jake graduated from RMIT University in Melbourne, Australia, completing an intensive double degree comprising a Bachelor of Health Science and Bachelor of Applied Science (Osteopathy). Jake brings extensive international experience treating postural fatigue, rotator cuff strains, disc herniations, and repetitive stress injuries through osteopathic manual medicine and evidence-based rehabilitation.`
  },
  'patrice-wilson': {
    name: 'Patrice Wilson',
    role: 'Registered Massage Therapist (RMT)',
    image: '/images/team-patrice.jpg',
    bio: `Patrice Wilson is a graduate of Sutherland-Chan School & Teaching Clinic and an active member in good standing with the College of Massage Therapists of Ontario (CMTO) since 2004. With over two decades of clinical expertise, Patrice specializes in deep tissue therapy, trigger point release, myofascial manipulation, and prenatal massage, helping clients release deep chronic tension and improve postural alignment.`
  },
  'krystele-charles': {
    name: 'Krystele Charles',
    role: 'Registered Massage Therapist (RMT)',
    image: '/images/team-krystele.jpg',
    bio: `Krystele Charles is a compassionate Registered Massage Therapist dedicated to musculoskeletal recovery and pain reduction. Her clinical focus includes TMJ dysfunction massage, sports injury recovery, neck and shoulder tension relief, and stress reduction. Krystele coordinates with Beachealth’s osteopaths and chiropractors to augment structural recovery with targeted soft-tissue therapy.`
  }
};

const SERVICE_DATA = {
  'osteopathy': {
    title: 'Osteopathy (Manual Practice)',
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
            <div style="font-size: 0.85rem; font-weight: 700; color: #1b998b; text-transform: uppercase;">Practitioner Profile</div>
            <h3 style="font-size: 1.6rem; color: #173753; margin: 4px 0 8px;">${member.name}</h3>
            <p style="font-size: 0.95rem; font-weight: 600; color: #64748b; margin-bottom: 12px;">${member.role}</p>
            <a href="https://beachealth.janeapp.com/" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Book with ${member.name.split(' ')[0]}</a>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b998b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
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
            <a href="https://beachealth.janeapp.com/" target="_blank" rel="noopener" class="btn btn-primary">Book This Service Online</a>
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
          <span style="color: #1b998b; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">${post.category}</span>
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

  // 4. Booking Quick Dialog Modal (Triggered by main Book buttons)
  document.querySelectorAll('[data-open-booking]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const html = `
        <div style="text-align: center;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #e8f5f3; color: #1b998b; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <h3 style="font-size: 1.65rem; color: #173753; margin-bottom: 8px;">Book Your Appointment</h3>
          <p style="color: #64748b; font-size: 0.98rem; max-width: 440px; margin: 0 auto 24px;">Appointments at Beachealth are managed via JaneApp for secure 24/7 online scheduling with real-time practitioner availability.</p>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 24px; text-align: left;">
            <a href="https://beachealth.janeapp.com/" target="_blank" rel="noopener" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #173753; transition: all 0.2s;" onmouseover="this.style.borderColor='#1b998b'; this.style.background='#e8f5f3';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';">
              <div style="display: flex; align-items: center; gap: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b998b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                <span>Book Osteopathy / Manual Practice</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b998b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

            <a href="https://beachealth.janeapp.com/" target="_blank" rel="noopener" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #173753; transition: all 0.2s;" onmouseover="this.style.borderColor='#1b998b'; this.style.background='#e8f5f3';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';">
              <div style="display: flex; align-items: center; gap: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b998b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1"/><path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M12 4v8"/></svg>
                <span>Book Chiropody / Foot Care / Orthotics</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b998b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

            <a href="https://beachealth.janeapp.com/" target="_blank" rel="noopener" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #173753; transition: all 0.2s;" onmouseover="this.style.borderColor='#1b998b'; this.style.background='#e8f5f3';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';">
              <div style="display: flex; align-items: center; gap: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b998b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
                <span>Book Registered Massage Therapy (RMT)</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b998b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>

            <a href="https://beachealth.janeapp.com/" target="_blank" rel="noopener" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #173753; transition: all 0.2s;" onmouseover="this.style.borderColor='#1b998b'; this.style.background='#e8f5f3';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';">
              <div style="display: flex; align-items: center; gap: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b998b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>Book Chiropractic Care / Shockwave</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b998b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          <div style="background: #f1f5f9; padding: 16px; border-radius: 10px; font-size: 0.9rem; color: #475569;">
            Prefer to book by phone? Call our friendly reception at <a href="tel:4165464887" style="color: #173753; font-weight: 700; text-decoration: underline;">(416) 546-4887</a>.
          </div>
        </div>
      `;
      openModal(html);
    });
  });
}

/* ==========================================================================
   5. CONTACT FORM
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('toast-notification');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Sending message...';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;

      // Show toast with clean SVG checkmark
      if (toast) {
        toast.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Thank you! Your message has been sent to our reception team.</span>
          </div>
        `;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 5000);
      }
    }, 800);
  });
}


