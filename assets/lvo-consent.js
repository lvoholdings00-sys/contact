/* LVO consent manager. Essential cookies only until the visitor opts in.
   Live data feeds and preference storage stay OFF without consent.
   API: LVOConsent.has('live'), .open(), .accept(), .reject(), .guard(layerKey)
   Honors Global Privacy Control (treated as "essential only"). */
(function () {
  var W = window, D = document, K = 'lvo_consent', LIVE = /^(flights|mil|vessels|cctv|transit|windyMap|wx.*|webcams?)$/;
  function read() { var m = D.cookie.match(/(?:^|; )lvo_consent=([^;]*)/); if (!m) return null; try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { return null; } }
  function write(live) {
    var v = { v: 1, live: !!live, t: Date.now() };
    D.cookie = K + '=' + encodeURIComponent(JSON.stringify(v)) + '; Max-Age=15552000; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    try { D.dispatchEvent(new CustomEvent('lvo:consent', { detail: v })); } catch (e) {}
    return v;
  }
  var gpc = !!(navigator.globalPrivacyControl);
  var C = W.LVOConsent = {
    has: function (k) { var c = read(); return !!(c && c[k === 'live' ? 'live' : k]); },
    accept: function () { write(true); close(); },
    reject: function () { write(false); close(); },
    open: function () { show(true); },
    guard: function (k) { if (!LIVE.test(String(k))) return true; if (C.has('live')) return true; show(true); return false; }
  };
  var box;
  function close() { if (box) { box.remove(); box = null; } }
  function css() {
    if (D.getElementById('lvo-consent-css')) return;
    var s = D.createElement('style'); s.id = 'lvo-consent-css';
    s.textContent = '#lvo-consent{position:fixed;z-index:2147483000;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));max-width:560px;margin:0 auto;background:#08080a;border:1px solid rgba(255,255,255,.28);color:#d9d9de;font:400 15px/1.5 "Cormorant Garamond",Georgia,serif;padding:18px 18px 16px;box-shadow:0 18px 50px rgba(0,0,0,.7);text-align:left;-webkit-text-size-adjust:100%}' +
      '#lvo-consent,#lvo-consent *{box-sizing:border-box}' +
      '#lvo-consent a{display:inline!important;padding:0!important;margin:0!important;min-height:0!important;border:0!important;font:inherit!important;line-height:inherit!important;color:#fff!important;text-decoration:underline;text-underline-offset:3px}' +
      '#lvo-consent b{display:block;font:600 11px "Cinzel",serif;letter-spacing:.28em;text-transform:uppercase;color:#fff;margin-bottom:6px}' +
      '#lvo-consent p{margin:0 0 14px!important;padding:0!important;font:inherit!important;line-height:1.5!important;color:#d9d9de!important}#lvo-consent .r{display:flex;gap:10px}' +
      '@media(max-width:480px){#lvo-consent{left:10px;right:10px;padding:16px 16px 14px;font-size:14px}#lvo-consent .r{flex-direction:column}}' +
      '#lvo-consent button{flex:1 1 0;margin:0;padding:0 8px;min-height:46px;font:600 10px "Cinzel",serif;letter-spacing:.24em;text-transform:uppercase;background:transparent;color:#fff;border:.5px solid rgba(255,255,255,.4);cursor:pointer}' +
      '#lvo-consent button.p{background:#e8e8ee;color:#000;border-color:#e8e8ee}#lvo-consent button:focus-visible{outline:1px solid #fff;outline-offset:3px}';
    D.head.appendChild(s);
  }
  function show(force) {
    if (box || (!force && (read() || gpc))) return;
    css();
    box = D.createElement('div'); box.id = 'lvo-consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Cookie preferences');
    box.innerHTML = '<b>Cookies</b><p>Essential cookies keep you signed in and secure. With your consent we also load web fonts, switch on live data feeds and remember your preferences. Nothing is sold or shared for advertising. <a href="https://privacy.wearelvo.com">Privacy</a> · <a href="https://tos.wearelvo.com">Terms</a></p><div class="r"><button type="button" class="p" data-a="y">Accept</button><button type="button" data-a="n">Essential only</button></div>';
    box.addEventListener('click', function (e) { var a = e.target && e.target.getAttribute && e.target.getAttribute('data-a'); if (a === 'y') C.accept(); else if (a === 'n') C.reject(); });
    D.body.appendChild(box);
  }

  function loadFonts() {
    if (!C.has('live')) return;
    D.querySelectorAll('meta[name="lvo-fonts"]').forEach(function (m) {
      var u = m.getAttribute('content'); if (!u || D.querySelector('link[data-lvo-font="' + u + '"]')) return;
      var l = D.createElement('link'); l.rel = 'stylesheet'; l.href = u; l.setAttribute('data-lvo-font', u); D.head.appendChild(l);
    });
  }
  D.addEventListener('lvo:consent', loadFonts);
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', loadFonts); else loadFonts();
  D.addEventListener('click', function (e) { var t = e.target && e.target.closest && e.target.closest('[data-lvo-cookie-settings]'); if (t) { e.preventDefault(); show(true); } });
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { show(false); }); else show(false);
})();
