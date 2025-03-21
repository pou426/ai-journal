import { snippetsApi } from '../api';

/**
 * Service for handling snippet-related business logic
 */
class SnippetService {
  /**
   * Get all snippets for a user sorted by date (newest first)
   * @param {string} userId - The user's UUID
   * @returns {Promise<Array>} - Sorted snippets
   */
  async getAllSnippets(userId) {
    try {
      const snippets = await snippetsApi.getSnippets(userId);
      return this.sortSnippetsByDate(snippets, 'desc');
    } catch (error) {
      console.error('SnippetService.getAllSnippets error:', error);
      throw error;
    }
  }

  /**
   * Get all snippets for a specific date
   * @param {string} userId - The user's UUID
   * @param {string} date - The date in ISO format (YYYY-MM-DD)
   * @returns {Promise<Array>} - Snippets for the specified date
   */
  async getSnippetsByDate(userId, date) {
    try {
      return await snippetsApi.getSnippetsByDate(userId, date);
    } catch (error) {
      console.error('SnippetService.getSnippetsByDate error:', error);
      throw error;
    }
  }

  /**
   * Create a new snippet
   * @param {string} userId - The user's UUID
   * @param {string} entry - The snippet text
   * @returns {Promise<Object>} - Created snippet
   */
  async createSnippet(userId, entry) {
    if (!this.validateSnippetEntry(entry)) {
      throw new Error('Invalid snippet entry');
    }

    try {
      return await snippetsApi.createSnippet(userId, entry);
    } catch (error) {
      console.error('SnippetService.createSnippet error:', error);
      throw error;
    }
  }

  /**
   * Create a new snippet and generate journal summary
   * @param {string} userId - The user's UUID
   * @param {string} entry - The snippet text
   * @returns {Promise<Object>} - Generated journal
   */
  async createSnippetWithSummary(userId, entry) {
    if (!this.validateSnippetEntry(entry)) {
      throw new Error('Invalid snippet entry');
    }

    try {
      return await snippetsApi.createSnippetWithSummary(userId, entry);
    } catch (error) {
      console.error('SnippetService.createSnippetWithSummary error:', error);
      throw error;
    }
  }

  /**
   * Sort snippets by date
   * @param {Array} snippets - Array of snippets
   * @param {string} order - 'asc' or 'desc'
   * @returns {Array} - Sorted snippets
   */
  sortSnippetsByDate(snippets, order = 'asc') {
    if (!snippets || snippets.length === 0) return [];
    
    return [...snippets].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  /**
   * Group snippets by date
   * @param {Array} snippets - Array of snippets
   * @returns {Object} - Snippets grouped by date
   */
  groupSnippetsByDate(snippets) {
    if (!snippets || snippets.length === 0) return {};
    
    return snippets.reduce((groups, snippet) => {
      const date = new Date(snippet.created_at).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(snippet);
      return groups;
    }, {});
  }

  /**
   * Validate snippet entry
   * @param {string} entry - The snippet text
   * @returns {boolean} - Whether the entry is valid
   */
  validateSnippetEntry(entry) {
    return !!entry && entry.trim().length > 0;
  }
}

// Export as a singleton
export default new SnippetService(); 