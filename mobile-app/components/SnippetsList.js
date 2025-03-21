import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList
} from 'react-native';
import { DateUtils } from '../utils';

const SnippetsList = ({ snippets, emptyMessage = "No snippets yet." }) => {
  const renderSnippet = ({ item }) => {
    // Add defensive code to handle potential issues
    let formattedTime = '';
    try {
      if (item && item.created_at) {
        formattedTime = DateUtils.formatTime(item.created_at);
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      // Fallback to a basic timestamp if DateUtils fails
      if (item && item.created_at) {
        const date = new Date(item.created_at);
        formattedTime = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }

    return (
      <View style={styles.snippetItem}>
        <Text style={styles.snippetTime}>
          {formattedTime}
        </Text>
        <Text style={styles.snippetText}>{item?.text || item?.entry || ''}</Text>
      </View>
    );
  };

  if (!snippets || snippets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={snippets}
      renderItem={renderSnippet}
      keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
      style={styles.snippetsList}
    />
  );
};

const styles = StyleSheet.create({
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SnippetsList; 