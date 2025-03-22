import React, { useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SectionList,
  Animated
} from 'react-native';
import { DateUtils } from '../utils';

const SnippetsList = ({ snippets, emptyMessage = "No snippets yet." }) => {
  // Group snippets by time of day (Morning/Afternoon/Evening)
  const groupedSnippets = useMemo(() => {
    if (!snippets || snippets.length === 0) return [];
    
    // Sort snippets by created_at
    const sortedSnippets = [...snippets].sort((a, b) => {
      return new Date(a.created_at) - new Date(b.created_at);
    });
    
    // Group into Morning (5am-11:59am), Afternoon (12pm-5:59pm), Evening (6pm-4:59am)
    const morningSnippets = [];
    const afternoonSnippets = [];
    const eveningSnippets = [];
    
    sortedSnippets.forEach(snippet => {
      try {
        const date = new Date(snippet.created_at);
        const hours = date.getHours();
        
        if (hours >= 5 && hours < 12) {
          morningSnippets.push(snippet);
        } else if (hours >= 12 && hours < 18) {
          afternoonSnippets.push(snippet);
        } else {
          eveningSnippets.push(snippet);
        }
      } catch (error) {
        // If there's an error, default to Morning
        morningSnippets.push(snippet);
      }
    });
    
    const sections = [];
    
    if (morningSnippets.length > 0) {
      sections.push({
        title: 'Morning',
        symbol: '🌅',  // Sunrise symbol
        data: morningSnippets
      });
    }
    
    if (afternoonSnippets.length > 0) {
      sections.push({
        title: 'Afternoon',
        symbol: '☀️',  // Sun symbol
        data: afternoonSnippets
      });
    }
    
    if (eveningSnippets.length > 0) {
      sections.push({
        title: 'Evening',
        symbol: '🌆',  // Sunset symbol
        data: eveningSnippets
      });
    }
    
    return sections;
  }, [snippets]);

  const renderSnippet = ({ item, index, section }) => {
    // Format time without AM/PM
    let formattedTime = '';
    try {
      if (item && item.created_at) {
        const date = new Date(item.created_at);
        let hours = date.getHours();
        // Convert to 12-hour format without AM/PM
        if (hours > 12) hours -= 12;
        if (hours === 0) hours = 12;
        
        const minutes = date.getMinutes().toString().padStart(2, '0');
        formattedTime = `${hours}:${minutes}`;
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      formattedTime = '00:00';
    }

    const isLastItem = index === section.data.length - 1;

    return (
      <View style={[styles.snippetItem, isLastItem && styles.lastSnippetItem]}>
        <View style={styles.timeContainer}>
          <Text style={styles.snippetTime}>{formattedTime}</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.snippetText}>{item?.text || item?.entry || ''}</Text>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionSymbol}>{section.symbol}</Text>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  if (!snippets || snippets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={groupedSnippets}
      renderItem={renderSnippet}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
      style={styles.snippetsList}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={true}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  snippetsList: {
    flex: 1,
    backgroundColor: 'white',
  },
  listContent: {
    paddingBottom: 16,
  },
  snippetItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eeeeee',
  },
  lastSnippetItem: {
    marginBottom: 12,
  },
  timeContainer: {
    width: 40,
    marginRight: 12,
  },
  snippetTime: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  contentContainer: {
    flex: 1,
  },
  snippetText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'white',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eeeeee',
  },
  sectionSymbol: {
    fontSize: 15,
    marginRight: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  }
});

export default SnippetsList; 