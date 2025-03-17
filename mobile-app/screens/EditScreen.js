import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { API_URL } from '../config';
import axios from 'axios';
import { generateJournalSummary } from '../services/aiService';

export default function EditScreen({ route, navigation }) {
  const [snippetInput, setSnippetInput] = useState('');
  const [snippets, setSnippets] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'snippets'
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Check if we're viewing a past entry
  const isPastEntry = route?.params?.date !== undefined;
  const date = isPastEntry ? route.params.date : new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchEntry();
    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEntry();
    });
    return unsubscribe;
  }, [navigation, date]);

  const fetchEntry = async () => {
    try {
      const response = await axios.get(`${API_URL}/entries/${date}`);
      if (response.data.content) {
        try {
          const data = JSON.parse(response.data.content);
          setSnippets(data.snippets || []);
          setAiSummary(data.aiSummary || '');
        } catch (parseError) {
          console.error('Error parsing entry:', parseError);
        }
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
    }
  };

  const generateAISummary = async (newSnippets) => {
    setIsGenerating(true);
    try {
      const summary = await generateJournalSummary(newSnippets);
      setIsGenerating(false);
      return summary;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setIsGenerating(false);
      // Return a fallback summary in case of error
      return newSnippets.map(s => s.text).join('\n\n');
    }
  };

  const addSnippet = async () => {
    if (!snippetInput.trim()) return;

    const newSnippet = {
      id: Date.now().toString(),
      text: snippetInput.trim(),
      timestamp: new Date().toISOString(),
    };

    const newSnippets = [...snippets, newSnippet];
    
    // First update UI with the new snippet
    setSnippets(newSnippets);
    setSnippetInput('');
    
    try {
      // Generate AI summary
      const newAiSummary = await generateAISummary(newSnippets);
      
      // Update the backend with both new snippet and AI summary
      await axios.put(`${API_URL}/entries/${date}`, {
        content: JSON.stringify({
          snippets: newSnippets,
          aiSummary: newAiSummary,
        }),
        date: `${date}T00:00:00.000Z`,
      });
      
      // Update the AI summary in UI
      setAiSummary(newAiSummary);

      // Trigger a refresh of the HomeScreen by updating a shared state or using events
      // This could be done through context, redux, or event emitter
    } catch (error) {
      console.error('Error saving snippet:', error);
    }
  };

  const renderSnippet = ({ item }) => (
    <View style={styles.snippetItem}>
      <Text style={styles.snippetTime}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
      <Text style={styles.snippetText}>{item.text}</Text>
    </View>
  );

  const TabButton = ({ title, isActive, onPress }) => (
    <Pressable 
      style={[styles.tabButton, isActive && styles.activeTabButton]} 
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </Pressable>
  );

  // If it's a past entry, render a read-only view
  if (isPastEntry) {
    return (
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TabButton 
            title="AI Summary" 
            isActive={activeTab === 'summary'} 
            onPress={() => setActiveTab('summary')}
          />
          <TabButton 
            title="Snippets" 
            isActive={activeTab === 'snippets'} 
            onPress={() => setActiveTab('snippets')}
          />
        </View>

        {activeTab === 'summary' ? (
          <View style={styles.summaryContainer}>
            <ScrollView 
              style={styles.summaryScroll}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.summaryText}>{aiSummary}</Text>
            </ScrollView>
          </View>
        ) : (
          <FlatList
            data={snippets}
            renderItem={renderSnippet}
            keyExtractor={item => item.id}
            style={styles.snippetsList}
          />
        )}
      </View>
    );
  }

  // Original render for today's entry with input field
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

      <View style={styles.tabContainer}>
        <TabButton 
          title="AI Summary" 
          isActive={activeTab === 'summary'} 
          onPress={() => setActiveTab('summary')}
        />
        <TabButton 
          title="Snippets" 
          isActive={activeTab === 'snippets'} 
          onPress={() => setActiveTab('snippets')}
        />
      </View>

      {activeTab === 'summary' ? (
        <View style={styles.summaryContainer}>
          <ScrollView 
            style={styles.summaryScroll}
            showsVerticalScrollIndicator={true}
          >
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#333" />
                <Text style={styles.loadingText}>Generating AI Summary...</Text>
              </View>
            ) : (
              <Text style={styles.summaryText}>{aiSummary}</Text>
            )}
          </ScrollView>
        </View>
      ) : (
        <FlatList
          data={snippets}
          renderItem={renderSnippet}
          keyExtractor={item => item.id}
          style={styles.snippetsList}
        />
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
  },
  summaryContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  summaryScroll: {
    flex: 1,
    padding: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  snippetsList: {
    flex: 1,
  },
  snippetItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  snippetTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  snippetText: {
    fontSize: 14,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
}); 