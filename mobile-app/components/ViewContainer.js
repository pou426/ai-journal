import React, { useState, useEffect, useRef } from 'react';
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
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const fadeOutAnimation = useRef(null);
  const fadeInAnimation = useRef(null);
  
  // Update view if defaultToJournal prop changes
  useEffect(() => {
    setShowJournal(defaultToJournal);
  }, [defaultToJournal]);

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      // Remove animation listeners and stop animations
      fadeAnim.removeAllListeners();
      if (fadeOutAnimation.current) {
        fadeOutAnimation.current.stop();
      }
      if (fadeInAnimation.current) {
        fadeInAnimation.current.stop();
      }
    };
  }, [fadeAnim]);

  const toggleView = () => {
    // Stop any ongoing animations
    if (fadeOutAnimation.current) {
      fadeOutAnimation.current.stop();
    }
    if (fadeInAnimation.current) {
      fadeInAnimation.current.stop();
    }
    
    // Fade out
    fadeOutAnimation.current = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    });
    
    fadeOutAnimation.current.start(() => {
      // Toggle the view
      const newIsJournal = !showJournal;
      setShowJournal(newIsJournal);
      
      // Call the callback if provided
      if (onToggleView) {
        onToggleView(newIsJournal);
      }
      
      // Fade in
      fadeInAnimation.current = Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      });
      
      fadeInAnimation.current.start();
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