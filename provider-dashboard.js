// Auth guard
if (!requireAuth('provider')) { /* redirect handled */ }

const user = getUser();
renderNavbar();

// Set welcome message
document.getElementById('welcomeMsg').textContent = `Welcome back, ${user.name}!`;

// ===== SECTION NAVIGATION =====
const sections = ['bookings', 'services', 'availability'];
const navLinks = document.querySelectorAll('.sidebar-nav a[data-section]');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.dataset.section;
    showSection(section);
  });
});

function showSection(name) {
  sections.forEach(s => {
    document.getElementById(`section-${s}`).classList.add('hidden');
  });
  document.getElementById(`section-${name}`).classList.remove('hidden');

  navLinks.forEach(l => l.classList.remove('active'));
  document.querySelector(`[data-section="${name}"]`).classList.add('active');

  // Load data
  if (name === 'bookings') loadBookings();
  else if (name === 'services') loadServices();
  else if (name === 'availability') loadAvailability();
}

// ===== BOOKINGS =====
let allBookings = [];

async function loadBookings() {
  const container = document.getElementById('bookingsContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading bookings...</div>';
  try {
    const data = await apiFetch('/providers/bookings/all');
    allBookings = data.appointments;
    updateStats(allBookings);
    renderBookings(allBookings);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function updateStats(bookings) {
  document.getElementById('statBookings').textContent = bookings.length;
  document.getElementById('statPending').textContent = bookings.filter(b => b.status === 'pending').length;
  document.getElementById('statApproved').textContent = bookings.filter(b => b.status === 'approved').length;
}

function renderBookings(bookings) {
  const container = document.getElementById('bookingsContainer');
  if (!bookings.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No Bookings Yet</h3>
        <p>When customers book your services, they'll appear here.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>Date</th>
            <th>Time</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(b => `
            <tr>
              <td>
                <strong>${b.user?.name || 'N/A'}</strong><br/>
                <small style="color:var(--gray)">${b.user?.email || ''}</small>
              </td>
              <td>${b.service?.name || 'N/A'}</td>
              <td>${formatDate(b.date)}</td>
              <td>${b.startTime} – ${b.endTime}</td>
              <td>${formatCurrency(b.service?.price || 0)}</td>
              <td>${statusBadge(b.status)}</td>
              <td>
                ${b.status === 'pending' ? `
                  <button class="btn btn-success btn-sm" onclick="updateStatus('${b._id}', 'approved')">✓ Approve</button>
                  <button class="btn btn-danger btn-sm" onclick="updateStatus('${b._id}', 'cancelled')">✗ Cancel</button>
                ` : b.status === 'approved' ? `
                  <button class="btn btn-sm btn-outline" onclick="updateStatus('${b._id}', 'completed')">✓ Complete</button>
                  <button class="btn btn-danger btn-sm" onclick="updateStatus('${b._id}', 'cancelled')">✗ Cancel</button>
                ` : `<span style="color:var(--gray);font-size:0.85rem">${b.status}</span>`}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

async function updateStatus(id, status) {
  try {
    await apiFetch(`/providers/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    showAlert('alert-container', `Appointment ${status} successfully!`, 'success');
    loadBookings();
  } catch (err) {
    showAlert('alert-container', err.message, 'error');
  }
}

// ===== SERVICES =====
let editingServiceId = null;

function openServiceModal(service = null) {
  editingServiceId = service ? service._id : null;
  document.getElementById('serviceModalTitle').textContent = service ? 'Edit Service' : 'Add Service';
  document.getElementById('serviceName').value = service ? service.name : '';
  document.getElementById('serviceDesc').value = service ? service.description : '';
  document.getElementById('servicePrice').value = service ? service.price : '';
  document.getElementById('serviceDuration').value = service ? service.duration : '';
  document.getElementById('serviceModal').classList.remove('hidden');
}

function closeServiceModal() {
  document.getElementById('serviceModal').classList.add('hidden');
  document.getElementById('service-alert').innerHTML = '';
}

async function submitService() {
  const name = document.getElementById('serviceName').value.trim();
  const description = document.getElementById('serviceDesc').value.trim();
  const price = parseFloat(document.getElementById('servicePrice').value);
  const duration = parseInt(document.getElementById('serviceDuration').value);

  if (!name || !description || isNaN(price) || isNaN(duration)) {
    showAlert('service-alert', 'All fields are required', 'error');
    return;
  }

  setLoading('serviceSubmitBtn', true, 'Save Service');
  try {
    if (editingServiceId) {
      await apiFetch(`/providers/services/${editingServiceId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description, price, duration })
      });
      showAlert('alert-container', 'Service updated!', 'success');
    } else {
      await apiFetch('/providers/services', {
        method: 'POST',
        body: JSON.stringify({ name, description, price, duration })
      });
      showAlert('alert-container', 'Service created!', 'success');
    }
    closeServiceModal();
    loadServices();
  } catch (err) {
    showAlert('service-alert', err.message, 'error');
  }
  setLoading('serviceSubmitBtn', false, 'Save Service');
}

async function loadServices() {
  const container = document.getElementById('servicesContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading...</div>';
  try {
    const data = await apiFetch('/providers/services/my');
    document.getElementById('statServices').textContent = data.services.length;
    renderServices(data.services);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function renderServices(services) {
  const container = document.getElementById('servicesContainer');
  if (!services.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛠</div>
        <h3>No Services Yet</h3>
        <p>Add your first service so customers can book appointments.</p>
        <br/><button class="btn btn-primary" onclick="openServiceModal()">+ Add Service</button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${services.map(s => `
            <tr>
              <td><strong>${s.name}</strong></td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.description}</td>
              <td>${formatCurrency(s.price)}</td>
              <td>${s.duration} min</td>
              <td>
                <button class="btn btn-sm btn-outline" onclick='openServiceModal(${JSON.stringify(s)})'>✏ Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteService('${s._id}')">🗑 Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

async function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  try {
    await apiFetch(`/providers/services/${id}`, { method: 'DELETE' });
    showAlert('alert-container', 'Service deleted', 'success');
    loadServices();
  } catch (err) {
    showAlert('alert-container', err.message, 'error');
  }
}

// ===== AVAILABILITY =====
function openAvailabilityModal() {
  document.getElementById('availDay').value = '';
  document.getElementById('availStart').value = '09:00';
  document.getElementById('availEnd').value = '17:00';
  document.getElementById('availSlot').value = '30';
  document.getElementById('availabilityModal').classList.remove('hidden');
}

function closeAvailabilityModal() {
  document.getElementById('availabilityModal').classList.add('hidden');
  document.getElementById('avail-alert').innerHTML = '';
}

async function submitAvailability() {
  const dayOfWeek = document.getElementById('availDay').value;
  const startTime = document.getElementById('availStart').value;
  const endTime = document.getElementById('availEnd').value;
  const slotDuration = parseInt(document.getElementById('availSlot').value);

  if (dayOfWeek === '' || !startTime || !endTime) {
    showAlert('avail-alert', 'All fields are required', 'error');
    return;
  }

  setLoading('availSubmitBtn', true, 'Save Schedule');
  try {
    await apiFetch('/providers/availability', {
      method: 'POST',
      body: JSON.stringify({ dayOfWeek: parseInt(dayOfWeek), startTime, endTime, slotDuration })
    });
    showAlert('alert-container', 'Availability saved!', 'success');
    closeAvailabilityModal();
    loadAvailability();
  } catch (err) {
    showAlert('avail-alert', err.message, 'error');
  }
  setLoading('availSubmitBtn', false, 'Save Schedule');
}

async function loadAvailability() {
  const container = document.getElementById('availabilityContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading...</div>';
  try {
    const data = await apiFetch('/providers/availability/my');
    renderAvailability(data.availability);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function renderAvailability(availability) {
  const container = document.getElementById('availabilityContainer');
  if (!availability.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🕐</div>
        <h3>No Schedule Set</h3>
        <p>Set your weekly availability so customers can book appointments.</p>
        <br/><button class="btn btn-primary" onclick="openAvailabilityModal()">+ Add Schedule</button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Slot Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${availability.map(a => `
            <tr>
              <td><strong>${dayNames[a.dayOfWeek]}</strong></td>
              <td>${a.startTime}</td>
              <td>${a.endTime}</td>
              <td>${a.slotDuration} min</td>
              <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAvailability(${a.dayOfWeek})">🗑 Remove</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

async function deleteAvailability(dayOfWeek) {
  if (!confirm(`Remove availability for ${dayNames[dayOfWeek]}?`)) return;
  try {
    await apiFetch(`/providers/availability/${dayOfWeek}`, { method: 'DELETE' });
    showAlert('alert-container', 'Availability removed', 'success');
    loadAvailability();
  } catch (err) {
    showAlert('alert-container', err.message, 'error');
  }
}

// ===== INIT =====
loadBookings();
