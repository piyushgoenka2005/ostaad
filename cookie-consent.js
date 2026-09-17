/* Ostaad — Cookie Consent
   Stores user choice in localStorage under 'ostaad-cookie-preference'.
   Values: 'all' | 'essential' | 'none'
   SameSite=Lax is applied to any server-set cookie (server responsibility).
*/
(() => {
  const KEY = 'ostaad-cookie-preference';
  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const save = (v) => {
    try { localStorage.setItem(KEY, v); } catch {}
    document.documentElement.dataset.cookiePreference = v;
    // If user rejects, clear any non-essential cookies already set
    if (v === 'none') {
      document.cookie.split(';').forEach(c => {
        const name = c.split('=')[0].trim();
        if (!['ostaad-cookie-preference'].includes(name)) {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
        }
      });
    }
  };

  const mount = () => {
    if (read()) return;
    const banner = document.createElement('aside');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.innerHTML = `
      <div class="cookie-copy">
        <strong>Your privacy, clearly stated.</strong>
        <p>Ostaad only uses essential browser storage to remember this choice. Optional cookies may be introduced in the future.</p>
        <a href="privacy.html">Read our privacy policy →</a>
      </div>
      <div class="cookie-actions">
        <button type="button" data-cookie="none">Reject all</button>
        <button type="button" data-cookie="essential">Essential only</button>
        <button type="button" class="cookie-accept" data-cookie="all">Accept all</button>
      </div>`;
    banner.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-cookie]')?.dataset.cookie;
      if (!choice) return;
      save(choice);
      banner.style.transition = 'opacity .3s ease, transform .3s ease';
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(12px)';
      setTimeout(() => banner.remove(), 320);
    });
    document.body.append(banner);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
