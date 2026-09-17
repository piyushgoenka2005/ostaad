// ============================================================
// OSTAAD — NAVBAR AUTHENTICATION WIDGET & USER AVATAR
// Replaces 'Start a Project' with 'Login' or User Initials Avatar
// ============================================================

import { onAuthStateChange, signOutUser } from "./firebase-init.js";

// Inject CSS styles for user avatar and dropdown
const authStyles = document.createElement('style');
authStyles.textContent = `
  /* User Avatar & Dropdown */
  .user-avatar-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .user-avatar-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #23384F, #A87545);
    border: 2px solid #FFFFFF;
    box-shadow: 0 2px 10px rgba(35, 56, 79, .15);
    color: #FFFFFF;
    font-family: 'Geist Mono', ui-monospace, Menlo, monospace;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease;
    padding: 0;
    outline: none;
  }
  .user-avatar-btn:hover {
    transform: scale(1.06);
    box-shadow: 0 4px 14px rgba(35, 56, 79, .25);
  }
  .user-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    min-width: 220px;
    background: #FFFFFF;
    border: 1px solid rgba(184, 161, 139, .35);
    border-radius: 14px;
    box-shadow: 0 16px 36px -4px rgba(35, 56, 79, .18), 0 0 0 1px rgba(0,0,0,0.03);
    padding: 12px;
    display: none;
    z-index: 1000;
    text-align: left;
    animation: authDropIn .2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes authDropIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .user-avatar-wrap.open .user-dropdown {
    display: block;
  }
  .user-dropdown-header {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 2px 4px 8px;
  }
  .user-dropdown-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #23384F;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-dropdown-email {
    font-size: 11.5px;
    color: #B8A18B;
    font-family: 'Geist Mono', monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-dropdown-role {
    font-family: 'Geist Mono', monospace;
    font-size: 9.5px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(168, 117, 69, .12);
    color: #A87545;
    width: fit-content;
    margin-top: 4px;
  }
  .user-dropdown-divider {
    height: 1px;
    background: #EAE4DE;
    margin: 6px 0;
  }
  .user-dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 12.5px;
    color: #dc2626;
    cursor: pointer;
    border: none;
    background: none;
    transition: background .15s ease;
    font-family: 'Geist', sans-serif;
    font-weight: 500;
  }
  .user-dropdown-item:hover {
    background: #fef2f2;
  }
  .nav-login-btn {
    padding: 7px 16px;
    border-radius: 10px;
    font-size: 12.5px;
    font-weight: 500;
    background: #23384F;
    color: #FFFFFF;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background .2s, transform .2s;
    text-decoration: none;
  }
  .nav-login-btn:hover {
    background: #31465F;
    transform: translateY(-1px);
    color: #FFFFFF;
  }
`;
document.head.appendChild(authStyles);

function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'U';
}

function initNavbarAuth() {
  const navCtaList = document.querySelectorAll('.nav-cta');
  if (!navCtaList.length) return;

  onAuthStateChange(({ isAuthenticated, user, profile }) => {
    // Expose global currentUser for instant check across pages
    window.ostaadCurrentUser = isAuthenticated ? user : null;
    window.ostaadUserProfile = isAuthenticated ? profile : null;

    navCtaList.forEach(navCta => {
      // Find or identify the Start a Project / Auth button
      let authBtn = navCta.querySelector('.nav-btn, .btn, .nav-login-btn');
      let avatarWrap = navCta.querySelector('.user-avatar-wrap');

      if (!isAuthenticated) {
        // User is Logged Out: Show 'Login' button
        if (avatarWrap) avatarWrap.remove();

        if (authBtn) {
          authBtn.className = 'nav-login-btn';
          authBtn.href = `login.html?redirect=${encodeURIComponent(window.location.pathname.split('/').pop() || 'products.html')}`;
          authBtn.innerHTML = `Login <span class="arrow">→</span>`;
          authBtn.style.display = 'inline-flex';
        } else {
          const newBtn = document.createElement('a');
          newBtn.className = 'nav-login-btn';
          newBtn.href = `login.html?redirect=${encodeURIComponent(window.location.pathname.split('/').pop() || 'products.html')}`;
          newBtn.innerHTML = `Login <span class="arrow">→</span>`;
          navCta.appendChild(newBtn);
        }
      } else {
        // User is Logged In: Show Initials in circular avatar icon
        if (authBtn) authBtn.style.display = 'none';

        if (!avatarWrap) {
          avatarWrap = document.createElement('div');
          avatarWrap.className = 'user-avatar-wrap';
          navCta.appendChild(avatarWrap);
        }

        const displayName = user.displayName || (profile ? profile.displayName : 'Ostaad Member');
        const displayEmail = user.email || '';
        const displayRole = profile && profile.role ? profile.role : 'Member';
        const initials = getInitials(displayName, displayEmail);

        avatarWrap.innerHTML = `
          <button type="button" class="user-avatar-btn" aria-label="User Profile" title="${displayName}">
            ${initials}
          </button>
          <div class="user-dropdown">
            <div class="user-dropdown-header">
              <span class="user-dropdown-name">${displayName}</span>
              <span class="user-dropdown-email">${displayEmail}</span>
              <span class="user-dropdown-role">${displayRole}</span>
            </div>
            <div class="user-dropdown-divider"></div>
            <button type="button" class="user-dropdown-item signout-btn">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        `;

        const avatarBtn = avatarWrap.querySelector('.user-avatar-btn');
        const signoutBtn = avatarWrap.querySelector('.signout-btn');

        avatarBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          avatarWrap.classList.toggle('open');
        });

        signoutBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await signOutUser();
          avatarWrap.classList.remove('open');
        });
      }
    });
  });
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-avatar-wrap')) {
    document.querySelectorAll('.user-avatar-wrap.open').forEach(wrap => {
      wrap.classList.remove('open');
    });
  }
});

// Close dropdown on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.user-avatar-wrap.open').forEach(wrap => {
      wrap.classList.remove('open');
    });
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbarAuth);
} else {
  initNavbarAuth();
}

export { initNavbarAuth };
