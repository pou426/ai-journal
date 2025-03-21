import { supabase } from '../utils/supabase';

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} - Promise containing the signed in user data
 */
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} - Promise containing the signed up user data
 */
export const signUpWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise} - Promise that resolves when sign out is complete
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get the current user
 * @returns {Promise} - Promise containing the current user data or null
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}; 