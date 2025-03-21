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

export default function SettingsScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      // Sign out using the AuthContext
      await signOut();
      
      // Navigation is automatically handled in App.js by AuthContext
      // No need to reset navigation here
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Failed to log out. Please try again.');
    }
  };
  
  const goBackToHome = () => {
    // Navigate to SignIn screen without logging out
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('AccountDetails', { email: user?.email })}
          >
            <View style={styles.menuRow}>
              <MaterialCommunityIcons 
                name="account" 
                size={24} 
                color="#333"
              />
              <Text style={styles.menuText}>Account Details</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.borderTop]}
            onPress={goBackToHome}
          >
            <View style={styles.menuRow}>
              <MaterialCommunityIcons 
                name="home" 
                size={24} 
                color="#333"
              />
              <Text style={styles.menuText}>Back to Home</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  menuSection: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '500',
  },
}); 