import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View,
} from 'react-native';
import { useAuth } from '../context';
import { SnippetService, JournalService } from '../services';
import { SnippetsList, TabContainer, JournalSummary } from '../components';

export default function ViewEntryScreen({ route, navigation }) {
  const [snippets, setSnippets] = useState([]);
  const [journal, setJournal] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'snippets'
  const { user } = useAuth();
  
  // Get the date from the route params
  const date = route.params?.date;
  
  useEffect(() => {
    if (user && date) {
      fetchEntry();
    }
  }, [user, date]);

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

  return (
    <View style={styles.container}>
      <TabContainer activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'summary' ? (
        <JournalSummary summary={journal} />
      ) : (
        <View style={styles.contentContainer}>
          <SnippetsList 
            snippets={snippets} 
            emptyMessage="No snippets found for this day" 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  contentContainer: {
    flex: 1,
  }
}); 