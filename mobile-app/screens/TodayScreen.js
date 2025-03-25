import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View,
} from 'react-native';
import { useAuth } from '../context';
import { SnippetService, JournalService } from '../services';
import { DateUtils } from '../utils';
import { SnippetsList, JournalSummary, ViewContainer } from '../components';

export default function TodayScreen({ navigation, route }) {
  const [snippets, setSnippets] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sentimentScore, setSentimentScore] = useState(null);
  const [currentView, setCurrentView] = useState('snippets'); // Track the active view
  const { user } = useAuth();
  const prevRefreshTrigger = useRef(0);
  
  // Access refreshTrigger from route params
  const refreshTrigger = route.params?.refreshTrigger || 0;
  
  // Always use today's date
  const date = DateUtils.getTodayISODate();

  useEffect(() => {
    if (user) {
      fetchEntry();
      // Add listener for when screen comes into focus
      const unsubscribe = navigation.addListener('focus', () => {
        fetchEntry();
      });
      return unsubscribe;
    }
  }, [navigation, user]);

  // Respond to param changes immediately, even when already on screen
  useEffect(() => {
    if (!user) return;
    
    // Only process this if refreshTrigger changed or if there's a new snippet
    if (refreshTrigger > prevRefreshTrigger.current || route.params?.newSnippet) {
      prevRefreshTrigger.current = refreshTrigger;
      
      // Check if there's a new snippet to add immediately 
      const newSnippet = route.params?.newSnippet;
      const isGeneratingJournal = route.params?.isGeneratingJournal;
      
      if (newSnippet) {
        // Add the new snippet optimistically to the UI
        addSnippetToUI(newSnippet);
        // Clear the newSnippet param to prevent duplicate additions
        navigation.setParams({ 
          newSnippet: undefined,
          isGeneratingJournal: undefined 
        });
        
        // If we're in journal view or if explicitly told the journal is generating, show spinner
        if (currentView === 'journal' || isGeneratingJournal) {
          setIsGenerating(true);
        }
      }
      
      // Always fetch from server to get the latest data
      fetchEntry();
    }
  }, [refreshTrigger, route.params?.newSnippet, route.params?.isGeneratingJournal, user, currentView]);

  // Function to add a snippet to the UI immediately
  const addSnippetToUI = useCallback((newSnippet) => {
    if (!newSnippet) return;
    
    setSnippets(currentSnippets => {
      // Check if we already have this snippet in the array (by temporary ID)
      const snippetExists = currentSnippets.some(s => 
        s.id === newSnippet.id || 
        (s.text === newSnippet.text && s.created_at === newSnippet.created_at)
      );
      
      if (snippetExists) {
        return currentSnippets;
      }
      
      // Add the new snippet at the beginning of the array
      return [newSnippet, ...currentSnippets];
    });
  }, []);

  const fetchEntry = async () => {
    if (!user) return;
    
    try {
      // Fetch snippets for the day
      const daySnippets = await SnippetService.getSnippetsByDate(user.id, date);
      setSnippets(daySnippets || []); // Ensure we're setting an array

      // If we're fetching after adding a snippet, show the loading state
      const isRefreshingJournal = isGenerating;
      
      // Fetch journal entry for the day
      const journalEntry = await JournalService.getJournalByDate(user.id, date);
      if (journalEntry) {
        setAiSummary(journalEntry.entry);
        setSentimentScore(journalEntry.sentiment_score);
        setIsGenerating(false); // Turn off loading state when journal is loaded
      } else {
        // Clear the AI summary if there's no journal entry for today
        setAiSummary('');
        setSentimentScore(null);
        
        // Check if we're in the process of generating a new journal
        if (isRefreshingJournal) {
          // If we're expecting a journal but don't have one yet,
          // keep the loading state on - the generation may still be in progress
        } else {
          // If we're not expecting a new journal, turn off loading state
          setIsGenerating(false);
        }
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      // Clear the AI summary on error
      setAiSummary('');
      setSnippets([]); // Reset snippets on error
      setSentimentScore(null);
      setIsGenerating(false); // Turn off loading state on error
    }
  };

  // Handle view toggle
  const handleViewToggle = (isJournal) => {
    setCurrentView(isJournal ? 'journal' : 'snippets');
  };

  return (
    <View style={styles.container}>
      <ViewContainer
        journalView={
          <JournalSummary 
            summary={aiSummary} 
            isGenerating={isGenerating}
            sentimentScore={sentimentScore}
            date={date}
          />
        }
        snippetsView={
          <SnippetsList 
            snippets={snippets} 
            emptyMessage="No snippets recorded today" 
          />
        }
        defaultToJournal={currentView === 'journal'}
        onToggleView={handleViewToggle}
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