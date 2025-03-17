import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { API_URL } from '../config';
import axios from 'axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEntries();
    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEntries();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/entries`);
      // Sort entries by date in descending order
      const sortedEntries = response.data.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }) => {
    const formatDate = (dateString) => {
      const [datePart] = dateString.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const getPreviewContent = (content) => {
      try {
        const data = JSON.parse(content);
        // Always return AI summary if available, without marking it as AI
        if (data.aiSummary) {
          return data.aiSummary;
        }
        // Fall back to snippets if no AI summary
        return data.snippets.map(s => s.text).join('\n');
      } catch (parseError) {
        return content;
      }
    };

    const truncateContent = (text) => {
      const lines = text.split('\n').slice(0, 3);
      let truncated = lines.join('\n');
      
      if (truncated.length > 120) {
        truncated = truncated.substring(0, 120).trim() + '...';
      } else if (lines.length === 3) {
        truncated = truncated + '...';
      }
      
      return truncated;
    };

    const previewContent = getPreviewContent(item.content);

    return (
      <TouchableOpacity 
        style={styles.entryItem}
        onPress={() => navigation.navigate('Edit', { date: item.date.split('T')[0] })}
      >
        <Text style={styles.date}>
          {formatDate(item.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        <Text 
          style={styles.content}
          numberOfLines={3}
        >
          {truncateContent(previewContent)}
        </Text>
      </TouchableOpacity>
    );
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  entryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 90,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  content: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#fff',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#333',
  }
}); 