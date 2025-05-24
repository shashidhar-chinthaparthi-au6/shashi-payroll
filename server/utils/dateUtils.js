/**
 * Utility functions for date operations
 */

/**
 * Get today's date range in UTC
 * @returns {Object} Object containing today and tomorrow dates in UTC
 */
const getTodayDateRange = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return { today, tomorrow };
};

module.exports = {
  getTodayDateRange
}; 