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
  const journalAnim = useRef(new Animated.Value(defaultToJournal ? 1 : 0)).current;
  const snippetsAnim = useRef(new Animated.Value(defaultToJournal ? 0 : 1)).current;

  // Update view if defaultToJournal prop changes
  useEffect(() => {
    setShowJournal(defaultToJournal);
  }, [defaultToJournal]);

  const toggleView = () => {
    const newIsJournal = !showJournal;
    setShowJournal(newIsJournal);

    // Animate both views simultaneously
    Animated.parallel([
      Animated.timing(journalAnim, {
        toValue: newIsJournal ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(snippetsAnim, {
        toValue: newIsJournal ? 0 : 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();

    if (onToggleView) {
      onToggleView(newIsJournal);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.switcherContainer}>
        <ViewSwitcher
          showJournal={showJournal}
          onToggle={toggleView}
          style={switcherStyle}
        />
      </View>

      <View style={styles.contentWrapper}>
        {/* Keep both views mounted but control visibility with animation */}
        <Animated.View style={[
          styles.contentContainer, 
          styles.absoluteFill,
          { 
            opacity: journalAnim,
            zIndex: showJournal ? 1 : 0 
          }
        ]}>
          {journalView}
        </Animated.View>

        <Animated.View style={[
          styles.contentContainer,
          styles.absoluteFill,
          { 
            opacity: snippetsAnim,
            zIndex: showJournal ? 0 : 1
          }
        ]}>
          {snippetsView}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  switcherContainer: {
    zIndex: 2, // Ensure switcher is always on top
    backgroundColor: 'white',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ViewContainer; 