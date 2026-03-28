/**
 * CV Upload Component
 *
 * Allows users to select and upload a PDF file from their device.
 * Shows file name, size, upload progress, and handles errors gracefully.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, X } from 'lucide-react-native';

type SelectedFile = {
  name: string;
  size: number;
  uri: string;
  type: string;
  file?: File;
};

interface CVUploadProps {
  onUpload?: (fileData: SelectedFile) => Promise<void>;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

const CVUpload: React.FC<CVUploadProps> = ({
  onUpload,
  onUploadStart,
  onUploadError,
  loading = false,
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          name: asset.name,
          size: asset.size || 0,
          uri: asset.uri,
          type: asset.mimeType || 'application/pdf',
          file: (asset as any).file,
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to select file';
      onUploadError?.(errorMsg);
      Alert.alert('Error', errorMsg);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    onUploadStart?.();

    try {
      if (!onUpload) {
        throw new Error('Upload handler is not configured');
      }

      await onUpload(selectedFile);

      setSelectedFile(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMsg);
      Alert.alert('Upload Error', errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const isLoading = loading || isUploading;
  const isDisabled = isLoading || disabled;

  return (
    <View style={styles.container}>
      {!selectedFile ? (
        <TouchableOpacity
          style={[styles.uploadButton, disabled && styles.uploadButtonDisabled]}
          onPress={selectFile}
          disabled={isDisabled}
        >
          <Upload size={32} color={disabled ? '#9CA3AF' : '#3B82F6'} style={styles.uploadIcon} />
          <Text style={[styles.uploadButtonText, disabled && styles.uploadButtonTextDisabled]}>
            {disabled ? 'CV already attached' : 'Select PDF CV'}
          </Text>
          <Text style={styles.uploadButtonSubtext}>
            {disabled ? 'Delete current CV to upload another one' : 'Tap to choose a file from your device'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.selectedFileContainer}>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{selectedFile.name}</Text>
            <Text style={styles.fileSize}>
              {formatFileSize(selectedFile.size)}
            </Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={clearSelection}
            >
              <X size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {selectedFile && !isLoading && (
        <TouchableOpacity
          style={[styles.uploadSubmitButton, disabled && styles.uploadSubmitButtonDisabled]}
          onPress={uploadFile}
          disabled={disabled}
        >
          <Text style={styles.uploadSubmitButtonText}>Upload CV</Text>
        </TouchableOpacity>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>
            {isUploading ? 'Uploading and analyzing CV...' : 'Processing...'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    gap: 8,
  },
  uploadButtonDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    textAlign: 'center',
  },
  uploadButtonTextDisabled: {
    color: '#6B7280',
  },
  uploadButtonSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  uploadSubmitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  uploadSubmitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  uploadSubmitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default CVUpload;
