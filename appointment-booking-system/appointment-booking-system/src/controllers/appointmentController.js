const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const Service = require('../models/Service');
const { generateTimeSlots, getDayOfWeek } = require('../utils/slotGenerator');

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (User)
exports.createAppointment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { providerId, serviceId, date, timeSlot, notes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }

    if (service.provider.toString() !== providerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Service does not belong to this provider'
      });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = getDayOfWeek(appointmentDate);

    const availability = await Availability.findOne({
      provider: providerId,
      dayOfWeek,
      isActive: true
    });

    if (!availability) {
      return res.status(400).json({
        status: 'error',
        message: 'Provider is not available on this day'
      });
    }

    const validSlots = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration
    );

    if (!validSlots.includes(timeSlot)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid time slot for this provider'
      });
    }

    const existingAppointment = await Appointment.findOne({
      provider: providerId,
      date: appointmentDate,
      timeSlot,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        status: 'error',
        message: 'This time slot is already booked'
      });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      provider: providerId,
      service: serviceId,
      date: appointmentDate,
      timeSlot,
      notes
    });

    await appointment.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' },
      { path: 'service', select: 'name duration price' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Appointment created successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        status: 'error',
        message: 'Date is required'
      });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = getDayOfWeek(appointmentDate);

    const availability = await Availability.findOne({
      provider: providerId,
      dayOfWeek,
      isActive: true
    });

    if (!availability) {
      return res.status(200).json({
        status: 'success',
        message: 'No availability set for this day',
        data: {
          slots: []
        }
      });
    }

    const allSlots = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration
    );

    const bookedAppointments = await Appointment.find({
      provider: providerId,
      date: appointmentDate,
      status: { $in: ['pending', 'approved'] }
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({
      status: 'success',
      data: {
        date,
        dayOfWeek,
        totalSlots: allSlots.length,
        availableSlots: availableSlots.length,
        slots: availableSlots
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('provider', 'name email phone')
      .populate('service', 'name duration price')
      .sort({ date: -1, timeSlot: -1 });

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.getProviderAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    
    const filter = { provider: req.user._id };
    if (status) filter.status = status;
    if (date) filter.date = new Date(date);

    const appointments = await Appointment.find(filter)
      .populate('user', 'name email phone')
      .populate('service', 'name duration price')
      .sort({ date: -1, timeSlot: -1 });

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, cancelReason } = req.body;

    if (!['pending', 'approved', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value'
      });
    }

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    if (appointment.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this appointment'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, cancelReason },
      { new: true, runValidators: true }
    ).populate([
      { path: 'user', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' },
      { path: 'service', select: 'name duration price' }
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Appointment status updated successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this appointment'
      });
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: `Cannot cancel appointment with status: ${appointment.status}`
      });
    }

    const { cancelReason } = req.body;

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancelReason },
      { new: true, runValidators: true }
    ).populate([
      { path: 'provider', select: 'name email phone' },
      { path: 'service', select: 'name duration price' }
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Appointment cancelled successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'name duration price category');

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    const isAuthorized = 
      appointment.user._id.toString() === req.user._id.toString() ||
      appointment.provider._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this appointment'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        appointment
      }
    });

  } catch (error) {
    next(error);
  }
};
