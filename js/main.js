// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Lazy-load do vídeo institucional (18MB) só quando a seção Sobre está prestes a aparecer
const institutionalVideo = document.getElementById('institutionalVideo');
if (institutionalVideo) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const source = institutionalVideo.querySelector('source[data-src]');
        if (source) {
          source.src = source.dataset.src;
          institutionalVideo.load();
          institutionalVideo.play().catch(() => {});
        }
        videoObserver.unobserve(e.target);
      }
    });
  }, { rootMargin: '300px' });
  videoObserver.observe(institutionalVideo);
}

function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  item.classList.toggle('open');
  btn.setAttribute('aria-expanded', item.classList.contains('open'));
}
function toggleWhy(header) {
  const item = header.closest('.why-item');
  item.classList.toggle('open');
  header.setAttribute('aria-expanded', item.classList.contains('open'));
}

/* Ativa elementos com role="button" (divs clicáveis) via teclado */
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"]')) {
    e.preventDefault();
    e.target.click();
  }
});

/* ── INSTITUTIONAL VIDEO SOUND TOGGLE ── */
function toggleVideoSound() {
  const video = document.getElementById('institutionalVideo');
  const iconMuted = document.getElementById('iconMuted');
  const iconSound = document.getElementById('iconSound');
  video.muted = !video.muted;
  iconMuted.style.display = video.muted ? 'block' : 'none';
  iconSound.style.display = video.muted ? 'none' : 'block';
}

/* ── NOTICE BAR ── */
document.body.classList.add('notice-visible');

function closeNotice() {
  document.getElementById('noticeBar').classList.add('hidden');
  document.body.classList.remove('notice-visible');
}

/* ── PAYMENT SYSTEM ── */
const PAY_PLANS = {
  mensal_aluno:     { label:'Mensal',             display:'R$ 120,00', qr:'QR Codes/Pagamento Mensal.jpeg',             pix:'00020101021126560014br.gov.bcb.pix0114295847240001010216Pagamento Mensal5204000053039865406120.005802BR5913FITNESS 4 YOU6007GOIANIA62070503***6304EC8D' },
  mensal_matricula: { label:'Mensal + Matrícula', display:'R$ 130,00', qr:'QR Codes/Pagamento Mensal + Matrícula.jpeg', pix:'00020101021126670014br.gov.bcb.pix0114295847240001010227Pagamento Mensal  Matricula5204000053039865406130.005802BR5913FITNESS 4 YOU6007GOIANIA62070503***6304E751' },
  trimestral:       { label:'Trimestral',         display:'R$ 330,00', qr:'QR Codes/Pagamento Trimestral.jpeg',         pix:'00020101021126600014br.gov.bcb.pix0114295847240001010220Pagamento Trimestral5204000053039865406330.005802BR5913FITNESS 4 YOU6007GOIANIA62070503***6304A1C1' },
  semestral:        { label:'Semestral',          display:'R$ 600,00', qr:'QR Codes/Pagamento Semestral.jpeg',          pix:'00020101021126590014br.gov.bcb.pix0114295847240001010219Pagamento Semestral5204000053039865406600.005802BR5913FITNESS 4 YOU6007GOIANIA62070503***630419B2' },
  anual:            { label:'Anual',              display:'R$ 1.099,00', qr:'QR Codes/Pagamento Anual.jpeg',           pix:'00020101021126550014br.gov.bcb.pix0114295847240001010215Pagamento Anual52040000530398654071099.005802BR5913FITNESS 4 YOU6007GOIANIA62070503***6304E02D' },
  crosskids:        { label:'Crosskids Infantil', display:'R$ 150,00', qr:'QR Codes/Pagamento CrossKids.jpeg',         pix:'00020101021126590014br.gov.bcb.pix0114295847240001010219Pagamento CrossKids5204000053039865406150.005802BR5913FITNESS 4 YOU6007GOIANIA62070503***6304F59C' },
  jiujitsu_infantil:{ label:'Jiu-Jitsu Infantil', display:'R$ 150,00', qr:'QR Codes/Pagamento JiuJitsu Infantil.jpeg', pix:'00020101021126630014br.gov.bcb.pix0114295847240001010223Pagamento JiuJitsu Kids5204000053039865406150.005802BR5913FITNESS 4 YOU6007GOIANIA62070503***63047D94' }
};

let payIsAluno = true;

/* ── FOCUS TRAP genérico pros modais ── */
let lastFocusedEl = null;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

function trapFocus(modalEl) {
  lastFocusedEl = document.activeElement;
  const items = modalEl.querySelectorAll(FOCUSABLE);
  if (items.length) items[0].focus();

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(modalEl.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  modalEl._trapHandler = handleKeydown;
  modalEl.addEventListener('keydown', handleKeydown);
}

function releaseFocus(modalEl) {
  if (modalEl._trapHandler) {
    modalEl.removeEventListener('keydown', modalEl._trapHandler);
    modalEl._trapHandler = null;
  }
  if (lastFocusedEl) lastFocusedEl.focus();
}

function openPaymentModal(plan) {
  const sel = document.getElementById('payPlan');
  sel.value = plan || 'mensal';
  payIsAluno = true;
  document.getElementById('btnYes').classList.add('active');
  document.getElementById('btnNo').classList.remove('active');
  document.getElementById('studentNote').textContent = 'Mensalidade: R$ 120,00';
  onPlanChange();
  paySetStep(1);
  const modal = document.getElementById('paymentModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  trapFocus(modal);
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  releaseFocus(modal);
}

function paySetStep(s) {
  [1,2,3].forEach(i => {
    document.getElementById('pp'+i).classList.toggle('active', i===s);
    const dot = document.getElementById('pd'+i);
    dot.classList.remove('active','done');
    if (i < s) dot.classList.add('done');
    else if (i === s) dot.classList.add('active');
    if (i < 3) document.getElementById('pl'+i).classList.toggle('done', i < s);
  });
}

function onPlanChange() {
  const v = document.getElementById('payPlan').value;
  document.getElementById('payStudentField').style.display = v === 'mensal' ? 'block' : 'none';
}

function setStudent(isAluno) {
  payIsAluno = isAluno;
  document.getElementById('btnYes').classList.toggle('active', isAluno);
  document.getElementById('btnNo').classList.toggle('active', !isAluno);
  document.getElementById('studentNote').textContent = isAluno
    ? 'Mensalidade: R$ 120,00'
    : 'Matrícula + Mensalidade: R$ 130,00';
}

function getPayKey() {
  const v = document.getElementById('payPlan').value;
  if (v === 'mensal') return payIsAluno ? 'mensal_aluno' : 'mensal_matricula';
  return v;
}

function payGoStep2() {
  const name = document.getElementById('payName').value.trim();
  const cpf  = document.getElementById('payCPF').value.trim();
  if (!name) { document.getElementById('payName').focus(); return; }
  if (cpf.replace(/\D/g,'').length < 11) { document.getElementById('payCPF').focus(); return; }
  const consent = document.getElementById('payConsent');
  if (!consent.checked) { consent.focus(); return; }
  const p = PAY_PLANS[getPayKey()];
  // Planos sem QR Code: redireciona para WhatsApp
  if (!p.qr) {
    const msg = encodeURIComponent(`Olá! Tenho interesse no plano ${p.label} (${p.display}).\n\n👤 Nome: ${name}\n📋 CPF: ${cpf}`);
    window.open(`https://wa.me/5562996487510?text=${msg}`, '_blank');
    closePaymentModal();
    return;
  }
  document.getElementById('payQR').src            = p.qr;
  document.getElementById('payAmtDisplay').textContent = p.display;
  document.getElementById('payPixStr').textContent = p.pix;
  const btn = document.getElementById('payCopyBtn');
  btn.classList.remove('copied');
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar código Pix';
  paySetStep(2);
}

function payGoStep3() {
  const name = document.getElementById('payName').value.trim();
  const cpf  = document.getElementById('payCPF').value.trim();
  const p    = PAY_PLANS[getPayKey()];
  const now  = new Date();
  const date = now.toLocaleDateString('pt-BR');
  const time = now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  const msg  = encodeURIComponent(
    `Olá! Realizei o pagamento via Pix.\n\n` +
    `👤 Nome: ${name}\n` +
    `📋 CPF: ${cpf}\n` +
    `💪 Plano: ${p.label}\n` +
    `💰 Valor: ${p.display}\n` +
    `📅 Data: ${date} às ${time}`
  );
  document.getElementById('payWABtn').href = `https://wa.me/5562996487510?text=${msg}`;
  paySetStep(3);
}

function copyPix() {
  const code = document.getElementById('payPixStr').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('payCopyBtn');
    btn.classList.add('copied');
    btn.innerHTML = '✓ Código copiado!';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar código Pix';
    }, 2500);
  });
}

function maskCPF(el) {
  let v = el.value.replace(/\D/g,'').substring(0,11);
  if (v.length > 9)      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/,'$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/,'$1.$2.$3');
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/,'$1.$2');
  el.value = v;
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('navHamburger');
  menu.classList.toggle('open');
  btn.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('navHamburger').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileMenu(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('paymentModal').classList.contains('open')) {
    closePaymentModal();
  }
});

/* ── VIDEO CARDS HOVER + MODAL ── */
document.querySelectorAll('.video-card').forEach(card => {
  const video = card.querySelector('video');
  if (!video) return;
  card.addEventListener('mouseenter', () => {
    video.play().catch(() => {});
    card.classList.add('is-hovering');
  });
  card.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
    card.classList.remove('is-hovering');
  });
});

function openVideoModal(src) {
  const modal = document.getElementById('videoModal');
  const mv = document.getElementById('modalVideo');
  document.querySelectorAll('.video-card video').forEach(v => { v.pause(); v.currentTime = 0; });
  document.querySelectorAll('.video-card').forEach(c => c.classList.remove('is-hovering'));
  mv.src = src;
  mv.play().catch(() => {});
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  trapFocus(modal);
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const mv = document.getElementById('modalVideo');
  mv.pause();
  mv.src = '';
  modal.classList.remove('open');
  document.body.style.overflow = '';
  releaseFocus(modal);
}

function openPrivacyModal() {
  const modal = document.getElementById('privacyModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  trapFocus(modal);
}

function closePrivacyModal() {
  const modal = document.getElementById('privacyModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  releaseFocus(modal);
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('privacyModal').classList.contains('open')) {
    closePrivacyModal();
  }
});

/* ── STAT COUNTER ANIMATION ── */

function toggleSocialFab() {
  document.getElementById('socialFab').classList.toggle('open');
}
// Fecha ao clicar fora
document.addEventListener('click', function(e) {
  const fab = document.getElementById('socialFab');
  if (!fab.contains(e.target)) fab.classList.remove('open');
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// Nav transparente no hero, glass ao sair
const nav = document.querySelector('nav');
const heroSection = document.querySelector('.hero');
function updateNav() {
  const heroBottom = heroSection ? heroSection.offsetHeight : window.innerHeight;
  if (window.scrollY < heroBottom - 80) {
    nav.style.opacity = '0';
    nav.style.pointerEvents = 'none';
  } else {
    nav.style.opacity = '1';
    nav.style.pointerEvents = 'auto';
    nav.style.background = 'rgba(8, 4, 4, 0.75)';
    nav.style.backdropFilter = 'blur(24px) saturate(180%)';
    nav.style.webkitBackdropFilter = 'blur(24px) saturate(180%)';
    nav.style.borderBottom = '1px solid rgba(220, 31, 38, 0.18)';
    nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
  }
}
window.addEventListener('scroll', updateNav);
updateNav();
lucide.createIcons();

/* Preços dos planos — contagem ao entrar na tela */
(function () {
  const priceEls = document.querySelectorAll('.plan-price span');
  if (!priceEls.length) return;

  function animatePrice(el) {
    const target = parseInt(el.textContent.replace(/\./g, ''), 10);
    if (isNaN(target)) return;
    const duration = 1000;
    const start = performance.now();
    (function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);
      el.textContent = value.toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('pt-BR');
    })(start);
  }

  const priceObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animatePrice(e.target);
      priceObserver.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  priceEls.forEach(el => priceObserver.observe(el));
})();

/* Horários — destaca o card de hoje e mostra se está aberto agora */
(function () {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;

  document.querySelectorAll('.hours-card').forEach(card => {
    const days = card.dataset.days.split(',').map(Number);
    if (!days.includes(day)) return;

    card.classList.add('hours-card-today');
    const open = parseFloat(card.dataset.open);
    const close = parseFloat(card.dataset.close);
    const statusEl = card.querySelector('.hours-status');
    const isOpen = hour >= open && hour < close;

    statusEl.classList.add(isOpen ? 'is-open' : 'is-closed');
    statusEl.innerHTML = '<span class="hours-status-dot"></span>' +
      (isOpen
        ? `Aberto agora — fecha às ${card.dataset.close}h`
        : hour < open
          ? `Fechado — abre às ${card.dataset.open}h`
          : 'Fechado por hoje');
  });
})();


/* ── AÇÕES DE CLIQUE (data-action) ──
   Substitui os onclick inline para permitir uma CSP sem 'unsafe-inline'. */
const ACTIONS = {
  closeNotice, toggleMobileMenu, closeMobileMenu, toggleVideoSound, toggleWhy, toggleFaq,
  openPaymentModal, closePaymentModal, openVideoModal, closeVideoModal,
  openPrivacyModal, closePrivacyModal, setStudent, payGoStep2, payGoStep3, copyPix, toggleSocialFab,
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = ACTIONS[el.dataset.action];
  if (!action) return;
  if (el.getAttribute('href') === '#') e.preventDefault();

  const arg = el.dataset.arg;
  if (arg === undefined) action(el);
  else action(arg === 'true' ? true : arg === 'false' ? false : arg);
});

document.getElementById('payCPF').addEventListener('input', e => maskCPF(e.target));
document.getElementById('payPlan').addEventListener('change', onPlanChange);
