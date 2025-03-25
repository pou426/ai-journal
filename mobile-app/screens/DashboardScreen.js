import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text
} from 'react-native';
import { useAuth } from '../context';
import { JournalService } from '../services';
import { MoodGraph } from '../components';

export default function DashboardScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchJournalEntries();
      
      // Add listener for when screen comes into focus
      const unsubscribe = navigation.addListener('focus', () => {
        fetchJournalEntries();
      });
      
      return unsubscribe;
    }
  }, [navigation, user]);

  const fetchJournalEntries = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const journals = await JournalService.getAllJournals(user.id);
      setEntries(journals);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJournalEntries();
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!entries.length) return { totalEntries: 0, currentStreak: 0 };
    
    // Total entries
    const totalEntries = entries.length;
    
    // Calculate streak
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Get all unique dates as strings (YYYY-MM-DD format)
    const entryDates = [...new Set(sortedEntries.map(entry => entry.date))];
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    
    // Check if there's an entry for today
    const hasTodayEntry = entryDates.includes(todayString);
    
    // Start counting streak
    let currentStreak = 0;
    let currentDate = new Date(today);
    
    // If no entry today, we'll start checking from yesterday
    if (!hasTodayEntry) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Check consecutive days 
    let keepChecking = true;
    
    while (keepChecking) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Check if this date has an entry
      if (entryDates.includes(dateString)) {
        currentStreak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Chain broken
        keepChecking = false;
      }
    }
    
    return { totalEntries, currentStreak };
  }, [entries]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalEntries}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
            
            <MoodGraph 
              journalEntries={entries}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  }
}); 