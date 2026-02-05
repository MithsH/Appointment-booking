/**
 * Generate time slots based on availability rules
 */
exports.generateTimeSlots = (startTime, endTime, slotDuration) => {
  const slots = [];
  
  // Parse start and end times
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Convert to minutes
  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // Generate slots
  while (currentMinutes + slotDuration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    
    const timeSlot = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    slots.push(timeSlot);
    
    currentMinutes += slotDuration;
  }
  
  return slots;
};

/**
 * Get day of week from date (0 = Sunday, 6 = Saturday)
 */
exports.getDayOfWeek = (date) => {
  return new Date(date).getDay();
};

/**
 * Format date to YYYY-MM-DD
 */
exports.formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if time slot is valid
 */
exports.isValidTimeSlot = (timeSlot) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeSlot);
};
