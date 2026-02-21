const User = require('../models/User');
const Service = require('../models/Service');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
const getProviders = async (req, res, next) => {
  try {
    const providers = await User.find({ role: 'provider' }).select('-password');
    res.json({ success: true, count: providers.length, providers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
const getProvider = async (req, res, next) => {
  try {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' }).select('-password');
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// ============ SERVICES ============

// @desc    Create service
// @route   POST /api/providers/services
// @access  Private (provider)
const createService = async (req, res, next) => {
  try {
    const { name, description, price, duration } = req.body;
    if (!name || !description || price === undefined || !duration) {
      return res.status(400).json({ success: false, message: 'All service fields are required' });
    }
    const service = await Service.create({ provider: req.user.id, name, description, price, duration });
    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Get services for a provider
// @route   GET /api/providers/:providerId/services
// @access  Public
const getProviderServices = async (req, res, next) => {
  try {
    const services = await Service.find({ provider: req.params.providerId, isActive: true });
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my services (provider)
// @route   GET /api/providers/services/my
// @access  Private (provider)
const getMyServices = async (req, res, next) => {
  try {
    const services = await Service.find({ provider: req.user.id });
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/providers/services/:id
// @access  Private (provider)
const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/providers/services/:id
// @access  Private (provider)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await service.deleteOne();
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
};

// ============ AVAILABILITY ============

// @desc    Set/update availability
// @route   POST /api/providers/availability
// @access  Private (provider)
const setAvailability = async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, slotDuration } = req.body;
    if (dayOfWeek === undefined || !startTime || !endTime || !slotDuration) {
      return res.status(400).json({ success: false, message: 'All availability fields are required' });
    }

    // Validate times
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    if (sh * 60 + sm >= eh * 60 + em) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const availability = await Availability.findOneAndUpdate(
      { provider: req.user.id, dayOfWeek },
      { provider: req.user.id, dayOfWeek, startTime, endTime, slotDuration, isActive: true },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ success: true, availability });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my availability
// @route   GET /api/providers/availability/my
// @access  Private (provider)
const getMyAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.find({ provider: req.user.id }).sort('dayOfWeek');
    res.json({ success: true, availability });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider availability (public)
// @route   GET /api/providers/:providerId/availability
// @access  Public
const getProviderAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.find({ provider: req.params.providerId, isActive: true }).sort('dayOfWeek');
    res.json({ success: true, availability });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete availability for a day
// @route   DELETE /api/providers/availability/:dayOfWeek
// @access  Private (provider)
const deleteAvailability = async (req, res, next) => {
  try {
    await Availability.findOneAndDelete({ provider: req.user.id, dayOfWeek: req.params.dayOfWeek });
    res.json({ success: true, message: 'Availability removed' });
  } catch (error) {
    next(error);
  }
};

// ============ PROVIDER BOOKINGS ============

// @desc    Get all bookings for provider
// @route   GET /api/providers/bookings
// @access  Private (provider)
const getProviderBookings = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ provider: req.user.id })
      .populate('user', 'name email phone')
      .populate('service', 'name price duration')
      .sort({ date: -1, startTime: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (approve/cancel)
// @route   PUT /api/providers/bookings/:id
// @access  Private (provider)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.provider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    appointment.status = status;
    await appointment.save();
    appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('service', 'name price');
    res.json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProviders, getProvider,
  createService, getProviderServices, getMyServices, updateService, deleteService,
  setAvailability, getMyAvailability, getProviderAvailability, deleteAvailability,
  getProviderBookings, updateBookingStatus
};
