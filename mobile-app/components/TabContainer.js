import React from 'react';
import { StyleSheet, View } from 'react-native';
import TabButton from './TabButton';

const TabContainer = ({ 
  activeTab, 
  setActiveTab, 
  tabs = [
    { id: 'summary', title: 'AI Summary' },
    { id: 'snippets', title: 'Snippets' }
  ] 
}) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map(tab => (
        <TabButton 
          key={tab.id}
          title={tab.title} 
          isActive={activeTab === tab.id} 
          onPress={() => setActiveTab(tab.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 4,
  },
});

export default TabContainer; 