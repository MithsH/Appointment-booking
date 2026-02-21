const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAvailableSlots, bookAppointment, getMyAppointments, cancelAppointment } = require('../controllers/appointmentController');

// Public
router.get('/slots/:providerId', getAvailableSlots);

// Protected user routes
router.post('/', protect, authorize('user'), bookAppointment);
router.get('/my', protect, authorize('user'), getMyAppointments);
router.put('/:id/cancel', protect, authorize('user'), cancelAppointment);

module.exports = router;
