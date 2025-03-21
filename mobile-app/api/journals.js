import apiClient from './client';

/**
 * Get all journal entries for a user
 * @param {string} userId - The user's UUID
 * @returns {Promise} - Promise containing the journals data
 */
export const getJournals = async (userId) => {
  try {
    const response = await apiClient.get(`/journals/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching journals:', error);
    throw error;
  }
};

/**
 * Get a journal entry for a specific date
 * @param {string} userId - The user's UUID
 * @param {string} date - The date in ISO format (YYYY-MM-DD)
 * @returns {Promise} - Promise containing the journal data or null if not found
 */
export const getJournalByDate = async (userId, date) => {
  try {
    const response = await apiClient.get(`/journals/${userId}/${date}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // No journal for this date
    }
    console.error('Error fetching journal by date:', error);
    throw error;
  }
};

/**
 * Create or update a journal entry
 * @param {string} userId - The user's UUID
 * @param {string} date - The date in ISO format (YYYY-MM-DD)
 * @param {string} entry - The journal text
 * @returns {Promise} - Promise containing the updated journal data
 */
export const createOrUpdateJournal = async (userId, date, entry) => {
  try {
    const response = await apiClient.post('/journals', {
      user_id: userId,
      date,
      entry
    });
    return response.data;
  } catch (error) {
    console.error('Error creating/updating journal:', error);
    throw error;
  }
}; 