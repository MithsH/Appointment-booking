const express = require('express');
const router = express.Router();
const {
  createService,
  getAllServices,
  getService,
  updateService,
  deleteService,
  getMyServices
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { isProvider } = require('../middleware/roleMiddleware');
const { createServiceValidation, validateId } = require('../utils/validators');

// Public routes
router.get('/', getAllServices);
router.get('/:id', validateId, getService);

// Protected routes (Provider only)
router.use(protect);
router.get('/my/services', isProvider, getMyServices);
router.post('/', isProvider, createServiceValidation, createService);
router.put('/:id', isProvider, validateId, updateService);
router.delete('/:id', isProvider, validateId, deleteService);

module.exports = router;
