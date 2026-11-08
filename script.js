/* ═══════════════════════════════════════════════════════════════════
   Mobile Preview — script.js
   منطق المعاينة: iframe حقيقي لموقع المطعم + تحكم بالأحجام + وضع سطح المكتب
   لا يعدّل أي ملف أصلي ولا يحتاج إذنًا للوصول إلى محتوى الـ iframe.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ── المسار النسبي لموقع المطعم (ملفات المشروع الأصلية، دون أي تعديل) ── */
  const FRONTEND_DIR = '../الحالي المطلوب قلب لغته/full-stack-complete-app/frontend/';
  const DEFAULT_PAGE = 'index.html';

  /* ── أحجام الهاتف: العرض المنطقي (vw) يحدد إطار العرض الذي يبني الموقع صفحته به،
        و--w هو العرض الجسدي للهاتف على الشاشة (من المرجع: 330px قياسي) ── */
  const SIZES = {
    se:  { w: 296, vw: 375, label: 'iPhone SE — 375px'  },
    std: { w: 330, vw: 390, label: 'iPhone 14 — 390px'  },
    max: { w: 366, vw: 430, label: 'iPhone Pro Max — 430px' },
  };
  const DESKTOP_W = 1280, DESKTOP_H = 800;

  /* ── روابط مختصرة ── */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const enc = (p) => encodeURI(p);

  const phone   = $('#pvPhone');
  const desk    = $('#pvDesktop');
  const frPhone = $('#pvFrame');
  const frDesk  = $('#pvFrameDesktop');
  const ldPhone = phone ? $('.ld', phone) : null;
  const ldDesk  = desk ? $('.ld', desk) : null;
  const cap     = $('#pvCap');
  const sizeSel = $('#pvSize');
  const toast   = $('#pvToast');

  let currentPage = DEFAULT_PAGE;
  let desktopMode = false;

  /* ═══ رابط الصفحة الحالية للمطعم (مع ترميز المسار العربي) ═══ */
  function pageURL(page, bust) {
    let u = enc(FRONTEND_DIR + page);
    if (bust) u += (page.includes('?') ? '&' : '?') + '_pv=' + Date.now();
    return u;
  }
  const currentURL = (bust) => pageURL(currentPage, bust);

  /* ═══ ضبط المقياس (نفس خوارزمية fit في المرجع) ═══
     k = عرض الشاشة الفعلي ÷ العرض المنطقي، ثم يتمكّن الـ iframe
     من تحمل حجمه المنطقي ويُصغّر بمقياس k. */
  function fit(box, fr, vw, barSel, barPad) {
    if (!box || !fr) return;
    const scr = barSel ? $('.scr', box) : box; // الهاتف: .scr — سطح المكتب: .d-view
    const bar = barSel ? $(barSel, box) : null;
    if (!scr) return;
    const barH = bar ? bar.offsetHeight : 0;
    const k = scr.clientWidth / vw;
    if (!(k > 0)) return; // عنصر مخفي حاليًا — لا قياس
    fr.style.width = vw + 'px';
    fr.style.top = barH + 'px';
    fr.style.height = ((scr.clientHeight - barH) / k) + 'px';
    fr.style.transform = 'scale(' + k + ')';
    return k;
  }

  function fitPhone() {
    const s = SIZES[sizeSel.value];
    const k = fit(phone, frPhone, s.vw, '.sbar');
    if (k) showCap('عرض منطقي ' + s.vw + 'px · مقياس ' + Math.round(k * 100) + '%');
  }

  function fitDesktop() {
    if (!desk) return;
    const view = $('.d-view', desk);
    if (!view) return;
    // ارتفاع نافذة سطح المكتب يتبع نسبة 1280:800
    view.style.height = Math.round(view.clientWidth * DESKTOP_H / DESKTOP_W) + 'px';
    const k = view.clientWidth / DESKTOP_W;
    if (frDesk) {
      frDesk.style.width = DESKTOP_W + 'px';
      frDesk.style.top = '0';
      frDesk.style.height = DESKTOP_H + 'px';
      frDesk.style.transform = 'scale(' + k + ')';
    }
    if (desktopMode) showCap('وضع سطح المكتب ' + DESKTOP_W + '×' + DESKTOP_H + ' · مقياس ' + Math.round(k * 100) + '%');
  }

  function fitAll() {
    if (desktopMode) fitDesktop(); else fitPhone();
  }
  window.addEventListener('resize', fitAll);

  /* ═══ Loader — 12 ثانية ثم زر "افتح المعاينة" (كالمرجع تمامًا) ═══ */
  let slowT = null;
  const ldOpen = $('#ldOpen');
  function loading(fr, ld) {
    clearTimeout(slowT);
    if (!ld) return;
    const t = $('.ld-t', ld), x = $('.ld-x', ld);
    if (t) t.hidden = false;
    if (x) x.hidden = true;
    ld.classList.remove('off');
    const src = fr ? fr.getAttribute('src') : currentURL();
    if (ldOpen) ldOpen.href = src || '#';
    slowT = setTimeout(() => {
      if (t) t.hidden = true;
      if (x) x.hidden = false;
    }, 12000);
  }
  function onLoad(fr, ld) {
    clearTimeout(slowT);
    if (ld) ld.classList.add('off');
  }
  if (frPhone) frPhone.addEventListener('load', () => onLoad(frPhone, ldPhone));
  if (frDesk)  frDesk.addEventListener('load',  () => onLoad(frDesk,  ldDesk));

  /* ═══ Toast ═══ */
  let toastT = null;
  function showCap(msg) {
    if (cap) cap.textContent = msg;
  }
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ═══ الحالة: موبايل / سطح مكتب ═══ */
  function setDesktop(on) {
    desktopMode = !!on;
    document.body.classList.toggle('pv-desktop-on', desktopMode);
    if (desk) desk.hidden = !desktopMode;
    const btn = $('#pvDesktopToggle');
    if (btn) btn.classList.toggle('on', desktopMode);
    const lbl = $('#pvDeskLabel');
    if (lbl) lbl.textContent = desktopMode ? 'عودة للهاتف' : 'سطح المكتب';
    if (sizeSel) sizeSel.disabled = desktopMode;
    if (desktopMode) {
      if (frDesk) frDesk.src = currentURL();
      loading(frDesk, ldDesk);
      requestAnimationFrame(fitDesktop);
      showCap('وضع سطح المكتب ' + DESKTOP_W + '×' + DESKTOP_H);
    } else {
      requestAnimationFrame(fitPhone);
      fitPhone();
    }
  }

  /* ═══ فتح صفحة داخل المعاينة ═══ */
  function openPage(page, el) {
    currentPage = page;
    $$('.pv-pages button').forEach((b) => {
      const on = b === el;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (desktopMode) {
      if (frDesk) frDesk.src = currentURL();
      loading(frDesk, ldDesk);
    } else {
      if (frPhone) frPhone.src = currentURL();
      loading(frPhone, ldPhone);
    }
    updateOpenLinks();
  }

  /* ═══ روابط "افتح الموقع" ═══ */
  function updateOpenLinks() {
    const u = currentURL();
    ['#navOpenSite', '#pvNewTab', '#ctaNewTab', '#footOpen'].forEach((id) => {
      const a = $(id);
      if (a) a.href = u;
    });
    const dAddr = $('#dAddr');
    if (dAddr) dAddr.textContent = FRONTEND_DIR + currentPage;
  }

  function openNewTab() {
    window.open(currentURL(), '_blank', 'noopener');
    showToast('تم فتح الموقع في تبويب مستقل');
  }

  /* ═══ أحداث ═══ */
  if (sizeSel) sizeSel.addEventListener('change', () => {
    const s = SIZES[sizeSel.value];
    phone.style.setProperty('--w', s.w + 'px');
    phone.dataset.vw = String(s.vw);
    // انتظار اكتمال تغيّر المقاس قبل قياس المقياس
    requestAnimationFrame(() => requestAnimationFrame(fitPhone));
  });

  const reloadBtns = [$('#pvReload'), $('#ctaReload'), $('#footReload')];
  function reloadPreview() {
    const url = currentURL(true); // cache-buster يضمن إعادة تحميل حقيقية
    if (desktopMode) {
      if (frDesk) frDesk.src = url;
      loading(frDesk, ldDesk);
    } else {
      if (frPhone) frPhone.src = url;
      loading(frPhone, ldPhone);
    }
    updateOpenLinks();
    showToast('تم تحديث المعاينة');
  }
  reloadBtns.forEach((b) => { if (b) b.addEventListener('click', reloadPreview); });
  const tabBtn = $('#pvNewTab');   if (tabBtn) tabBtn.addEventListener('click', openNewTab);
  const ctaTab = $('#ctaNewTab');  if (ctaTab) ctaTab.addEventListener('click', openNewTab);
  const dtBtn  = $('#pvDesktopToggle'); if (dtBtn) dtBtn.addEventListener('click', () => setDesktop(!desktopMode));

  // شريط صفحات الموقع
  $$('.pv-pages button').forEach((b) => {
    b.addEventListener('click', () => openPage(b.dataset.src, b));
  });

  // قائمة الجوال
  const burger = $('#pvBurger'), links = $('#pvLinks');
  if (burger && links) burger.addEventListener('click', () => links.classList.toggle('open'));
  if (links) links.addEventListener('click', (e) => { if (e.target.tagName === 'A') links.classList.remove('open'); });

  // Opening links inside the iframe must never break outer page state — nothing to do.

  /* ═══ الإقلاع ═══ */
  (function init() {
    try {
      if (sizeSel) {
        const s = SIZES[sizeSel.value];
        phone.style.setProperty('--w', s.w + 'px');
        phone.dataset.vw = String(s.vw);
      }
      if (frPhone) frPhone.src = currentURL();
      loading(frPhone, ldPhone);
      fitPhone();
      updateOpenLinks();
    } catch (err) {
      // فشل غير متوقع لا يكسر الصفحة الخارجية
      console.warn('Mobile Preview init:', err);
      if (frPhone) frPhone.src = pageURL(DEFAULT_PAGE);
    }
  })();
})();
