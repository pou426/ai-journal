import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useJournal, useAuth } from '../context';
import { JournalService } from '../services';
import { DateUtils } from '../utils';

export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { lastUpdate } = useJournal();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEntries();
      // Add listener for when screen comes into focus
      const unsubscribe = navigation.addListener('focus', () => {
        fetchEntries();
      });
      return unsubscribe;
    }
  }, [navigation, user, lastUpdate]);

  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      // Use JournalService to get formatted journals
      const journals = await JournalService.getAllJournals(user.id);
      setEntries(journals);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.entryItem}
        onPress={() => {
          try {
            // Check if the date is today using DateUtils or fallback
            const isToday = item.date ? DateUtils.isToday(item.date) : false;
            if (isToday) {
              // If it's today's entry, navigate to Today tab
              navigation.navigate('Today');
            } else {
              // If it's a past entry, navigate to Edit screen with date param
              navigation.navigate('ViewEntry', { date: item.date });
            }
          } catch (error) {
            console.error('Error in navigation:', error);
            // Fallback to view entry
            navigation.navigate('ViewEntry', { date: item.date });
          }
        }}
      >
        <Text style={styles.date}>
          {item.formattedDate}
        </Text>
        <Text 
          style={styles.content}
          numberOfLines={3}
        >
          {item.preview}
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