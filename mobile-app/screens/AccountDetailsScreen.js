import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  SafeAreaView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context';

export default function AccountDetailsScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons 
          name="arrow-left" 
          size={24} 
          color="#333"
        />
        <Text style={styles.backText}>Settings</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
}); 