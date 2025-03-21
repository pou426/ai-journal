import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context';
import { SnippetService, JournalService } from '../services';
import { DateUtils } from '../utils';
import { SnippetsList, TabContainer, JournalSummary } from '../components';

export default function TodayScreen({ navigation }) {
  const [snippetInput, setSnippetInput] = useState('');
  const [snippets, setSnippets] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'snippets'
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  
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

  const fetchEntry = async () => {
    if (!user) return;
    
    try {
      // Fetch snippets for the day
      const daySnippets = await SnippetService.getSnippetsByDate(user.id, date);
      setSnippets(daySnippets || []); // Ensure we're setting an array

      // Fetch journal entry for the day
      const journalEntry = await JournalService.getJournalByDate(user.id, date);
      if (journalEntry) {
        setAiSummary(journalEntry.entry);
      } else {
        // Clear the AI summary if there's no journal entry for today
        setAiSummary('');
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      // Clear the AI summary on error
      setAiSummary('');
      setSnippets([]); // Reset snippets on error
    }
  };

  const addSnippet = async () => {
    if (!snippetInput.trim() || !user) return;

    setIsGenerating(true);
    try {
      // Use the service to create snippet and generate journal
      const journalEntry = await SnippetService.createSnippetWithSummary(user.id, snippetInput.trim());
      
      // Update UI with the new journal entry
      setAiSummary(journalEntry.entry);
      setSnippetInput('');
      
      // Refresh snippets
      const daySnippets = await SnippetService.getSnippetsByDate(user.id, date);
      setSnippets(daySnippets);
    } catch (error) {
      console.error('Error saving snippet:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What's happening?"
          value={snippetInput}
          onChangeText={setSnippetInput}
          multiline
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addSnippet}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TabContainer activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'summary' ? (
        <JournalSummary summary={aiSummary} isGenerating={isGenerating} />
      ) : (
        <View style={styles.contentContainer}>
          <SnippetsList 
            snippets={snippets} 
            emptyMessage="No snippets yet. Add your first snippet above!" 
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  buttonContainer: {
    width: 60,
    height: 40,
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 40,
    maxHeight: 100,
  },
  addButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  }
}); 