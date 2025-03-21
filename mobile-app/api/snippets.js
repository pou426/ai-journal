import apiClient from './client';

/**
 * Get all snippets for a user
 * @param {string} userId - The user's UUID
 * @returns {Promise} - Promise containing the snippets data
 */
export const getSnippets = async (userId) => {
  try {
    const response = await apiClient.get(`/snippets/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching snippets:', error);
    throw error;
  }
};

/**
 * Get snippets for a specific date
 * @param {string} userId - The user's UUID
 * @param {string} date - The date in ISO format (YYYY-MM-DD)
 * @returns {Promise} - Promise containing the filtered snippets data
 */
export const getSnippetsByDate = async (userId, date) => {
  try {
    const response = await apiClient.get(`/snippets/${userId}`);
    
    const filteredSnippets = response.data
      .filter(s => {
        const snippetDate = new Date(s.created_at).toISOString().split('T')[0];
        return snippetDate === date;
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    return filteredSnippets;
  } catch (error) {
    console.error('Error fetching snippets by date:', error);
    throw error;
  }
};

/**
 * Create a new snippet
 * @param {string} userId - The user's UUID
 * @param {string} entry - The snippet text
 * @returns {Promise} - Promise containing the created snippet data
 */
export const createSnippet = async (userId, entry) => {
  try {
    const response = await apiClient.post('/snippets', {
      entry,
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating snippet:', error);
    throw error;
  }
};

/**
 * Create a new snippet and generate journal summary
 * @param {string} userId - The user's UUID
 * @param {string} entry - The snippet text
 * @returns {Promise} - Promise containing the generated journal entry
 */
export const createSnippetWithSummary = async (userId, entry) => {
  try {
    const response = await apiClient.post('/snippets/with-summary', {
      entry,
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating snippet with summary:', error);
    throw error;
  }
}; 