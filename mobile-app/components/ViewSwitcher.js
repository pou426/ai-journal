import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Animated,
} from 'react-native';

/**
 * A reusable component for switching between AI Journal and Snippets views
 * 
 * @param {Object} props 
 * @param {boolean} props.showJournal - Whether to show the journal (true) or snippets (false)
 * @param {Function} props.onToggle - Callback function when view is toggled
 * @param {Object} props.style - Additional styles for the container
 */
const ViewSwitcher = ({ showJournal, onToggle, style }) => {
  return (
    <View style={[styles.viewSelectorContainer, style]}>
      <View style={styles.viewSelector}>
        <TouchableOpacity 
          style={[styles.viewOption, showJournal && styles.activeViewOption]} 
          onPress={() => !showJournal && onToggle()}
        >
          <Text style={[styles.viewOptionText, showJournal && styles.activeViewOptionText]}>AI Journal ✨</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewOption, !showJournal && styles.activeViewOption]} 
          onPress={() => showJournal && onToggle()}
        >
          <Text style={[styles.viewOptionText, !showJournal && styles.activeViewOptionText]}>Snippets 📝</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default ViewSwitcher; 