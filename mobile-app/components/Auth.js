import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { IOS_CLIENT_ID } from '@env';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthService } from '../services';
import { useState, useEffect } from 'react';
import { useAuth } from '../context';

export default function Auth({ navigation }) {
    const [isSigningIn, setIsSigningIn] = useState(false);
    const { signInWithGoogle, error } = useAuth();
    
    // Configure Google Sign-In on component mount
    useEffect(() => {
        AuthService.configureGoogleSignIn(IOS_CLIENT_ID);
    }, []);
    
    // Import status codes directly to avoid TypeScript errors
    const {
        SIGN_IN_CANCELLED,
        IN_PROGRESS,
        PLAY_SERVICES_NOT_AVAILABLE
    } = statusCodes;

    const handleGoogleSignIn = async () => {
        if (isSigningIn) return; // Prevent multiple presses
        
        setIsSigningIn(true);
        try {
            const success = await signInWithGoogle();
            
            if (success) {
                // Navigation handled automatically in App.js
                // No need to navigate here
            }
        } catch (err) {
            if (err.code === SIGN_IN_CANCELLED) {
                // User cancelled the login flow
                console.log('Sign in cancelled');
            } else if (err.code === IN_PROGRESS) {
                // Operation is already in progress
                console.log('Sign in in progress');
            } else if (err.code === PLAY_SERVICES_NOT_AVAILABLE) {
                // Play services not available or outdated
                Alert.alert('Error', 'Google Play Services is not available or needs an update');
            } else {
                // Some other error happened
                console.error('Sign in error:', err);
                Alert.alert('Sign In Error', 'An error occurred during sign in. Please try again.');
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    // Show error from auth context if present
    useEffect(() => {
        if (error) {
            Alert.alert('Authentication Error', error);
        }
    }, [error]);

    return (
        <TouchableOpacity 
            style={styles.button}
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
        >
            <MaterialCommunityIcons name="google" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>
                {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#333',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        minWidth: 200,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    icon: {
        marginRight: 12,
    },
}); 