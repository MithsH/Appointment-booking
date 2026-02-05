const express = require('express');
const router = express.Router();
const {
  createAvailability,
  getProviderAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability
} = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');
const { isProvider } = require('../middleware/roleMiddleware');
const { createAvailabilityValidation, validateId } = require('../utils/validators');

// Public routes
router.get('/provider/:providerId', validateId, getProviderAvailability);

// Protected routes (Provider only)
router.use(protect, isProvider);
router.post('/', createAvailabilityValidation, createAvailability);
router.get('/my/availability', getMyAvailability);
router.put('/:id', validateId, updateAvailability);
router.delete('/:id', validateId, deleteAvailability);

module.exports = router;
