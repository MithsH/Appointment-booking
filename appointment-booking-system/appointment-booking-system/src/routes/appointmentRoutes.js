const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAvailableSlots,
  getMyAppointments,
  getProviderAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { isProvider } = require('../middleware/roleMiddleware');
const { createAppointmentValidation, validateId, validateDateQuery } = require('../utils/validators');

// Public routes
router.get('/available-slots/:providerId', validateId, validateDateQuery, getAvailableSlots);

// Protected routes
router.use(protect);

// User routes
router.post('/', createAppointmentValidation, createAppointment);
router.get('/my-appointments', getMyAppointments);
router.put('/:id/cancel', validateId, cancelAppointment);
router.get('/:id', validateId, getAppointment);

// Provider routes
router.get('/provider/appointments', isProvider, getProviderAppointments);
router.put('/:id/status', isProvider, validateId, updateAppointmentStatus);

module.exports = router;
