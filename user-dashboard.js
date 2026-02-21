// Auth guard
if (!requireAuth('user')) { /* redirect handled */ }

const user = getUser();
renderNavbar();
document.getElementById('welcomeMsg').textContent = `Welcome back, ${user.name}!`;

let allAppointments = [];

async function loadAppointments() {
  const container = document.getElementById('appointmentsContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading...</div>';
  try {
    const data = await apiFetch('/appointments/my');
    allAppointments = data.appointments;
    updateStats(allAppointments);
    filterAppointments();
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function updateStats(appointments) {
  document.getElementById('statTotal').textContent = appointments.length;
  document.getElementById('statPending').textContent = appointments.filter(a => a.status === 'pending').length;
  document.getElementById('statApproved').textContent = appointments.filter(a => a.status === 'approved').length;
  document.getElementById('statCancelled').textContent = appointments.filter(a => a.status === 'cancelled').length;
}

function filterAppointments() {
  const filter = document.getElementById('filterStatus').value;
  const filtered = filter ? allAppointments.filter(a => a.status === filter) : allAppointments;
  renderAppointments(filtered);
}

function renderAppointments(appointments) {
  const container = document.getElementById('appointmentsContainer');
  if (!appointments.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>No Appointments Found</h3>
        <p>You haven't booked any appointments yet.</p>
        <br/><a href="/booking.html" class="btn btn-primary">Book Now</a>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Service</th>
            <th>Date</th>
            <th>Time</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${appointments.map(a => `
            <tr>
              <td><strong>${a.provider?.name || 'N/A'}</strong></td>
              <td>${a.service?.name || 'N/A'}</td>
              <td>${formatDate(a.date)}</td>
              <td>${a.startTime} – ${a.endTime}</td>
              <td>${formatCurrency(a.service?.price || 0)}</td>
              <td>${statusBadge(a.status)}</td>
              <td>
                ${!['cancelled', 'completed'].includes(a.status) ? `
                  <button class="btn btn-sm btn-outline-danger" onclick="cancelAppointment('${a._id}')">✗ Cancel</button>
                ` : `<span style="color:var(--gray);font-size:0.85rem">—</span>`}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

async function cancelAppointment(id) {
  if (!confirm('Are you sure you want to cancel this appointment?')) return;
  try {
    await apiFetch(`/appointments/${id}/cancel`, { method: 'PUT' });
    showAlert('alert-container', 'Appointment cancelled successfully', 'success');
    loadAppointments();
  } catch (err) {
    showAlert('alert-container', err.message, 'error');
  }
}

loadAppointments();
