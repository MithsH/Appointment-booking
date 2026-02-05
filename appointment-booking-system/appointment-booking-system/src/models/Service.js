const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required']
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    minlength: [3, 'Service name must be at least 3 characters'],
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Service duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
serviceSchema.index({ provider: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
