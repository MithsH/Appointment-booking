// ===== CONFIG =====
const API_BASE = 'http://localhost:5000/api';

// ===== TOKEN MANAGEMENT =====
const getToken = () => localStorage.getItem('token');
const getUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};
const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ===== FETCH WRAPPER =====
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// ===== AUTH GUARD =====
const requireAuth = (role) => {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    window.location.href = '/login.html';
    return false;
  }
  if (role && user.role !== role) {
    window.location.href = user.role === 'provider' ? '/provider-dashboard.html' : '/user-dashboard.html';
    return false;
  }
  return true;
};

const redirectIfLoggedIn = () => {
  const user = getUser();
  if (user) {
    window.location.href = user.role === 'provider' ? '/provider-dashboard.html' : '/user-dashboard.html';
  }
};

// ===== LOGOUT =====
const logout = () => {
  clearAuth();
  window.location.href = '/login.html';
};

// ===== SHOW ALERT =====
const showAlert = (containerId, message, type = 'error') => {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => { container.innerHTML = ''; }, 5000);
};

// ===== LOADING HELPER =====
const setLoading = (btnId, loading, text = 'Submit') => {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span> Loading...`
    : text;
};

// ===== NAVBAR =====
const renderNavbar = (activePage = '') => {
  const user = getUser();
  const nav = document.getElementById('navbar');
  if (!nav) return;

  nav.innerHTML = `
    <a href="/index.html" class="navbar-brand">📅 <span>BookMe</span></a>
    <nav>
      <ul class="navbar-nav">
        ${!user ? `
          <li><a href="/index.html" ${activePage==='home'?'style="color:var(--primary)"':''}>Home</a></li>
          <li><a href="/login.html" ${activePage==='login'?'style="color:var(--primary)"':''}>Login</a></li>
          <li><a href="/register.html"><button class="btn btn-primary btn-sm">Get Started</button></a></li>
        ` : `
          <li><a href="${user.role === 'provider' ? '/provider-dashboard.html' : '/user-dashboard.html'}">Dashboard</a></li>
          ${user.role === 'user' ? `<li><a href="/booking.html">Book Appointment</a></li>` : ''}
        `}
      </ul>
    </nav>
    ${user ? `
      <div class="navbar-user">
        <span>👤 ${user.name}</span>
        <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
      </div>
    ` : ''}
  `;
};

// ===== BADGE HELPER =====
const statusBadge = (status) => `<span class="badge badge-${status}">${status}</span>`;

// ===== FORMAT DATE =====
const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

// ===== FORMAT CURRENCY =====
const formatCurrency = (amount) => `$${Number(amount).toFixed(2)}`;

// ===== DAY NAME =====
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
