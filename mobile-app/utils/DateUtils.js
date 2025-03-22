/**
 * Utility functions for date operations
 */
class DateUtils {
  /**
   * Get today's date in ISO format (YYYY-MM-DD)
   * @returns {string} - Today's date in ISO format
   */
  getTodayISODate() {
    const now = new Date();
    // Create UTC date to avoid timezone issues
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    return todayUTC.toISOString().split('T')[0];
  }

  /**
   * Format a date for display
   * @param {string|Date} date - Date to format
   * @returns {string} - Formatted date
   */
  formatDate(date) {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(date);
    }
  }

  /**
   * Format a time for display
   * @param {string|Date} date - Date to format
   * @returns {string} - Formatted time
   */
  formatTime(date) {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  }

  /**
   * Check if a date is today
   * @param {string|Date} date - Date to check
   * @returns {boolean} - Whether the date is today
   */
  isToday(date) {
    // Get today's date in ISO format using UTC
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const today = todayUTC.toISOString().split('T')[0];
    
    // Convert the input date to ISO format
    let dateString;
    if (typeof date === 'string') {
      // If already in YYYY-MM-DD format, use as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        dateString = date;
      } else {
        // Parse the date string to UTC 
        const dateObj = new Date(date);
        const dateUTC = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
        dateString = dateUTC.toISOString().split('T')[0];
      }
    } else {
      // Convert Date object to UTC date
      const dateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      dateString = dateUTC.toISOString().split('T')[0];
    }
    
    return dateString === today;
  }

  /**
   * Check if a date is in the past
   * @param {string|Date} date - Date to check
   * @returns {boolean} - Whether the date is in the past
   */
  isPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    dateObj.setHours(0, 0, 0, 0);
    
    return dateObj < today;
  }

  /**
   * Parse a date string to ISO format (YYYY-MM-DD)
   * @param {string} dateString - Date string to parse
   * @returns {string} - Date in ISO format
   */
  parseToISODate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error parsing date:', error);
      return '';
    }
  }

  /**
   * Get the difference in days between two dates
   * @param {string|Date} date1 - First date
   * @param {string|Date} date2 - Second date
   * @returns {number} - Number of days between the dates
   */
  getDaysBetween(date1, date2) {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    // Set to midnight to ignore time
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    return Math.round(Math.abs((d1 - d2) / (24 * 60 * 60 * 1000)));
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} dateString - Date string to validate
   * @returns {boolean} - Whether the date is valid
   */
  isValidISODate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString) && !isNaN(new Date(dateString).getTime());
  }
}

// Export as a singleton
export default new DateUtils(); 