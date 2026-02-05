const { body, param, query } = require('express-validator');

// Auth validation
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'provider', 'admin']).withMessage('Invalid role')
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Service validation
exports.createServiceValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Service name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Service name must be 3-100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 15, max: 480 }).withMessage('Duration must be 15-480 minutes'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
];

// Availability validation
exports.createAvailabilityValidation = [
  body('dayOfWeek')
    .notEmpty().withMessage('Day of week is required')
    .isInt({ min: 0, max: 6 }).withMessage('Day must be 0-6'),
  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be HH:MM format'),
  body('endTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be HH:MM format'),
  body('slotDuration')
    .notEmpty().withMessage('Slot duration is required')
    .isInt({ min: 15, max: 240 }).withMessage('Slot duration must be 15-240 minutes')
];

// Appointment validation
exports.createAppointmentValidation = [
  body('providerId')
    .notEmpty().withMessage('Provider ID is required')
    .isMongoId().withMessage('Invalid provider ID'),
  body('serviceId')
    .notEmpty().withMessage('Service ID is required')
    .isMongoId().withMessage('Invalid service ID'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('timeSlot')
    .notEmpty().withMessage('Time slot is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time slot must be HH:MM format')
];

// ID param validation
exports.validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

// Date query validation
exports.validateDateQuery = [
  query('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format')
];
