const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const Service = require('../models/Service');

// Helper: generate time slots
const generateSlots = (startTime, endTime, slotDuration) => {
  const slots = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;

  while (current + slotDuration <= end) {
    const hours = Math.floor(current / 60).toString().padStart(2, '0');
    const mins = (current % 60).toString().padStart(2, '0');
    const endMins = current + slotDuration;
    const eHours = Math.floor(endMins / 60).toString().padStart(2, '0');
    const eMins = (endMins % 60).toString().padStart(2, '0');
    slots.push({ start: `${hours}:${mins}`, end: `${eHours}:${eMins}` });
    current += slotDuration;
  }
  return slots;
};

// @desc    Get available slots for a provider on a date
// @route   GET /api/appointments/slots/:providerId?date=YYYY-MM-DD
// @access  Public
const getAvailableSlots = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ success: false, message: 'Date query param required' });

    const dateObj = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return res.status(400).json({ success: false, message: 'Cannot book past dates' });
    }

    const dayOfWeek = dateObj.getDay(); // 0=Sun
    const availability = await Availability.findOne({ provider: providerId, dayOfWeek, isActive: true });
    if (!availability) {
      return res.json({ success: true, slots: [], message: 'Provider not available on this day' });
    }

    // Generate all possible slots
    const allSlots = generateSlots(availability.startTime, availability.endTime, availability.slotDuration);

    // Get already booked slots (non-cancelled)
    const bookedAppointments = await Appointment.find({
      provider: providerId,
      date,
      status: { $nin: ['cancelled'] }
    });
    const bookedTimes = bookedAppointments.map(a => a.startTime);

    // Filter out booked slots
    const now = new Date();
    const isToday = date === now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const availableSlots = allSlots.filter(slot => {
      if (bookedTimes.includes(slot.start)) return false;
      if (isToday) {
        const [sh, sm] = slot.start.split(':').map(Number);
        if (sh * 60 + sm <= currentMinutes) return false;
      }
      return true;
    });

    res.json({ success: true, date, slots: availableSlots });
  } catch (error) {
    next(error);
  }
};

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (user)
const bookAppointment = async (req, res, next) => {
  try {
    const { providerId, serviceId, date, startTime, endTime, notes } = req.body;

    if (!providerId || !serviceId || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate date not in past
    const dateObj = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return res.status(400).json({ success: false, message: 'Cannot book past dates' });
    }

    // Check if today and time not passed
    const now = new Date();
    const isToday = date === now.toISOString().split('T')[0];
    if (isToday) {
      const [sh, sm] = startTime.split(':').map(Number);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (sh * 60 + sm <= currentMinutes) {
        return res.status(400).json({ success: false, message: 'Cannot book a past time slot' });
      }
    }

    // Validate service belongs to provider
    const service = await Service.findOne({ _id: serviceId, provider: providerId, isActive: true });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found for this provider' });
    }

    // Check for double booking
    const existing = await Appointment.findOne({
      provider: providerId,
      date,
      startTime,
      status: { $nin: ['cancelled'] }
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      user: req.user.id,
      provider: providerId,
      service: serviceId,
      date,
      startTime,
      endTime,
      notes,
      status: 'pending'
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('provider', 'name email')
      .populate('service', 'name price duration');

    res.status(201).json({ success: true, appointment: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's appointments
// @route   GET /api/appointments/my
// @access  Private (user)
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .populate('provider', 'name email')
      .populate('service', 'name price duration')
      .sort({ date: -1, startTime: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment (user)
// @route   PUT /api/appointments/:id/cancel
// @access  Private (user)
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${appointment.status} appointment` });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ success: true, message: 'Appointment cancelled', appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAvailableSlots, bookAppointment, getMyAppointments, cancelAppointment };
