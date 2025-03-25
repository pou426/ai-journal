import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { DateUtils, SentimentUtils } from '../utils';

const { width } = Dimensions.get('window');
const CALENDAR_PADDING = 10;
const DAY_SIZE = (width - (CALENDAR_PADDING * 2)) / 7;

const Calendar = ({ 
  entries = [], 
  selectedDate, 
  setSelectedDate,
  calendarMonths = [],
  visibleMonthIndex = 0,
  setVisibleMonthIndex
}) => {
  // Get the current month using the visibleMonthIndex
  const visibleMonth = calendarMonths[visibleMonthIndex] || { month: 0, year: 2023, monthDisplay: 'January' };

  // Check if a month is the current month or in the future
  const isCurrentOrFutureMonth = (year, month) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Return true if it's the current month or a future month
    return (year > currentYear) || (year === currentYear && month >= currentMonth);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    // Check if we can navigate to previous month (not beyond the earliest entry month)
    if (visibleMonthIndex < calendarMonths.length - 1) {
      setVisibleMonthIndex(visibleMonthIndex + 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    // Check if we can navigate to next month (not beyond current month)
    if (visibleMonthIndex > 0) {
      // Get the next month data
      const nextMonth = calendarMonths[visibleMonthIndex - 1];
      
      // Don't allow navigation to or beyond the current month
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      if (nextMonth.year > currentYear || 
         (nextMonth.year === currentYear && nextMonth.month > currentMonth)) {
        return;
      }
      
      setVisibleMonthIndex(visibleMonthIndex - 1);
    }
  };

  const renderDayOfWeekHeader = () => {
    // Changed order to start with Monday
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <View style={styles.daysOfWeekHeader}>
        {daysOfWeek.map((day, index) => (
          <View key={`weekday-${index}`} style={styles.dayOfWeekCell}>
            <Text style={styles.dayOfWeekText}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCalendarDay = (day, index) => {
    if (day.empty) {
      return <View key={day.id} style={styles.calendarDay} />;
    }

    const isTodayAndSelected = day.isToday && day.isSelected;
    
    // Get the sentiment score for this date if available
    const entryForDay = day.hasEntry ? entries.find(entry => entry.date === day.dateString) : null;
    const sentimentScore = entryForDay?.sentiment_score;
    
    // Get the mood color for the indicator dot
    const dotColor = sentimentScore !== undefined && sentimentScore !== null ? 
      SentimentUtils.getSentimentInfo(sentimentScore).bgColor : '#888';

    return (
      <TouchableOpacity
        key={day.id}
        style={[
          styles.calendarDay,
          isTodayAndSelected ? styles.todayAndSelectedDay : 
          day.isSelected ? styles.selectedDay : 
          day.isToday ? styles.todayDay : null,
        ]}
        onPress={() => {
          if (day.hasEntry) {
            setSelectedDate(day.dateString);
          }
        }}
        disabled={!day.hasEntry}
      >
        <Text style={[
          styles.calendarDayText,
          day.isSelected && styles.selectedDayText,
          day.isToday && styles.todayDayText,
          !day.hasEntry && styles.noEntryDayText
        ]}>
          {day.day}
        </Text>
        {day.hasEntry && <View style={[
          styles.entryIndicator, 
          { backgroundColor: dotColor }
        ]} />}
      </TouchableOpacity>
    );
  };

  // Calculate calendar data for current month
  const renderCalendar = () => {
    if (!calendarMonths.length) return null;
    
    const monthYear = `${visibleMonth.monthDisplay} ${visibleMonth.year}`;
    
    // Calculate days for the visible month
    const year = visibleMonth.year;
    const month = visibleMonth.month;
    
    // Create a date for the first day of the month (using UTC)
    const firstDay = new Date(Date.UTC(year, month, 1));
    
    // Get the day of the week for the first day (0-6, where 0 is Sunday, 1 is Monday, etc.)
    // Convert to Monday-first format (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
    const sundayStartingDay = firstDay.getUTCDay();
    const startingDayOfWeek = sundayStartingDay === 0 ? 6 : sundayStartingDay - 1;
    
    // Get the number of days in the month
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const daysInMonth = lastDay.getUTCDate();
    
    // Create an array for all days in the month plus empty slots for padding
    const days = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: '', empty: true, id: `empty-start-${i}` });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      // Format date as YYYY-MM-DD
      const formattedMonth = String(month + 1).padStart(2, '0');
      const formattedDay = String(i).padStart(2, '0');
      const dateString = `${year}-${formattedMonth}-${formattedDay}`;
      
      const hasEntry = entries.some(entry => entry.date === dateString);
      
      days.push({
        day: i,
        dateString,
        hasEntry,
        isToday: DateUtils.isToday(dateString),
        isSelected: dateString === selectedDate,
        id: `day-${dateString}-${i}`
      });
    }
    
    // Calculate total cells needed for complete weeks (7 days per week)
    const totalDays = startingDayOfWeek + daysInMonth;
    const remainingCells = 7 - (totalDays % 7);
    
    // Always add trailing empty days to complete the last week
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push({ day: '', empty: true, id: `empty-end-${i}` });
      }
    }
    
    // Group calendar days into weeks for proper grid alignment
    const weeks = [];
    let week = [];
    
    days.forEach((day, index) => {
      week.push(day);
      
      // When we reach the end of a week (7 days) or the end of the array
      if (week.length === 7 || index === days.length - 1) {
        weeks.push([...week]);
        week = [];
      }
    });

    // Calculate whether we can navigate to previous/next months
    const canGoBack = visibleMonthIndex < calendarMonths.length - 1;
    
    // Check if we are at the current month (cannot go forward)
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const isCurrentMonth = 
      visibleMonth.month === currentMonth && 
      visibleMonth.year === currentYear;
    
    const canGoForward = visibleMonthIndex > 0 && !isCurrentMonth;

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.monthNavigationContainer}>
          <TouchableOpacity 
            onPress={goToPreviousMonth} 
            style={[
              styles.calendarNavButton,
              !canGoBack && styles.calendarNavButtonDisabled
            ]}
            disabled={!canGoBack}
          >
            <Text style={[
              styles.calendarNavButtonText,
              !canGoBack && styles.calendarNavButtonTextDisabled
            ]}>←</Text>
          </TouchableOpacity>
          
          <Text style={styles.calendarTitle}>{monthYear}</Text>
          
          <TouchableOpacity 
            onPress={goToNextMonth} 
            style={[
              styles.calendarNavButton,
              !canGoForward && styles.calendarNavButtonDisabled
            ]}
            disabled={!canGoForward}
          >
            <Text style={[
              styles.calendarNavButtonText,
              !canGoForward && styles.calendarNavButtonTextDisabled
            ]}>→</Text>
          </TouchableOpacity>
        </View>
        
        {renderDayOfWeekHeader()}
        
        <View style={styles.calendarGrid}>
          {weeks.map((weekDays, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.calendarWeek}>
              {weekDays.map((day, dayIndex) => renderCalendarDay(day, dayIndex))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render the calendar if there are months available
  return calendarMonths.length > 0 ? renderCalendar() : null;
};

const styles = StyleSheet.create({
  calendarContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingBottom: 20,
  },
  monthNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calendarNavButton: {
    padding: 5,
  },
  calendarNavButtonText: {
    fontSize: 18,
    color: '#555',
  },
  calendarNavButtonDisabled: {
    opacity: 0.5,
  },
  calendarNavButtonTextDisabled: {
    color: '#ccc',
  },
  daysOfWeekHeader: {
    flexDirection: 'row',
    marginBottom: 5,
    justifyContent: 'space-around',
  },
  dayOfWeekCell: {
    width: (width - (CALENDAR_PADDING * 2)) / 7,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  dayOfWeekText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    width: '100%',
    flexDirection: 'column',
  },
  calendarWeek: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  calendarDay: {
    width: (width - (CALENDAR_PADDING * 2)) / 7,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 8,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  selectedDay: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  selectedDayText: {
    fontWeight: '600',
    color: '#444',
  },
  todayDay: {
    backgroundColor: '#666',
    borderRadius: 8,
  },
  todayDayText: {
    fontWeight: '700',
    color: '#fff',
  },
  todayAndSelectedDay: {
    backgroundColor: '#555',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
  },
  noEntryDayText: {
    color: '#bbb',
  },
  entryIndicator: {
    position: 'absolute',
    bottom: 8, 
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});

export default Calendar; 