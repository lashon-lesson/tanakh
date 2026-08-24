/* ══════════════════════════════════════════════════════════════
   a11y.js — שכבת נגישות מרכזית · תנ״ך לתיכון
   ת"י 5568 (WCAG AA) · נטען בשורה אחת בכל קובץ:
   <script src="a11y.js" defer></script>
   ────────────────────────────────────────────────
   כולל:
   1. תפריט נגישות צף (גודל טקסט, ניגודיות, מונוכרום,
      הדגשת קישורים, פונט קריא, עצירת אנימציות, סמן גדול,
      ריווח שורות, איפוס)
   2. קישור "דילוג לתוכן" (WCAG 2.4.1)
   3. סגנונות פוקוס גלובליים (WCAG 2.4.7)
   4. תמיכת מקלדת אוטומטית לכל אלמנט עם onclick (WCAG 2.1.1)
   5. aria-live לטוסט (WCAG 4.1.3)
   6. שמות נגישים למתגי ה-toggle (WCAG 4.1.2)
   7. Esc + לכידת פוקוס במודאלים (WCAG 2.1.2)
   8. כיבוד prefers-reduced-motion (WCAG 2.3.3)
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (window.__tanakhA11y) return;
  window.__tanakhA11y = true;

  var R = document.documentElement;
  var KEY = 'tanakh2_a11y';
  var STEP_MIN = -2, STEP_MAX = 5;

  var DEF = {
    font: 0, contrast: false, mono: false, links: false,
    readable: false, noanim: false, cursor: false, spacing: false
  };
  var st = {};
  for (var k in DEF) st[k] = DEF[k];
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var saved = JSON.parse(raw);
      for (var j in DEF) if (j in saved) st[j] = saved[j];
    }
  } catch (e) { }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { }
  }

  /* ─────────────────────────────────────────────
     1. CSS
     ───────────────────────────────────────────── */
  var CSS = [
    /* ── קישור דילוג ── */
    '.a11y-skip{position:absolute;right:-9999px;top:0;z-index:100000;background:#000;color:#fff;',
    'padding:.7rem 1.2rem;border-radius:0 0 10px 10px;font:700 .9rem/1.4 Heebo,Arial,sans-serif;',
    'text-decoration:underline}',
    '.a11y-skip:focus{right:1rem}',

    /* ── פוקוס גלובלי ── */
    'a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,',
    'textarea:focus-visible,[tabindex]:focus-visible,[role="button"]:focus-visible{',
    'outline:3px solid #f59e0b!important;outline-offset:2px!important;border-radius:4px}',
    '.toggle-wrap input:focus-visible + .toggle-slider{outline:3px solid #f59e0b;outline-offset:3px}',

    /* ── פלטת הפאנל (עוקבת אחרי מצב המערכת) ── */
    '.a11y-fab,.a11y-panel{--k-acc:#6366f1;--k-acc2:#8b5cf6;--k-srf:#fff;--k-srf2:#f2f3fb;',
    '--k-txt:#191c2e;--k-dim:#7c8298;--k-line:rgba(26,29,54,.13);color-scheme:light}',
    '@media(prefers-color-scheme:dark){.a11y-fab,.a11y-panel{',
    '--k-acc:#8b7dff;--k-acc2:#a78bfa;--k-srf:#1a1726;--k-srf2:#251f38;',
    '--k-txt:#ece9f7;--k-dim:#a8a3bd;--k-line:rgba(255,255,255,.16);color-scheme:dark}}',

    /* ── כפתור צף ── */
    '.a11y-fab{position:fixed;bottom:1rem;left:1rem;z-index:100000;width:48px;height:48px;',
    'border-radius:50%;border:2px solid rgba(255,255,255,.9);color:#fff;font-size:1.35rem;',
    'background:linear-gradient(135deg,var(--k-acc),var(--k-acc2));',
    'cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;',
    'box-shadow:0 6px 22px rgba(99,102,241,.5);transition:transform .15s}',
    '.a11y-fab:hover{transform:scale(1.08)}',

    /* ── פאנל ── */
    '.a11y-panel{position:fixed;bottom:4.6rem;left:1rem;z-index:100001;width:300px;',
    'max-width:calc(100vw - 2rem);max-height:calc(100vh - 6.5rem);overflow-y:auto;',
    'background:var(--k-srf);color:var(--k-txt);border:1px solid var(--k-line);',
    'border-radius:22px;box-shadow:0 20px 52px rgba(40,44,110,.4);padding:1rem;display:none;',
    "font-family:'Heebo','Rubik',sans-serif;direction:rtl;text-align:right}",
    '.a11y-panel.open{display:block}',
    ".a11y-ttl{font-family:'Rubik',sans-serif;font-size:1rem;font-weight:700;margin:0 0 .1rem;color:var(--k-txt)}",
    '.a11y-sub{font-size:.7rem;color:var(--k-dim);margin:0 0 .85rem}',
    '.a11y-row{display:flex;align-items:center;gap:.45rem;margin-bottom:.7rem}',
    '.a11y-lbl{flex:1;font-size:.8rem;font-weight:700;color:var(--k-txt)}',
    '.a11y-grid{display:grid;grid-template-columns:1fr 1fr;gap:.45rem}',
    '.a11y-btn{padding:.5rem .35rem;border:1.5px solid var(--k-line);border-radius:999px;',
    "background:var(--k-srf2);color:var(--k-txt);font:700 .73rem/1.25 'Heebo',sans-serif;",
    'cursor:pointer;text-align:center;min-height:42px;transition:all .14s}',
    '.a11y-btn:hover{border-color:var(--k-acc);color:var(--k-acc)}',
    '.a11y-btn[aria-pressed="true"]{background:linear-gradient(135deg,var(--k-acc),var(--k-acc2));',
    'border-color:transparent;color:#fff;box-shadow:0 4px 14px rgba(99,102,241,.35)}',
    '.a11y-step{width:42px;height:42px;flex:none;font-size:1.1rem;padding:0}',
    '.a11y-btn:disabled{opacity:.35;cursor:default}',
    ".a11y-val{min-width:50px;text-align:center;font:800 .82rem/1 'Heebo',sans-serif;color:var(--k-txt)}",
    '.a11y-reset{grid-column:1/-1;margin-top:.5rem;background:transparent;',
    'border-color:rgba(220,38,38,.45);color:#dc2626}',
    '.a11y-reset:hover{border-color:#dc2626;color:#dc2626;background:rgba(220,38,38,.07)}',
    '.a11y-links-ft{margin-top:.85rem;padding-top:.7rem;border-top:1px solid var(--k-line);',
    'display:flex;gap:.9rem;justify-content:center}',
    '.a11y-links-ft a{font-size:.73rem;color:var(--k-acc);text-decoration:underline}',
    '.a11y-close{position:absolute;top:.7rem;left:.7rem;width:28px;height:28px;',
    'border:1px solid var(--k-line);border-radius:50%;background:var(--k-srf2);color:var(--k-dim);',
    'cursor:pointer;font-size:.8rem;line-height:1;padding:0}',
    '.a11y-close:hover{color:#dc2626;border-color:#dc2626}',

    /* ── מצבי תצוגה ── */
    'html.a11y-noanim *,html.a11y-noanim *::before,html.a11y-noanim *::after{',
    'animation:none!important;transition:none!important}',
    'html.a11y-noanim{scroll-behavior:auto!important}',

    '@media(prefers-reduced-motion:reduce){*,*::before,*::after{',
    'animation-duration:.001ms!important;animation-iteration-count:1!important;',
    'transition-duration:.001ms!important;scroll-behavior:auto!important}}',

    'html.a11y-mono{filter:grayscale(1)}',

    'html.a11y-readable *:not(.a11y-fab):not(i){font-family:Arial,"Helvetica Neue",sans-serif!important}',

    'html.a11y-links a,html.a11y-links [role="button"]{text-decoration:underline!important}',
    'html.a11y-links a{outline:1px dashed currentColor;outline-offset:2px}',

    'html.a11y-spacing p,html.a11y-spacing li,html.a11y-spacing td,html.a11y-spacing div,',
    'html.a11y-spacing span{line-height:1.9!important;letter-spacing:.055em!important;word-spacing:.14em!important}',
    'html.a11y-spacing .a11y-panel *{line-height:1.4!important;letter-spacing:normal!important;word-spacing:normal!important}',

    'html.a11y-cursor,html.a11y-cursor *{cursor:url("data:image/svg+xml;utf8,',
    '<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' viewBox=\'0 0 32 32\'>',
    '<path d=\'M6 2 L6 26 L12 20 L16 30 L20 28 L16 19 L25 19 Z\' fill=\'%23000\' stroke=\'%23fff\' stroke-width=\'2\'/>',
    '</svg>") 4 2,auto!important}',

    /* ── ניגודיות גבוהה ── */
    'html.a11y-contrast{',
    '--bg:#000;--surface:#000;--surface2:#0d0d0d;--surface3:#1c1c1c;',
    '--border:#fff;--border2:#fff;',
    '--text:#fff;--text-mid:#fff;--muted:#ffe600;--subtle:#ffe600;',
    '--blue:#66b3ff;--blue-lt:#001a33;--blue-dk:#99ccff;',
    '--green:#4ade80;--green-lt:#00220e;',
    '--amber:#fbbf24;--amber-lt:#231a00;',
    '--red:#ff8080;--red-lt:#2b0000;',
    '--purple:#c4b5fd;--purple-lt:#150033;',
    '--gold:#fbbf24;--gold-lt:#231a00;',
    '--teal:#5eead4;--teal-lt:#00231f;',
    '--indigo:#a5b4fc;--indigo-lt:#0d0033;',
    '--c70:#c4b5fd;--c70-lt:#150033;--c70-dk:#ddd6fe;',
    '--acc:#a5b4fc;--acc2:#c4b5fd;--acc-dk:#c7d2fe;--acc-lt:#0d0033;--acc-tx:#c7d2fe;',
    '--lc:#a5b4fc;--lc-lt:#0d0033;--gold2:#fbbf24;--gold2-lt:#231a00;',
    '--accent:#a5b4fc;--accent2:#c4b5fd;--accent-soft:#0d0033;--dash-bg:#000;',
    '--side-bg:#000;--side-bg2:#000;--side-line:#fff;--side-txt:#fff;--side-txt-dim:#ffe600;}',
    'html.a11y-contrast body,html.a11y-contrast *:not(.a11y-panel):not(.a11y-panel *):not(.a11y-fab){',
    'background-image:none!important}',
    'html.a11y-contrast body{background:#000!important}',
    'html.a11y-contrast .lc-desc,html.a11y-contrast .lc-label,html.a11y-contrast .ls-tagline,',
    'html.a11y-contrast .ls-chip,html.a11y-contrast .tcp-hint,html.a11y-contrast .tcp-lbl,',
    'html.a11y-contrast .tcp-back,html.a11y-contrast .hero-sub,html.a11y-contrast .hero-name,',
    'html.a11y-contrast .uc-done-lbl,html.a11y-contrast .uc-tag,html.a11y-contrast .uc-name,',
    'html.a11y-contrast .uc-pct,html.a11y-contrast .lr-short-lbl,html.a11y-contrast .t-strip{',
    'color:#fff!important}',
    'html.a11y-contrast .su-name,html.a11y-contrast .su-role,html.a11y-contrast .side-link,',
    'html.a11y-contrast .side-logo,html.a11y-contrast .tb-greet-dash,html.a11y-contrast .scp-head,',
    'html.a11y-contrast .ec-name,html.a11y-contrast .ec-meta,html.a11y-contrast .pd-label{',
    'color:#fff!important}',
    'html.a11y-contrast .side,html.a11y-contrast .main-area,html.a11y-contrast .side-link{',
    'background:#000!important}',
    'html.a11y-contrast .side-link.active{border:2px solid #ffe600!important;color:#ffe600!important}',
    'html.a11y-contrast .uc,html.a11y-contrast .lc,html.a11y-contrast .unit-accordion,',
    'html.a11y-contrast .exam-card,html.a11y-contrast .modal{',
    'border:2px solid #fff!important}',
    'html.a11y-contrast #login-screen{background:#000!important}',
    'html.a11y-contrast .lc,html.a11y-contrast .ls-tcp,html.a11y-contrast .scp-grade:hover,',
    'html.a11y-contrast .tcp-input,html.a11y-contrast .tcp-input:focus,',
    'html.a11y-contrast .m-in,html.a11y-contrast .m-in:focus,',
    'html.a11y-contrast .roster-name-inp,html.a11y-contrast .roster-name-inp:focus,',
    'html.a11y-contrast #chpass-screen div[style*="background:#fff"]{',
    'background:#000!important;color:#fff!important;border-color:#fff!important}',
    'html.a11y-contrast .lc-arrow,html.a11y-contrast .scp-head,html.a11y-contrast .tcp-privacy,',
    'html.a11y-contrast .tcp-input::placeholder,html.a11y-contrast .m-in::placeholder{color:#fff!important}',
    'html.a11y-contrast .tcp-privacy a,html.a11y-contrast a{color:#ffe600!important}',
    'html.a11y-contrast .a11y-panel a{color:var(--k-acc)!important}',

    /* ── הדפסה ── */
    '@media print{.a11y-fab,.a11y-panel,.a11y-skip{display:none!important}}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('a11y-style')) return;
    var s = document.createElement('style');
    s.id = 'a11y-style';
    s.textContent = CSS;
    (document.head || R).appendChild(s);
  }
  injectCSS();

  /* ─────────────────────────────────────────────
     2. החלת המצב
     ───────────────────────────────────────────── */
  function apply() {
    R.classList.toggle('a11y-contrast', !!st.contrast);
    R.classList.toggle('a11y-mono', !!st.mono);
    R.classList.toggle('a11y-links', !!st.links);
    R.classList.toggle('a11y-readable', !!st.readable);
    R.classList.toggle('a11y-noanim', !!st.noanim);
    R.classList.toggle('a11y-cursor', !!st.cursor);
    R.classList.toggle('a11y-spacing', !!st.spacing);
    R.style.fontSize = st.font ? (100 + st.font * 10) + '%' : '';
    syncUI();
  }

  function toggle(key) {
    st[key] = !st[key];
    save(); apply();
    announce(st[key] ? 'הופעל' : 'בוטל');
  }

  function stepFont(dir) {
    var n = st.font + dir;
    if (n < STEP_MIN || n > STEP_MAX) return;
    st.font = n; save(); apply();
    announce('גודל טקסט ' + (100 + st.font * 10) + ' אחוז');
  }

  function resetAll() {
    for (var key in DEF) st[key] = DEF[key];
    save(); apply();
    announce('הגדרות הנגישות אופסו');
  }

  /* ─────────────────────────────────────────────
     3. הודעות לקורא מסך
     ───────────────────────────────────────────── */
  var liveEl = null;
  function announce(msg) {
    if (!liveEl) return;
    liveEl.textContent = '';
    setTimeout(function () { liveEl.textContent = msg; }, 60);
  }

  /* ─────────────────────────────────────────────
     4. בניית הממשק
     ───────────────────────────────────────────── */
  var fab = null, panel = null;

  function buildUI() {
    if (document.querySelector('.a11y-fab')) return;

    /* אזור הודעות חבוי */
    liveEl = document.createElement('div');
    liveEl.setAttribute('role', 'status');
    liveEl.setAttribute('aria-live', 'polite');
    liveEl.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
    document.body.appendChild(liveEl);

    /* קישור דילוג */
    var skip = document.createElement('a');
    skip.className = 'a11y-skip';
    skip.href = '#a11y-main';
    skip.textContent = 'דילוג לתוכן הראשי';
    document.body.insertBefore(skip, document.body.firstChild);

    /* כפתור צף */
    fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'a11y-fab';
    fab.setAttribute('aria-label', 'פתיחת תפריט נגישות');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<span aria-hidden="true">&#9855;</span>';
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);

    /* פאנל */
    panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'a11y-ttl');
    panel.style.position = 'fixed';
    panel.innerHTML =
      '<button type="button" class="a11y-close" aria-label="סגירת תפריט נגישות">&#10005;</button>' +
      '<h2 class="a11y-ttl" id="a11y-ttl">תפריט נגישות</h2>' +
      '<p class="a11y-sub">ההעדפות נשמרות במכשיר שלך</p>' +

      '<div class="a11y-row">' +
      '<span class="a11y-lbl" id="a11y-font-lbl">גודל טקסט</span>' +
      '<button type="button" class="a11y-btn a11y-step" data-act="font-down" aria-label="הקטנת גודל טקסט">&#8722;</button>' +
      '<span class="a11y-val" id="a11y-font-val" aria-live="off">100%</span>' +
      '<button type="button" class="a11y-btn a11y-step" data-act="font-up" aria-label="הגדלת גודל טקסט">&#43;</button>' +
      '</div>' +

      '<div class="a11y-grid">' +
      row('contrast', 'ניגודיות<br>גבוהה') +
      row('mono', 'גווני<br>אפור') +
      row('links', 'הדגשת<br>קישורים') +
      row('readable', 'גופן<br>קריא') +
      row('spacing', 'ריווח<br>שורות') +
      row('noanim', 'עצירת<br>אנימציות') +
      row('cursor', 'סמן עכבר גדול') +
      '<button type="button" class="a11y-btn a11y-reset" data-act="reset">&#8635; איפוס</button>' +
      '</div>' +

      '<div class="a11y-links-ft">' +
      '<a href="accessibility.html">הצהרת נגישות</a>' +
      '<a href="privacy.html">מדיניות פרטיות</a>' +
      '</div>';

    document.body.appendChild(panel);

    panel.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('a11y-close')) { closePanel(); return; }
      var act = btn.getAttribute('data-act');
      if (act === 'font-up') stepFont(1);
      else if (act === 'font-down') stepFont(-1);
      else if (act === 'reset') resetAll();
      else if (act) toggle(act);
    });

    apply();
  }

  function row(key, label) {
    return '<button type="button" class="a11y-btn" data-act="' + key + '" aria-pressed="false" ' +
      'aria-label="' + label.replace(/<br>/g, ' ') + '">' + label + '</button>';
  }

  function syncUI() {
    if (!panel) return;
    var v = panel.querySelector('#a11y-font-val');
    if (v) v.textContent = (100 + st.font * 10) + '%';
    panel.querySelectorAll('.a11y-btn[aria-pressed]').forEach(function (b) {
      var key = b.getAttribute('data-act');
      if (key in DEF) b.setAttribute('aria-pressed', st[key] ? 'true' : 'false');
    });
    var up = panel.querySelector('[data-act="font-up"]');
    var dn = panel.querySelector('[data-act="font-down"]');
    if (up) up.disabled = st.font >= STEP_MAX;
    if (dn) dn.disabled = st.font <= STEP_MIN;
  }

  var lastFocus = null;

  function togglePanel() {
    if (panel.classList.contains('open')) closePanel(); else openPanel();
  }
  function openPanel() {
    lastFocus = document.activeElement;
    panel.classList.add('open');
    fab.setAttribute('aria-expanded', 'true');
    fab.setAttribute('aria-label', 'סגירת תפריט נגישות');
    var first = panel.querySelector('button');
    if (first) first.focus();
  }
  function closePanel() {
    panel.classList.remove('open');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-label', 'פתיחת תפריט נגישות');
    (lastFocus && lastFocus.focus ? lastFocus : fab).focus();
  }

  /* ─────────────────────────────────────────────
     5. שיפורי נגישות אוטומטיים בדף
     ───────────────────────────────────────────── */
  var NATIVE = { A: 1, BUTTON: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1, SUMMARY: 1 };

  function enhanceClickables(root) {
    var els = (root || document).querySelectorAll('[onclick]');
    Array.prototype.forEach.call(els, function (el) {
      if (el.__a11yKb) return;
      el.__a11yKb = true;
      if (NATIVE[el.tagName]) return;
      if (el.closest('.a11y-panel')) return;
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          el.click();
        }
      });
    });
  }

  function labelToggles(root) {
    var inputs = (root || document).querySelectorAll('.toggle-wrap input[type="checkbox"]');
    Array.prototype.forEach.call(inputs, function (cb) {
      if (cb.getAttribute('aria-label')) return;
      var item = cb.closest('.lock-item');
      var nm = item && item.querySelector('.lock-name');
      var isAnswers = cb.closest('.toggle-wrap').classList.contains('answers');
      if (nm) {
        cb.setAttribute('aria-label',
          (isAnswers ? 'פרסום תשובות — ' : 'פתיחת גישה לתלמידים — ') + nm.textContent.trim());
      }
    });
  }

  function tagMain() {
    if (document.getElementById('a11y-main')) return;
    var main = document.querySelector('main,[role="main"],.main-area,#units-col,.app-body,.container,#content');
    if (!main) return;
    main.id = main.id || 'a11y-main';
    if (main.id !== 'a11y-main') {
      var probe = document.getElementById('a11y-main');
      if (!probe) main.setAttribute('id', 'a11y-main');
    }
    main.setAttribute('tabindex', '-1');
  }

  function tagToast() {
    var t = document.getElementById('toast');
    if (t && !t.getAttribute('role')) {
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      t.setAttribute('aria-atomic', 'true');
    }
  }

  function tagModals() {
    Array.prototype.forEach.call(document.querySelectorAll('.modal-overlay .modal'), function (m) {
      if (m.getAttribute('role')) return;
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      var t = m.querySelector('.modal-hd-title');
      if (t) {
        t.id = t.id || 'a11y-modal-ttl-' + Math.random().toString(36).slice(2, 7);
        m.setAttribute('aria-labelledby', t.id);
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll('.m-tab'), function (b) {
      if (!b.hasAttribute('type')) b.setAttribute('type', 'button');
    });
  }

  function enhanceAll() {
    tagMain(); tagToast(); tagModals();
    enhanceClickables(document);
    labelToggles(document);
  }

  /* ─────────────────────────────────────────────
     6. מקלדת גלובלית — Esc ולכידת פוקוס
     ───────────────────────────────────────────── */
  function focusables(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null || el === document.activeElement; }
    );
  }

  function activeDialog() {
    if (panel && panel.classList.contains('open')) return panel;
    var ov = document.querySelector('.modal-overlay.open');
    if (ov) return ov.querySelector('.modal') || ov;
    var lo = document.getElementById('logout-confirm-overlay');
    if (lo) return lo;
    return null;
  }

  document.addEventListener('keydown', function (e) {
    var dlg = activeDialog();

    if (e.key === 'Escape') {
      if (panel && panel.classList.contains('open')) { closePanel(); return; }
      var lo = document.getElementById('logout-confirm-overlay');
      if (lo) { lo.remove(); return; }
      if (document.querySelector('.modal-overlay.open')) {
        if (typeof window.closeSettings === 'function') window.closeSettings();
        else document.querySelector('.modal-overlay.open').classList.remove('open');
      }
      return;
    }

    if (e.key === 'Tab' && dlg) {
      var list = focusables(dlg);
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!dlg.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });

  /* ─────────────────────────────────────────────
     7. מעקב אחר תוכן דינמי
     ───────────────────────────────────────────── */
  var pending = null;
  function scheduleEnhance() {
    if (pending) return;
    pending = setTimeout(function () { pending = null; enhanceAll(); }, 120);
  }

  function start() {
    buildUI();
    enhanceAll();
    if (window.MutationObserver) {
      new MutationObserver(scheduleEnhance).observe(document.body, {
        childList: true, subtree: true
      });
    }
  }

  apply();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  /* ─────────────────────────────────────────────
     8. API חיצוני
     ───────────────────────────────────────────── */
  window.a11y = {
    open: function () { if (panel) openPanel(); },
    close: function () { if (panel) closePanel(); },
    reset: resetAll,
    refresh: enhanceAll,
    state: function () { var c = {}; for (var q in st) c[q] = st[q]; return c; }
  };

})();
