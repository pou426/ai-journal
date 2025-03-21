import { journalsApi } from '../api';

/**
 * Service for handling journal-related business logic
 */
class JournalService {
  /**
   * Get all journal entries for a user
   * @param {string} userId - The user's UUID
   * @returns {Promise<Array>} - All journal entries
   */
  async getAllJournals(userId) {
    try {
      const journals = await journalsApi.getJournals(userId);
      return this.formatJournals(journals);
    } catch (error) {
      console.error('JournalService.getAllJournals error:', error);
      throw error;
    }
  }

  /**
   * Get a journal entry for a specific date
   * @param {string} userId - The user's UUID
   * @param {string} date - The date in ISO format (YYYY-MM-DD)
   * @returns {Promise<Object|null>} - Journal entry or null if not found
   */
  async getJournalByDate(userId, date) {
    try {
      const journal = await journalsApi.getJournalByDate(userId, date);
      return journal ? this.formatJournal(journal) : null;
    } catch (error) {
      console.error('JournalService.getJournalByDate error:', error);
      throw error;
    }
  }

  /**
   * Create or update a journal entry
   * @param {string} userId - The user's UUID
   * @param {string} date - The date in ISO format (YYYY-MM-DD)
   * @param {string} entry - The journal entry text
   * @returns {Promise<Object>} - Created/updated journal
   */
  async createOrUpdateJournal(userId, date, entry) {
    if (!this.validateJournalEntry(entry)) {
      throw new Error('Invalid journal entry');
    }

    if (!this.validateDate(date)) {
      throw new Error('Invalid date format');
    }

    try {
      const journal = await journalsApi.createOrUpdateJournal(userId, date, entry);
      return this.formatJournal(journal);
    } catch (error) {
      console.error('JournalService.createOrUpdateJournal error:', error);
      throw error;
    }
  }

  /**
   * Format a journal entry for display
   * @param {Object} journal - Journal entry
   * @returns {Object} - Formatted journal
   */
  formatJournal(journal) {
    if (!journal) return null;
    
    return {
      ...journal,
      formattedDate: this.formatDate(journal.date),
      preview: this.getJournalPreview(journal.entry)
    };
  }

  /**
   * Format multiple journal entries for display
   * @param {Array} journals - Journal entries
   * @returns {Array} - Formatted journals
   */
  formatJournals(journals) {
    if (!journals || journals.length === 0) return [];
    
    return journals.map(journal => this.formatJournal(journal));
  }

  /**
   * Format a date for display
   * @param {string} dateString - Date in ISO format
   * @returns {string} - Formatted date
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  /**
   * Create a preview of the journal entry
   * @param {string} entry - Journal entry text
   * @returns {string} - Journal preview
   */
  getJournalPreview(entry) {
    if (!entry) return '';
    
    const lines = entry.split('\n').slice(0, 3);
    let preview = lines.join('\n');
    
    if (preview.length > 120) {
      preview = preview.substring(0, 120).trim() + '...';
    } else if (lines.length === 3) {
      preview = preview + '...';
    }
    
    return preview;
  }

  /**
   * Check if a date is today
   * @param {string} dateString - Date in ISO format
   * @returns {boolean} - Whether the date is today
   */
  isToday(dateString) {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }

  /**
   * Validate journal entry
   * @param {string} entry - The journal entry text
   * @returns {boolean} - Whether the entry is valid
   */
  validateJournalEntry(entry) {
    return !!entry && entry.trim().length > 0;
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} date - The date to validate
   * @returns {boolean} - Whether the date is valid
   */
  validateDate(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date) && !isNaN(new Date(date).getTime());
  }
}

// Export as a singleton
export default new JournalService(); 