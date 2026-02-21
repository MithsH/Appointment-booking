const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProviders, getProvider,
  createService, getProviderServices, getMyServices, updateService, deleteService,
  setAvailability, getMyAvailability, getProviderAvailability, deleteAvailability,
  getProviderBookings, updateBookingStatus
} = require('../controllers/providerController');

// Public routes
router.get('/', getProviders);
router.get('/:id', getProvider);
router.get('/:providerId/services', getProviderServices);
router.get('/:providerId/availability', getProviderAvailability);

// Protected provider routes
router.use(protect, authorize('provider'));

router.get('/services/my', getMyServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

router.get('/availability/my', getMyAvailability);
router.post('/availability', setAvailability);
router.delete('/availability/:dayOfWeek', deleteAvailability);

router.get('/bookings/all', getProviderBookings);
router.put('/bookings/:id', updateBookingStatus);

module.exports = router;
