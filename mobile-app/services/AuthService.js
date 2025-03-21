import { authApi } from '../api';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../utils/supabase';

/**
 * Service for handling authentication-related business logic
 */
class AuthService {
  /**
   * Get the current user session
   * @returns {Promise<Object|null>} - Current session or null
   */
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('AuthService.getSession error:', error);
      return null;
    }
  }

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Callback function to be called when auth state changes
   * @returns {Object} - Subscription object
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }

  /**
   * Get the current authenticated user
   * @returns {Promise<Object|null>} - Current user or null
   */
  async getCurrentUser() {
    try {
      return await authApi.getCurrentUser();
    } catch (error) {
      console.error('AuthService.getCurrentUser error:', error);
      return null;
    }
  }

  /**
   * Get the current user's email
   * @returns {Promise<string|null>} - User's email or null
   */
  async getUserEmail() {
    try {
      const session = await this.getSession();
      return session?.user?.email || null;
    } catch (error) {
      console.error('AuthService.getUserEmail error:', error);
      return null;
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - Auth data
   */
  async signInWithEmail(email, password) {
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!this.validatePassword(password)) {
      throw new Error('Password must be at least 6 characters');
    }

    try {
      return await authApi.signInWithEmail(email, password);
    } catch (error) {
      console.error('AuthService.signInWithEmail error:', error);
      throw error;
    }
  }

  /**
   * Sign up with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - Auth data
   */
  async signUpWithEmail(email, password) {
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!this.validatePassword(password)) {
      throw new Error('Password must be at least 6 characters');
    }

    try {
      return await authApi.signUpWithEmail(email, password);
    } catch (error) {
      console.error('AuthService.signUpWithEmail error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google
   * @returns {Promise<Object>} - Auth data
   * @throws {Error} - With appropriate error code if sign-in fails
   */
  async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.data?.idToken) {
        throw new Error('No ID token present');
      }
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });
      
      if (error) {
        console.error('Supabase auth error:', error);
        throw new Error('Failed to sign in with Google');
      }
      
      return data;
    } catch (error) {
      console.error('AuthService.signInWithGoogle error:', error);
      
      // Rethrow the error to be handled by the UI component
      if (error.code === statusCodes.SIGN_IN_CANCELLED ||
          error.code === statusCodes.IN_PROGRESS ||
          error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw error; // Preserve original error with code
      }
      
      // For other errors, wrap in a generic error
      throw new Error('Failed to sign in with Google');
    }
  }

  /**
   * Check if Google Play Services are available
   * @returns {Promise<boolean>} - Whether Play Services are available
   */
  async checkPlayServices() {
    try {
      await GoogleSignin.hasPlayServices();
      return true;
    } catch (error) {
      console.error('AuthService.checkPlayServices error:', error);
      return false;
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      // Sign out from Supabase
      await authApi.signOut();
      
      // Sign out from Google
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
        console.error('Error signing out from Google:', googleError);
        // Continue with the sign out process even if Google sign out fails
      }
    } catch (error) {
      console.error('AuthService.signOut error:', error);
      throw error;
    }
  }

  /**
   * Configure Google Sign-In
   * @param {string} iosClientId - iOS client ID for Google Sign-In
   */
  configureGoogleSignIn(iosClientId) {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      iosClientId,
    });
  }

  /**
   * Get the status codes for Google Sign-In errors
   * @returns {Object} - Status codes
   */
  getGoogleSignInStatusCodes() {
    return statusCodes;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether the email is valid
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password
   * @param {string} password - Password to validate
   * @returns {boolean} - Whether the password is valid
   */
  validatePassword(password) {
    return !!password && password.length >= 6;
  }
}

// Export as a singleton
export default new AuthService(); 