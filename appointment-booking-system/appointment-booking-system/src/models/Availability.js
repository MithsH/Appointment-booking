const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required']
  },
  dayOfWeek: {
    type: Number,
    required: [true, 'Day of week is required'],
    min: [0, 'Day must be between 0 (Sunday) and 6 (Saturday)'],
    max: [6, 'Day must be between 0 (Sunday) and 6 (Saturday)']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
  },
  slotDuration: {
    type: Number,
    required: [true, 'Slot duration is required'],
    min: [15, 'Slot duration must be at least 15 minutes'],
    max: [240, 'Slot duration cannot exceed 4 hours']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique provider-day combination
availabilitySchema.index({ provider: 1, dayOfWeek: 1 }, { unique: true });

// Validation: endTime must be after startTime
availabilitySchema.pre('save', function(next) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    return next(new Error('End time must be after start time'));
  }
  
  next();
});

module.exports = mongoose.model('Availability', availabilitySchema);
