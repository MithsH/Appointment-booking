const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider only)
exports.createService = async (req, res, next) => {
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

    const { name, description, duration, price, category } = req.body;

    // Create service with current user as provider
    const service = await Service.create({
      provider: req.user._id,
      name,
      description,
      duration,
      price,
      category
    });

    res.status(201).json({
      status: 'success',
      message: 'Service created successfully',
      data: {
        service
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getAllServices = async (req, res, next) => {
  try {
    const { provider, category, isActive } = req.query;
    
    // Build filter
    const filter = {};
    if (provider) filter.provider = provider;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Default to active services only
    if (!Object.prototype.hasOwnProperty.call(filter, 'isActive')) {
      filter.isActive = true;
    }

    const services = await Service.find(filter)
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: services.length,
      data: {
        services
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email phone');

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider only - own services)
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }

    // Check ownership (provider can only update own services, admin can update any)
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this service'
      });
    }

    const { name, description, duration, price, category, isActive } = req.body;

    service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, duration, price, category, isActive },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Service updated successfully',
      data: {
        service
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider only - own services)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }

    // Check ownership
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this service'
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Service deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get services by current provider
// @route   GET /api/services/my-services
// @access  Private (Provider only)
exports.getMyServices = async (req, res, next) => {
  try {
    const services = await Service.find({ provider: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: services.length,
      data: {
        services
      }
    });

  } catch (error) {
    next(error);
  }
};
