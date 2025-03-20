import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Auth from '../components/Auth';
import { supabase } from '../utils/supabase';

export default function SignInScreen({ navigation }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check for existing session when component mounts
    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const handleStart = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
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

        {session ? (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStart}
          >
            <MaterialCommunityIcons 
              name="arrow-right" 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>
        ) : (
          <Auth navigation={navigation} />
        )}
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
    alignItems: 'center',
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
  startButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    marginTop: 16,
  },
}); 