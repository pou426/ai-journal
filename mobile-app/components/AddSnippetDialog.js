import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context';
import { SnippetService } from '../services';
import { DateUtils } from '../utils';

const AddSnippetDialog = ({ visible, onClose, onSnippetAdded }) => {
  const [snippetText, setSnippetText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  // Clear input when modal opens
  useEffect(() => {
    if (visible) {
      setSnippetText('');
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!snippetText.trim() || !user) return;
    
    const snippetContent = snippetText.trim();
    setIsSubmitting(true);
    
    try {
      // Create the new snippet object for immediate display
      const todayDate = DateUtils.getTodayISODate();
      const tempSnippet = {
        id: `temp-${Date.now()}`, // Temporary ID
        text: snippetContent,
        entry: snippetContent,
        created_at: new Date().toISOString(),
        user_id: user.id,
        date: todayDate
      };
      
      // Notify parent component about the new snippet before closing the dialog
      if (onSnippetAdded) {
        onSnippetAdded(tempSnippet, true);
      }
      
      // Close the dialog
      onClose();
      
      // Then create the snippet in the backend
      await SnippetService.createSnippetWithSummary(user.id, snippetContent);
      
      // After successful creation, trigger a refresh to get the real server ID
      if (onSnippetAdded) {
        onSnippetAdded();
      }
    } catch (error) {
      console.error('Error saving snippet:', error);
    } finally {
      setIsSubmitting(false);
      setSnippetText('');
    }
  };

  const handleCancel = () => {
    setSnippetText('');
    onClose();
  };
  
  // Dismiss keyboard when clicking outside the input
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.dialogContainer}>
                <Text style={styles.dialogTitle}>✏️ New Snippet</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What's happening?"
                  value={snippetText}
                  onChangeText={setSnippetText}
                  multiline
                  autoFocus
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      (!snippetText.trim() || isSubmitting) && styles.disabledButton
                    ]}
                    onPress={handleSubmit}
                    disabled={!snippetText.trim() || isSubmitting}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    elevation: 0,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddSnippetDialog; 