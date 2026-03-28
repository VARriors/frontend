/**
 * CV PDF Viewer Component
 *
 * Displays CV PDF with options to open in default viewer or download.
 * Uses expo-web-browser for reliable cross-platform PDF viewing.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { FileText, X } from 'lucide-react-native';
import { API_BASE_URL } from '@/src/services/api';

interface CVPDFViewerProps {
  visible: boolean;
  fileId: string;
  filename?: string;
  candidateId: string;
  onClose: () => void;
}

const CVPDFViewer: React.FC<CVPDFViewerProps> = ({
  visible,
  fileId,
  filename,
  candidateId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const getPdfUrl = () => {
    const normalizedBase = API_BASE_URL.endsWith('/api')
      ? API_BASE_URL.slice(0, -4)
      : API_BASE_URL;
    return `${normalizedBase}/api/candidates/questionnaire/${candidateId}/cv-file/${fileId}`;
  };

  const handleOpenPDF = async () => {
    setLoading(true);
    try {
      const pdfUrl = getPdfUrl();
      const result = await WebBrowser.openBrowserAsync(pdfUrl);

      if (result.type === 'dismiss') {
        // User closed the browser
      }
    } catch (error) {
      Alert.alert(
        'Błąd',
        'Nie udało się otworzyć PDF. Spróbuj ponownie.',
      );
      console.error('Error opening PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Overlay */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal content */}
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <FileText size={32} color="#0052A5" />
            <Text style={styles.title} numberOfLines={2}>
              {filename || 'CV.pdf'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.description}>
              Przycisk poniżej otworzy PDF w domyślnej przeglądarce Twojego urządzenia.
            </Text>

            <TouchableOpacity
              style={styles.openButton}
              onPress={handleOpenPDF}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.openButtonText}>Otwórz PDF</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Zamknij</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 12,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: -8,
    top: -8,
    padding: 8,
  },
  body: {
    width: '100%',
    gap: 16,
  },
  description: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
  },
  openButton: {
    backgroundColor: '#0052A5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CVPDFViewer;
