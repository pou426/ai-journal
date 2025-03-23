import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View,
} from 'react-native';
import { useAuth } from '../context';
import { SnippetService, JournalService } from '../services';
import { SnippetsList, JournalSummary, ViewContainer } from '../components';

export default function ViewEntryScreen({ route, navigation }) {
  const [snippets, setSnippets] = useState([]);
  const [journal, setJournal] = useState('');
  const { user } = useAuth();
  
  // Get the date from the route params
  const date = route.params?.date;
  
  useEffect(() => {
    if (user && date) {
      fetchEntry();
    }
  }, [user, date]);

  // Format date for display and set navigation header
  useEffect(() => {
    if (date) {
      const formattedDate = formatDate(date);
      navigation.setOptions({
        title: formattedDate,
        headerTitle: formattedDate,
      });
    }
  }, [date, navigation]);

  const fetchEntry = async () => {
    if (!user || !date) return;
    
    try {
      // Fetch snippets for the day
      const daySnippets = await SnippetService.getSnippetsByDate(user.id, date);
      setSnippets(daySnippets || []); // Ensure we're setting an array

      // Fetch journal entry for the day
      const journalEntry = await JournalService.getJournalByDate(user.id, date);
      if (journalEntry) {
        setJournal(journalEntry.entry);
      } else {
        // Clear the journal content if there's no journal entry for the day
        setJournal('');
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      setJournal('');
      setSnippets([]);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
      return `${dayOfWeek}   ${formattedDate}`;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <ViewContainer
        journalView={<JournalSummary summary={journal} />}
        snippetsView={
          <SnippetsList 
            snippets={snippets} 
            emptyMessage="No snippets found for this day" 
          />
        }
        defaultToJournal={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
}); 