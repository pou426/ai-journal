import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SignInScreen({ navigation }) {
  // Pre-fill with placeholder credentials
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password');

  const handleSignIn = () => {
    // For now, just check against placeholder credentials
    if (email === 'user@example.com' && password === 'password') {
      navigation.replace('MainTabs');
    } else {
      // In a real app, you'd want to show an error message
      alert('Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="fountain-pen-tip" 
          size={64} 
          color="#333" 
          style={styles.icon}
        />
        <Text style={styles.title}>AI Journal</Text>
        <Text style={styles.subtitle}>Little Moments</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.signInButton}
          onPress={handleSignIn}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Development Mode:{'\n'}
          Credentials are pre-filled
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  hint: {
    marginTop: 32,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
}); 