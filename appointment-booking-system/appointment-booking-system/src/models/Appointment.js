const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time slot must be in HH:MM format']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cancelReason: {
    type: String,
    maxlength: [300, 'Cancel reason cannot exceed 300 characters']
  }
}, {
  timestamps: true
});

// Compound index to prevent double booking
appointmentSchema.index({ provider: 1, date: 1, timeSlot: 1 });

// Index for user queries
appointmentSchema.index({ user: 1, date: 1 });

// Validate date is not in the past (only for new appointments)
appointmentSchema.pre('save', function(next) {
  if (this.isNew) {
    const appointmentDate = new Date(this.date);
    appointmentDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      return next(new Error('Cannot book appointments in the past'));
    }
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
