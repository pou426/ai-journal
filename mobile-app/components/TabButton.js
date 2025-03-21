import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';

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

const styles = StyleSheet.create({
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
});

export default TabButton; 