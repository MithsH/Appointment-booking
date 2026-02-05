const { validationResult } = require('express-validator');
const Availability = require('../models/Availability');

// @desc    Create availability
// @route   POST /api/availability
// @access  Private (Provider only)
exports.createAvailability = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { dayOfWeek, startTime, endTime, slotDuration } = req.body;

    // Check if availability already exists for this day
    const existingAvailability = await Availability.findOne({
      provider: req.user._id,
      dayOfWeek
    });

    if (existingAvailability) {
      return res.status(400).json({
        status: 'error',
        message: `Availability already exists for this day. Please update the existing one.`
      });
    }

    // Create availability
    const availability = await Availability.create({
      provider: req.user._id,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration
    });

    res.status(201).json({
      status: 'success',
      message: 'Availability created successfully',
      data: {
        availability
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all availability for a provider
// @route   GET /api/availability/provider/:providerId
// @access  Public
exports.getProviderAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.find({
      provider: req.params.providerId,
      isActive: true
    }).sort({ dayOfWeek: 1 });

    res.status(200).json({
      status: 'success',
      results: availability.length,
      data: {
        availability
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get my availability
// @route   GET /api/availability/my-availability
// @access  Private (Provider only)
exports.getMyAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.find({
      provider: req.user._id
    }).sort({ dayOfWeek: 1 });

    res.status(200).json({
      status: 'success',
      results: availability.length,
      data: {
        availability
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update availability
// @route   PUT /api/availability/:id
// @access  Private (Provider only - own availability)
exports.updateAvailability = async (req, res, next) => {
  try {
    let availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        status: 'error',
        message: 'Availability not found'
      });
    }

    // Check ownership
    if (availability.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this availability'
      });
    }

    const { startTime, endTime, slotDuration, isActive } = req.body;

    availability = await Availability.findByIdAndUpdate(
      req.params.id,
      { startTime, endTime, slotDuration, isActive },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Availability updated successfully',
      data: {
        availability
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete availability
// @route   DELETE /api/availability/:id
// @access  Private (Provider only - own availability)
exports.deleteAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        status: 'error',
        message: 'Availability not found'
      });
    }

    // Check ownership
    if (availability.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this availability'
      });
    }

    await Availability.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Availability deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};
