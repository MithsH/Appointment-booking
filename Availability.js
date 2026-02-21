const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: Number,
    required: [true, 'Day of week is required'],
    min: 0,
    max: 6,
    comment: '0=Sunday, 1=Monday, ..., 6=Saturday'
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:MM format']
  },
  slotDuration: {
    type: Number,
    required: [true, 'Slot duration is required'],
    min: [15, 'Slot duration must be at least 15 minutes'],
    comment: 'Duration in minutes'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Compound index: one schedule per day per provider
availabilitySchema.index({ provider: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
