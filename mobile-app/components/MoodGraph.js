import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { SentimentUtils } from '../utils';

const { width: screenWidth } = Dimensions.get('window');

const DottedLine = () => (
  <View style={styles.dottedLine}>
    {Array(50).fill(0).map((_, i) => (
      <View key={i} style={styles.dot} />
    ))}
  </View>
);

const MoodGraph = ({ journalEntries = [] }) => {
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  
  // Convert sentiment scores to y-axis values (0-4):
  // 0: Bad (score < -0.5)
  // 1: Meh (score < -0.2)
  // 2: Neutral (-0.2 <= score <= 0.2)
  // 3: Good (score > 0.2)
  // 4: Awesome (score > 0.5)
  const sentimentToYAxis = (score) => {
    if (score === undefined || score === null) return null;
    if (score > 0.5) return 4; // Awesome
    if (score > 0.2) return 3; // Good
    if (score >= -0.2) return 2; // Neutral
    if (score >= -0.5) return 1; // Meh
    return 0; // Bad
  };
  
  // Sort entries by date and prepare data for the chart
  const { chartData, allDays } = useMemo(() => {
    if (!journalEntries.length) return { chartData: [], allDays: [] };
    
    // Sort entries by date (oldest to newest)
    const sortedEntries = [...journalEntries].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate the start date based on view mode
    let startDate = new Date(today);
    if (viewMode === 'week') {
      // Start date is 7 days ago
      startDate.setDate(today.getDate() - 6);
    } else {
      // Start date is 30 days ago for month view
      startDate.setDate(today.getDate() - 29);
    }
    
    // Filter entries based on date range
    const filteredEntries = sortedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0); // Normalize time
      return entryDate >= startDate && entryDate <= today;
    });
    
    // Prepare data points for entries and all days
    const dataPoints = [];
    const days = [];
    
    // Fill in dates and corresponding sentiment values
    const currentDate = new Date(startDate);
    const daysCount = viewMode === 'week' ? 7 : 30;
    
    for (let i = 0; i < daysCount; i++) {
      const dateString = currentDate.toLocaleDateString('en-CA'); // Use consistent date format
      
      // Format date for display based on view mode
      const displayDate = viewMode === 'week'
        ? currentDate.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 1)
        : currentDate.getDate().toString();
        
      // Add all days to array
      days.push({
        index: i,
        displayDate,
        dateString
      });
      
      // Find entry for this date if it exists
      const entry = filteredEntries.find(e => e.date === dateString);
      
      // Convert sentiment score to y-axis value (0-4)
      const yValue = entry ? sentimentToYAxis(entry.sentiment_score) : null;
      
      if (entry) {
        dataPoints.push({
          x: i,
          y: yValue,
          date: dateString,
          displayDate,
          sentimentScore: entry.sentiment_score
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { chartData: dataPoints, allDays: days };
  }, [journalEntries, viewMode]);
  
  // Y-axis labels with emoji
  const moodLabels = [
    { value: 4, text: 'Awesome', emoji: '😄' },
    { value: 3, text: 'Good', emoji: '🙂' },
    { value: 2, text: 'Neutral', emoji: '😐' },
    { value: 1, text: 'Meh', emoji: '😒' },
    { value: 0, text: 'Bad', emoji: '😞' }
  ];
  
  // Calculate position for a given data point
  const getPointPosition = (index, yValue) => {
    const totalPoints = viewMode === 'week' ? 7 : 30;
    // Account for the container padding and screen margins
    const chartWidth = screenWidth - 120; 
    
    const xPosition = (index / (totalPoints - 1)) * chartWidth;
    
    // The y position is inverted (0 at bottom, 4 at top)
    // with 5 levels (0-4), and a height of 180px
    const rowHeight = 180 / 4;
    const yPosition = 180 - (yValue * rowHeight);
    
    return { x: xPosition, y: yPosition };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mood</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'week' && styles.activeToggle]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.activeToggleText]}>7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'month' && styles.activeToggle]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[styles.toggleText, viewMode === 'month' && styles.activeToggleText]}>30 Days</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          {moodLabels.map((label) => (
            <View key={`label-${label.value}`} style={styles.yAxisLabel}>
              <Text style={styles.yAxisEmoji}>{label.emoji}</Text>
            </View>
          ))}
        </View>
        
        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          {moodLabels.map((label) => (
            <View 
              key={`grid-${label.value}`} 
              style={[
                styles.gridLine, 
                { top: (180 / 4) * (4 - label.value) }
              ]}
            >
              <DottedLine />
            </View>
          ))}
          
          {/* Data points */}
          {chartData.length > 0 ? (
            <View style={styles.plotArea}>
              {/* Points */}
              {chartData.map((point) => {
                const pos = getPointPosition(point.x, point.y);
                const { bgColor } = SentimentUtils.getSentimentInfo(point.sentimentScore);
                
                return (
                  <View
                    key={`point-${point.date}`}
                    style={[
                      styles.dataPoint,
                      {
                        left: pos.x,
                        top: pos.y,
                        backgroundColor: bgColor,
                      },
                    ]}
                  />
                );
              })}
              
              {/* X-axis labels (date labels) */}
              <View style={styles.xAxisContainer}>
                {allDays.map((day, index) => {
                  const totalPoints = viewMode === 'week' ? 7 : 30;
                  // Use the same width calculation as the data points
                  const chartWidth = screenWidth - 120;
                  const xPos = (index / (totalPoints - 1)) * chartWidth;
                  
                  // For week view, show every day
                  // For month view, show only every 5th day
                  const shouldDisplayLabel = 
                    viewMode === 'week' || 
                    index === 0 || 
                    index === totalPoints - 1 ||
                    index % 5 === 0;
                  
                  if (!shouldDisplayLabel) return null;
                  
                  return (
                    <Text
                      key={`day-${index}`}
                      style={[
                        styles.dayLabel,
                        { 
                          left: xPos - 8,
                        }
                      ]}
                    >
                      {day.displayDate}
                    </Text>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No mood data available</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeToggle: {
    backgroundColor: '#555',
  },
  toggleText: {
    fontSize: 13,
    color: '#777',
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 220, // Increase height to give more space for bottom axis
    alignItems: 'flex-start',
  },
  yAxisContainer: {
    width: 36,
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 0,
    marginRight: 8,
  },
  yAxisLabel: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
  },
  yAxisEmoji: {
    fontSize: 16,
  },
  chartArea: {
    flex: 1,
    height: 220, // Match the chart container height
    position: 'relative',
    marginLeft: 4,
  },
  gridLine: {
    marginTop: 10,
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  dottedLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#e0e0e0',
  },
  plotArea: {
    flex: 1,
    height: 180,
    position: 'relative',
    marginTop: 10,
  },
  dataPoint: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'white',
    marginLeft: -5,
    marginTop: -6,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  xAxisContainer: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
  },
  dayLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    width: 16, // Increase width to prevent text from breaking into multiple lines
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#999',
    fontSize: 14,
  }
});

export default MoodGraph; 