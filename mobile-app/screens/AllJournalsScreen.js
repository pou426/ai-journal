import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useJournal, useAuth } from '../context';
import { JournalService, SnippetService } from '../services';
import { DateUtils, SentimentUtils } from '../utils';
import { JournalSummary, SnippetsList, Calendar, ViewContainer } from '../components';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AllJournalsScreen({ navigation, route }) {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState('');
  const [selectedSnippets, setSelectedSnippets] = useState([]);
  const [selectedSentimentScore, setSelectedSentimentScore] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'snippets'
  const [isLoading, setIsLoading] = useState(false);
  
  const { lastUpdate } = useJournal();
  const { user } = useAuth();

  // Access refreshTrigger from route params
  const refreshTrigger = route.params?.refreshTrigger || 0;

  // Set up the header right component
  useEffect(() => {
    // Create header right component directly with setOptions instead of using params
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerToggle}
          onPress={() => setViewMode(current => current === 'list' ? 'calendar' : 'list')}
        >
          <MaterialCommunityIcons
            name={viewMode === 'list' ? 'calendar-month' : 'format-list-bulleted'}
            size={22}
            color="#444"
          />
        </TouchableOpacity>
      )
    });
    // Include viewMode in dependencies since we need to update when it changes
  }, [navigation, viewMode]);

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

  // Add refresh effect when refreshTrigger changes
  useEffect(() => {
    if (user && refreshTrigger > 0) {
      fetchEntries();
      // If in calendar view and a date is selected, also refresh that date's content
      if (viewMode === 'calendar' && selectedDate) {
        fetchSelectedDateContent();
      }
    }
  }, [refreshTrigger, user]);

  useEffect(() => {
    // Set today as selected date if it has an entry, otherwise set the most recent entry
    if (entries.length > 0 && viewMode === 'calendar') {
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = entries.find(entry => entry.date === today);
      
      if (todayEntry) {
        setSelectedDate(today);
      } else {
        // Sort entries by date (newest first) and select the first one
        const sortedEntries = [...entries].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setSelectedDate(sortedEntries[0].date);
      }
    }
  }, [entries, viewMode]);

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

  // Parse date into separate components for UI
  const parseDateComponents = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return {
        day: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        weekday: date.toLocaleString('default', { weekday: 'short' }),
        year: date.getFullYear()
      };
    } catch (error) {
      console.error('Error parsing date:', error);
      return { day: '--', month: '---', weekday: '---', year: '----' };
    }
  };

  // Group entries by month and year for list view
  const getGroupedEntries = () => {
    if (!entries.length) return [];
    
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    const result = [];
    let currentMonthYear = null;
    
    sortedEntries.forEach(entry => {
      const dateParts = parseDateComponents(entry.date);
      const monthYear = `${dateParts.month} ${dateParts.year}`;
      
      // Add a month-year header if we're starting a new month
      if (monthYear !== currentMonthYear) {
        currentMonthYear = monthYear;
        result.push({
          id: `month-${monthYear}`,
          type: 'monthHeader',
          month: dateParts.month,
          year: dateParts.year
        });
      }
      
      // Add the entry with the month-year data
      result.push({
        ...entry,
        type: 'entry'
      });
    });
    
    return result;
  };

  // Add state for tracking which month is visible
  const [visibleMonthIndex, setVisibleMonthIndex] = useState(0);

  // Create an array of calendar months from earliest entry to current month
  const calendarMonths = useMemo(() => {
    if (!entries.length) return [];
    
    // Find the earliest entry date
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const earliestDate = new Date(sortedEntries[0].date);
    const earliestYear = earliestDate.getFullYear();
    const earliestMonth = earliestDate.getMonth();
    
    // Get current date for the range end
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Create array of all months from earliest to current
    const months = [];
    
    // Start from current month and go backwards (so most recent is first)
    for (let year = currentYear; year >= earliestYear; year--) {
      const startMonth = (year === currentYear) ? currentMonth : 11;
      const endMonth = (year === earliestYear) ? earliestMonth : 0;
      
      for (let month = startMonth; month >= endMonth; month--) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        months.push({
          year,
          month,
          monthDisplay: monthNames[month],
          id: `${year}-${month}`
        });
      }
    }
    
    return months;
  }, [entries]);

  // Get selected entry to display in calendar view
  useMemo(() => {
    if (!selectedDate) {
      setSelectedEntry(null);
      return;
    }
    const entry = entries.find(entry => entry.date === selectedDate);
    setSelectedEntry(entry || null);
  }, [selectedDate, entries]);

  // List view render functions
  const renderListItem = ({ item }) => {
    if (item.type === 'monthHeader') {
      return (
        <View style={styles.yearHeader}>
          <Text style={styles.yearHeaderText}>{item.month} {item.year}</Text>
        </View>
      );
    }
    
    // This is a journal entry
    // Check if the date is today
    const isToday = item.date ? DateUtils.isToday(item.date) : false;
    const dateParts = parseDateComponents(item.date);
    
    // Get mood color based on sentiment score
    const { bgColor } = SentimentUtils.getSentimentInfo(item.sentiment_score);
    
    return (
      <TouchableOpacity 
        style={[
          styles.entryItem,
          isToday && styles.todayItem
        ]}
        onPress={() => {
          try {
            if (isToday) {
              // If it's today's entry, navigate to Today tab
              navigation.navigate('Today');
            } else {
              // If it's a past entry, navigate to ViewEntry screen with date param
              navigation.navigate('ViewEntry', { date: item.date });
            }
          } catch (error) {
            console.error('Error in navigation:', error);
            // Fallback to view entry
            navigation.navigate('ViewEntry', { date: item.date });
          }
        }}
      >
        {/* Date section on the left */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateDay}>{dateParts.day}</Text>
          <Text style={styles.dateWeekday}>{dateParts.weekday}</Text>
          {/* Mood indicator */}
          <View style={styles.moodIndicatorContainer}>
            <View style={[styles.moodIndicator, { backgroundColor: bgColor }]} />
          </View>
        </View>
        
        {/* Content section */}
        <View style={styles.contentContainer}>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>TODAY</Text>
            </View>
          )}
          <Text 
            style={[styles.contentText, isToday && styles.contentTextWithBadge]}
            numberOfLines={3}
          >
            {item.preview}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render appropriate view based on viewMode
  const fetchSelectedDateContent = async () => {
    if (!user || !selectedDate) return;
    
    try {
      setIsLoading(true);
      console.log('AllJournalsScreen - selectedDate:', selectedDate);
      
      // Fetch journal entry for the selected date
      const journalEntry = await JournalService.getJournalByDate(user.id, selectedDate);
      if (journalEntry) {
        setSelectedJournal(journalEntry.entry);
        setSelectedSentimentScore(journalEntry.sentiment_score);
      } else {
        setSelectedJournal('');
        setSelectedSentimentScore(null);
      }
      
      // Fetch snippets for the selected date
      const daySnippets = await SnippetService.getSnippetsByDate(user.id, selectedDate);
      setSelectedSnippets(daySnippets || []);
      
    } catch (error) {
      console.error('Error fetching selected date content:', error);
      setSelectedJournal('');
      setSelectedSnippets([]);
      setSelectedSentimentScore(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to fetch content when selectedDate changes
  useEffect(() => {
    if (selectedDate && user) {
      fetchSelectedDateContent();
    }
  }, [selectedDate, user]);

  const renderContent = () => {
    if (viewMode === 'list') {
      return (
        <FlatList
          data={getGroupedEntries()}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id || `${item.date}-${item.id}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          stickyHeaderIndices={getGroupedEntries()
            .map((item, index) => (item.type === 'monthHeader' ? index : null))
            .filter(index => index !== null)
          }
        />
      );
    } else {
      return (
        <FlatList
          data={[{ id: 'calendar-header' }]}
          keyExtractor={item => item.id}
          renderItem={() => (
            <View style={styles.calendarContainer}>
              <Calendar
                entries={entries}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                calendarMonths={calendarMonths}
                visibleMonthIndex={visibleMonthIndex}
                setVisibleMonthIndex={setVisibleMonthIndex}
              />
              {renderSelectedEntry()}
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.calendarScrollView}
          contentContainerStyle={styles.calendarScrollContent}
          showsVerticalScrollIndicator={true}
        />
      );
    }
  };

  const renderSelectedEntry = () => {
    if (!selectedEntry) {
      return (
        <View style={styles.emptyEntryContainer}>
          <Text style={styles.emptyEntryText}>No entry selected</Text>
        </View>
      );
    }

    const dateParts = parseDateComponents(selectedEntry.date);
    const isToday = DateUtils.isToday(selectedEntry.date);

    return (
      <View style={styles.selectedEntryContainer}>
        <View style={styles.selectedEntryHeader}>
          <View style={styles.dateRow}>
            <View style={styles.calendarDateContainer}>
              <Text style={styles.weekdayText}>{dateParts.weekday}</Text>
              <Text style={styles.dateText}>{dateParts.month} {dateParts.day}, {dateParts.year}</Text>
            </View>
            {isToday && <View style={[styles.todayBadge, styles.todayBadgeInCalendar]}><Text style={styles.todayText}>TODAY</Text></View>}
          </View>
        </View>
        
        <View style={styles.selectedEntryContent}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#555" />
              <Text style={styles.loadingText}>Loading entry...</Text>
            </View>
          ) : (
            <ViewContainer
              journalView={<JournalSummary summary={selectedJournal} sentimentScore={selectedSentimentScore} date={selectedDate} />}
              snippetsView={
                <View style={styles.snippetsContainer}>
                  <SnippetsList 
                    snippets={selectedSnippets} 
                    emptyMessage="No snippets found for this day" 
                  />
                </View>
              }
              defaultToJournal={activeTab === 'summary'}
              onToggleView={(isJournal) => setActiveTab(isJournal ? 'summary' : 'snippets')}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header toggle styles
  headerToggle: {
    padding: 8,
    marginRight: 8,
  },
  // List view styles
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  entryItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  todayItem: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 3,
    borderLeftColor: '#444',
  },
  // Year header styles
  yearHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eaeaea',
  },
  yearHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  // Date container styles for list view
  dateContainer: {
    width: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    position: 'relative',
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  dateWeekday: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 2,
  },
  moodIndicatorContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
  },
  moodIndicator: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
  },
  // Content container styles
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  contentText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  contentTextWithBadge: {
    marginTop: 6,
  },
  // Common TODAY badge styles used in both list and calendar views
  todayBadge: {
    backgroundColor: '#444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  todayBadgeInCalendar: {
    marginLeft: 8,
    marginBottom: 0,
  },
  todayText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Calendar view styles
  calendarContainer: {
    paddingBottom: 150, // Add significant padding to ensure scrollability
  },
  calendarScrollView: {
    flex: 1,
  },
  calendarScrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  // Selected entry styles
  selectedEntryContainer: {
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  selectedEntryHeader: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarDateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginRight: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
  },
  selectedEntryContent: {
    flex: 1,
    minHeight: 300, // Ensure there's enough space for content
  },
  snippetsContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  emptyEntryContainer: {
    marginTop: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEntryText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  entryScrollView: {
    flex: 1,
  },
  entryScrollContent: {
    paddingBottom: 20,
  },
  viewSelectorContainer: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  viewSelector: {
    flexDirection: 'row',
  },
  viewOption: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginRight: 16,
  },
  activeViewOption: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  viewOptionText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  activeViewOptionText: {
    color: '#333',
    fontWeight: '600',
  },
}); 