import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { API_URL } from '../config';
import axios from 'axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../utils/supabase';

export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchEntries();
      // Add listener for when screen comes into focus
      const unsubscribe = navigation.addListener('focus', () => {
        fetchEntries();
      });
      return unsubscribe;
    }
  }, [navigation, userId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchEntries = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`${API_URL}/journals/${userId}`);
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
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
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

    return (
      <TouchableOpacity 
        style={styles.entryItem}
        onPress={() => {
          const today = new Date().toISOString().split('T')[0];
          
          if (item.date === today) {
            // If it's today's entry, navigate to Today tab
            navigation.navigate('Today');
          } else {
            // If it's a past entry, navigate to Edit screen with date param
            navigation.navigate('ViewEntry', { date: item.date });
          }
        }}
      >
        <Text style={styles.date}>
          {formatDate(item.date)}
        </Text>
        <Text 
          style={styles.content}
          numberOfLines={3}
        >
          {truncateContent(item.entry)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.date}-${item.id}`}
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