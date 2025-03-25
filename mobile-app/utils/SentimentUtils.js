/**
 * Utility functions for sentiment analysis and mood display
 */
class SentimentUtils {
  /**
   * Get color for a sentiment score
   * @param {number} score - Sentiment score between -1 and 1
   * @returns {string} - Hex color code
   * @deprecated - Use getSentimentInfo() instead
   */
  getSentimentColor(score) {
    if (score === undefined || score === null) return '#888888';
    
    if (score > 0.5) {
      return '#4CAF50'; // Awesome - Stronger green
    } else if (score > 0.2) {
      return '#8BC34A'; // Good - Light green
    } else if (score < -0.5) {
      return '#F44336'; // Bad - Stronger red
    } else if (score < -0.2) {
      return '#FF9800'; // Terrible - Orange
    } else {
      return '#9E9E9E'; // Neutral - Medium gray
    }
  }

  /**
   * Get comprehensive sentiment information based on score
   * @param {number} score - Sentiment score between -1 and 1
   * @returns {Object} - Object containing label, color, bgColor, and emoji
   */
  getSentimentInfo(score) {
    if (score === undefined || score === null) {
      return { 
        label: '', 
        color: '#333', 
        emoji: '',
        bgColor: 'transparent'
      };
    }
    
    let info = {
      label: '',
      color: '',
      emoji: '',
      bgColor: ''
    };
    
    if (score > 0.5) {
      info.label = 'Awesome';
      info.color = '#333333';
      info.bgColor = '#4CAF50'; // Stronger green
      info.emoji = '😄'; // Grinning face with smiling eyes
    } else if (score > 0.2) {
      info.label = 'Good';
      info.color = '#333333';
      info.bgColor = '#8BC34A'; // Light green
      info.emoji = '🙂'; // Slightly smiling face
    } else if (score < -0.5) {
      info.label = 'Bad';
      info.color = '#FFFFFF';
      info.bgColor = '#F44336'; // Stronger red
      info.emoji = '😞'; // Disappointed face
    } else if (score < -0.2) {
      info.label = 'Meh';
      info.color = '#333333';
      info.bgColor = '#FF9800'; // Orange
      info.emoji = '😒'; // Unamused face
    } else {
      // Scores between -0.2 and 0.2 are considered neutral
      info.label = 'Neutral';
      info.color = '#FFFFFF';
      info.bgColor = '#9E9E9E'; // Medium gray
      info.emoji = '😐'; // Neutral face
    }
    
    return info;
  }
}

// Export as a singleton
export default new SentimentUtils(); 