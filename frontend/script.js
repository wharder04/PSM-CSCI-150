/**
 * Frontend wiring for PMS auth
 * Adjust BASE_URL to match your backend dev server.
 */
const BASE_URL = 'http://localhost:4000'; // process.env.NEXT_PUBLIC_API_URL in Next.js

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include', // IMPORTANT for HttpOnly cookie
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  let data = {};
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Utility helpers **/
function $(sel) { return document.querySelector(sel); }
function on(id, evt, fn) { const el = typeof id === 'string' ? $(id) : id; if (el) el.addEventListener(evt, fn); }
function setMsg(el, text, ok=false){ if(!el) return; el.textContent = text || ''; el.classList.toggle('success', !!ok); el.classList.toggle('error', !ok && !!text); }

/** Pages init **/
document.addEventListener('DOMContentLoaded', () => {
  // Register page
  const regForm = $('#registerForm');
  if (regForm) {
    on(regForm, 'submit', async (e) => {
      e.preventDefault();
      const name = $('#name')?.value?.trim() || '';
      const email = $('#email')?.value?.trim();
      const password = $('#password')?.value;
      const msgEl = $('#registerMsg');
      setMsg(msgEl, '');

      if (!email || !password) return setMsg(msgEl, 'Email and password are required.');

      try {
        await api('/auth/register', { method:'POST', body: JSON.stringify({ name, email, password }) });
        setMsg(msgEl, 'Account created! Redirecting…', true);
        setTimeout(()=> { window.location.href = 'index.html'; }, 700);
      } catch (err) {
        setMsg(msgEl, err.message);
      }
    });
  }

  // Login page
  const loginForm = $('#loginForm');
  if (loginForm) {
    on(loginForm, 'submit', async (e) => {
      e.preventDefault();
      const email = $('#email')?.value?.trim();
      const password = $('#password')?.value;
      const remember = $('#remember')?.checked || false;
      const msgEl = $('#loginMsg');
      setMsg(msgEl, '');

      if (!email || !password) return setMsg(msgEl, 'Email and password are required.');
      try {
        await api('/auth/login', { method:'POST', body: JSON.stringify({ email, password, remember }) });
        window.location.href = 'index.html';
      } catch (err) {
        setMsg(msgEl, err.message);
      }
    });
  }

  // Dashboard page
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn || window.location.pathname.endsWith('index.html') || window.location.pathname === '/' ) {
    protectDashboard();
  }
  if (logoutBtn) {
    on(logoutBtn, 'click', async () => {
      try {
        await api('/auth/logout', { method: 'POST' });
      } catch (_) {}
      window.location.href = 'login.html';
    });
  }
});

/** Require auth on dashboard, show name, redirect if 401 **/
async function protectDashboard(){
  const welcome = $('#welcome');
  try {
    const me = await api('/auth/me', { method: 'GET' });
    if (welcome) welcome.textContent = `Welcome to your Dashboard, ${me.name || me.email}!`;
  } catch (err) {
    // Not logged in
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
    }
  }
}
