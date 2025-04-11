import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
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
    
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Get all unique dates
    const entryDates = [...new Set(sortedEntries.map(entry => entry.date))];
    
    // Get today's date in local timezone and format it to match entry dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // First check if there's an entry today
    if (!entryDates.includes(todayString)) {
      return { totalEntries, currentStreak: 0 };
    }
    
    // If we have an entry today, start counting streak
    let currentStreak = 1; // Start with 1 for today's entry
    let checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - 1); // Start checking from yesterday
    
    while (true) {
      const dateString = checkDate.toLocaleDateString('en-CA');
      
      if (entryDates.includes(dateString)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  }
}); 