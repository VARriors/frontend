/**
 * CV Requirement Modal
 *
 * Shows when candidate tries to apply for a job that requires a CV.
 * Offers options to upload CV first or cancel.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { AlertCircle, Upload, X } from 'lucide-react-native';

interface CVRequirementModalProps {
  visible: boolean;
  jobTitle: string;
  reason?: string;
  onUploadCV: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const CVRequirementModal: React.FC<CVRequirementModalProps> = ({
  visible,
  jobTitle,
  reason,
  onUploadCV,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCancel}
            disabled={loading}
          >
            <X size={24} color="#6B7280" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <AlertCircle size={48} color="#F59E0B" />
          </View>

          {/* Title */}
          <Text style={styles.title}>CV Required</Text>

          {/* Description */}
          <Text style={styles.description}>
            The job "{jobTitle}" requires a CV to apply.
          </Text>

          {reason && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          )}

          {/* Message */}
          <Text style={styles.message}>
            Upload your CV now to complete your application.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.uploadButton]}
              onPress={onUploadCV}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Upload size={18} color="#FFFFFF" style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>
                {loading ? 'Loading...' : 'Upload CV'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Help text */}
          <Text style={styles.helpText}>
            💡 You can upload your CV in your profile and apply for this job afterwards.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 24,
    maxWidth: '85%',
    gap: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  reasonBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reasonText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  message: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButton: {
    backgroundColor: '#10B981',
  },
  uploadIcon: {
    marginRight: 4,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default CVRequirementModal;
