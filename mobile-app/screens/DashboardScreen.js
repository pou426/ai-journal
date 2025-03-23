import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
} from 'react-native';
import { useAuth } from '../context';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* Dashboard content will be added here later */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
}); 