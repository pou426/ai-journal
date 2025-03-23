import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Animated,
} from 'react-native';
import ViewSwitcher from './ViewSwitcher';

/**
 * A container component that provides view switching with animation between AI Journal and Snippets
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.journalView - The component to show when journal is active
 * @param {React.ReactNode} props.snippetsView - The component to show when snippets is active
 * @param {boolean} props.defaultToJournal - Whether to default to journal view (true) or snippets view (false)
 * @param {Function} props.onToggleView - Optional callback when view is toggled, receives isJournal boolean
 * @param {Object} props.style - Additional styles for the container
 * @param {Object} props.switcherStyle - Additional styles for the view switcher
 */
const ViewContainer = ({ 
  journalView, 
  snippetsView, 
  defaultToJournal = true,
  onToggleView,
  style,
  switcherStyle
}) => {
  const [showJournal, setShowJournal] = useState(defaultToJournal);
  const fadeAnim = useState(new Animated.Value(1))[0];
  
  // Update view if defaultToJournal prop changes
  useEffect(() => {
    setShowJournal(defaultToJournal);
  }, [defaultToJournal]);

  const toggleView = () => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Toggle the view
      const newIsJournal = !showJournal;
      setShowJournal(newIsJournal);
      
      // Call the callback if provided
      if (onToggleView) {
        onToggleView(newIsJournal);
      }
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={[styles.container, style]}>
      {/* View toggle controls */}
      <ViewSwitcher
        showJournal={showJournal}
        onToggle={toggleView}
        style={switcherStyle}
      />

      {/* Content with fade animation */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {showJournal ? journalView : snippetsView}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});

export default ViewContainer; 