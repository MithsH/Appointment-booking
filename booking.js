// Auth guard
if (!requireAuth('user')) { /* redirect handled */ }

renderNavbar();

// ===== STATE =====
let selectedProvider = null;
let selectedService = null;
let selectedSlot = null;
let currentStep = 1;

// ===== STEP MANAGEMENT =====
function goToStep(step) {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`step${i}`).classList.add('hidden');
    const ind = document.getElementById(`step-ind-${i}`);
    ind.style.background = 'var(--white)';
    ind.style.color = 'var(--gray)';
  }
  document.getElementById(`step${step}`).classList.remove('hidden');
  const activeInd = document.getElementById(`step-ind-${step}`);
  activeInd.style.background = 'var(--primary)';
  activeInd.style.color = 'white';
  currentStep = step;

  // Mark completed steps
  for (let i = 1; i < step; i++) {
    const ind = document.getElementById(`step-ind-${i}`);
    ind.style.background = 'var(--success)';
    ind.style.color = 'white';
  }
}

// ===== STEP 1: PROVIDERS =====
async function loadProviders() {
  const container = document.getElementById('providersContainer');
  try {
    const data = await apiFetch('/providers');
    if (!data.providers.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div><h3>No Providers Available</h3><p>Check back later.</p></div>`;
      return;
    }
    container.innerHTML = `<div class="providers-grid">${data.providers.map(p => `
      <div class="provider-card" onclick="selectProvider(${JSON.stringify(p).replace(/"/g, '&quot;')})">
        <div class="provider-avatar">${p.name.charAt(0).toUpperCase()}</div>
        <h3>${p.name}</h3>
        <p>${p.bio || 'Professional service provider'}</p>
        <p style="color:var(--gray);font-size:0.8rem">📧 ${p.email}</p>
        ${p.phone ? `<p style="color:var(--gray);font-size:0.8rem">📞 ${p.phone}</p>` : ''}
        <br/>
        <button class="btn btn-primary btn-full">Select Provider →</button>
      </div>
    `).join('')}</div>`;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function selectProvider(provider) {
  selectedProvider = provider;
  document.getElementById('selectedProviderName').textContent = provider.name;
  goToStep(2);
  loadServices(provider._id);
}

// ===== STEP 2: SERVICES =====
async function loadServices(providerId) {
  const container = document.getElementById('servicesContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading services...</div>';
  try {
    const data = await apiFetch(`/providers/${providerId}/services`);
    if (!data.services.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🛠</div><h3>No Services Available</h3><p>This provider hasn't added services yet.</p></div>`;
      return;
    }
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;">
        ${data.services.map(s => `
          <div class="provider-card" onclick='selectService(${JSON.stringify(s).replace(/'/g, "&#39;")})' style="cursor:pointer;">
            <div style="font-size:2rem;margin-bottom:0.75rem;">🛠</div>
            <h3>${s.name}</h3>
            <p>${s.description}</p>
            <div style="display:flex;justify-content:space-between;margin-top:0.75rem;font-weight:600;">
              <span style="color:var(--primary)">${formatCurrency(s.price)}</span>
              <span style="color:var(--gray)">${s.duration} min</span>
            </div>
            <br/>
            <button class="btn btn-primary btn-full">Select →</button>
          </div>
        `).join('')}
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function selectService(service) {
  selectedService = service;
  document.getElementById('selectedServiceName').textContent = service.name;
  document.getElementById('selectedServicePrice').textContent = formatCurrency(service.price);
  document.getElementById('selectedServiceDuration').textContent = `${service.duration} min`;

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').min = today;
  document.getElementById('bookingDate').value = '';

  goToStep(3);
  document.getElementById('slotsSection').classList.add('hidden');
  selectedSlot = null;
}

// ===== STEP 3: SLOTS =====
async function loadSlots() {
  const date = document.getElementById('bookingDate').value;
  if (!date) return;

  const slotsSection = document.getElementById('slotsSection');
  const container = document.getElementById('slotsContainer');
  slotsSection.classList.remove('hidden');
  container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading slots...</div>';
  selectedSlot = null;

  try {
    const data = await apiFetch(`/appointments/slots/${selectedProvider._id}?date=${date}`);
    if (!data.slots.length) {
      container.innerHTML = `<div class="empty-state" style="padding:1.5rem 0"><div class="empty-icon">😔</div><h3>No Available Slots</h3><p>Try a different date.</p></div>`;
      return;
    }
    container.innerHTML = data.slots.map(slot => `
      <button class="slot-btn" data-start="${slot.start}" data-end="${slot.end}" onclick="selectSlot(this, '${slot.start}', '${slot.end}')">
        ${slot.start}<br/><small style="font-size:0.75rem;opacity:0.8">to ${slot.end}</small>
      </button>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function selectSlot(el, start, end) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  selectedSlot = { start, end };

  // Go to step 4
  setTimeout(() => {
    const date = document.getElementById('bookingDate').value;
    populateConfirmation(date, start, end);
    goToStep(4);
  }, 300);
}

// ===== STEP 4: CONFIRM =====
function populateConfirmation(date, start, end) {
  document.getElementById('confirmProvider').textContent = selectedProvider.name;
  document.getElementById('confirmService').textContent = selectedService.name;
  document.getElementById('confirmDate').textContent = formatDate(date);
  document.getElementById('confirmTime').textContent = `${start} – ${end}`;
  document.getElementById('confirmDuration').textContent = `${selectedService.duration} minutes`;
  document.getElementById('confirmPrice').textContent = formatCurrency(selectedService.price);
}

async function confirmBooking() {
  const notes = document.getElementById('bookingNotes').value.trim();
  const date = document.getElementById('bookingDate').value;

  setLoading('confirmBtn', true, '✓ Confirm Booking');
  try {
    await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify({
        providerId: selectedProvider._id,
        serviceId: selectedService._id,
        date,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        notes
      })
    });

    showAlert('alert-container', '🎉 Appointment booked successfully! Redirecting to your dashboard...', 'success');
    setTimeout(() => { window.location.href = '/user-dashboard.html'; }, 2000);
  } catch (err) {
    showAlert('alert-container', err.message, 'error');
    setLoading('confirmBtn', false, '✓ Confirm Booking');
    goToStep(3);
  }
}

// ===== INIT =====
loadProviders();
