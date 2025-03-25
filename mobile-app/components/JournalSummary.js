import React, { useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView,
  ActivityIndicator
} from 'react-native';

const JournalSummary = ({ summary, isGenerating = false, sentimentScore, date }) => {
  // Function to determine sentiment label, color, emoji, and background color
  const getSentimentInfo = (score) => {
    if (score === undefined || score === null) return { 
      label: '', 
      color: '#333', 
      emoji: '',
      bgColor: 'transparent'
    };
    
    let label = '';
    let color = '';
    let emoji = '';
    let bgColor = '';
    
    if (score > 0.5) {
      label = 'Awesome';
      color = '#333333';
      bgColor = '#CBEBC0'; // Soft light green
      emoji = '😄'; // Grinning face with smiling eyes
    } else if (score > 0.2) {
      label = 'Good';
      color = '#333333';
      bgColor = '#E0F5D7'; // Very light green
      emoji = '🙂'; // Slightly smiling face
    } else if (score < -0.5) {
      label = 'Bad';
      color = '#333333';
      bgColor = '#FFCCCB'; // Light red/pink
      emoji = '😞'; // Disappointed face
    } else if (score < -0.2) {
      label = 'Terrible';
      color = '#333333';
      bgColor = '#FFD8D7'; // Very light red
      emoji = '😒'; // Unamused face
    } else {
      // Widened range: Scores between -0.2 and 0.2 are considered neutral
      label = 'Neutral';
      color = '#333333';
      bgColor = '#E8E8E8'; // Light gray
      emoji = '😐'; // Neutral face
    }
    
    return { label, color, emoji, bgColor };
  };
  
  // Calculate the day of week index using useMemo to avoid recalculations
  const currentDayIndex = useMemo(() => {
    try {
      // If we have a valid date string, use it
      if (date && typeof date === 'string' && date.trim() !== '') {
        // Parse the date, ensuring we get consistent behavior
        const journalDate = new Date(date);
        
        // Verify that the date is valid
        if (!isNaN(journalDate.getTime())) {
          // Convert from Sunday-based (0-6) to Monday-based (0-6)
          const sundayBasedIndex = journalDate.getDay();
          const mondayBasedIndex = sundayBasedIndex === 0 ? 6 : sundayBasedIndex - 1;
          return mondayBasedIndex;
        }
      }
      
      // If no valid date or network error, use a default day (Monday)
      return 0;
    } catch (error) {
      console.error('Error parsing date in JournalSummary:', error);
      return 0; // Default to Monday
    }
  }, [date]);
  
  const { label, color, emoji, bgColor } = getSentimentInfo(sentimentScore);
  
  // Check if we have a valid sentiment score
  const hasValidScore = sentimentScore !== undefined && sentimentScore !== null;
  
  // Days of week component
  const renderDaysOfWeek = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    return (
      <View style={styles.daysContainer}>
        {days.map((day, index) => (
          <View 
            key={index} 
            style={[
              styles.dayCircle, 
              currentDayIndex === index && styles.activeDayCircle
            ]}
          >
            <Text 
              style={[
                styles.dayText, 
                currentDayIndex === index && styles.activeDayText
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>
    );
  };
  
  return (
    <View style={styles.summaryContainer}>
      <ScrollView 
        style={styles.summaryScroll}
        showsVerticalScrollIndicator={true}
      >
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#333" />
            <Text style={styles.loadingText}>Generating AI Summary...</Text>
          </View>
        ) : (
          <>
            <View style={styles.metadataContainer}>
              <View style={styles.weekdayCard}>
                {renderDaysOfWeek()}
              </View>
              
              {hasValidScore && (
                <View style={[styles.moodChip, { backgroundColor: bgColor }]}>
                  <Text style={styles.sentimentEmoji}>{emoji}</Text>
                  <Text style={styles.chipText}>{label}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.summaryText}>{summary}</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    flex: 1,
    borderRadius: 8,
  },
  summaryScroll: {
    flex: 1,
    padding: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    height: 34,
  },
  weekdayCard: {
    height: 34,
    paddingHorizontal: 6,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    flex: 0.65,
    justifyContent: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeDayCircle: {
    backgroundColor: '#EBEBEB', // Light gray instead of blue
  },
  dayText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
  },
  activeDayText: {
    fontWeight: '700',
    color: '#333',
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 12,
    height: 34,
    flex: 0.3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  sentimentEmoji: {
    fontSize: 16,
    marginRight: 3,
  }
});

export default JournalSummary; 