import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView,
  ActivityIndicator
} from 'react-native';

const JournalSummary = ({ summary, isGenerating = false }) => {
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
          <Text style={styles.summaryText}>{summary}</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
  }
});

export default JournalSummary; 