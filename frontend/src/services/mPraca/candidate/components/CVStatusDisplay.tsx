/**
 * CV Status Display Component
 *
 * Shows current CV status (filename, upload date, size) with options to view and delete.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { FileText, Trash2, Eye } from 'lucide-react-native';

interface CVStatusDisplayProps {
  cvData: {
    filename?: string;
    uploaded_at?: string;
    file_id: string;
    extraction_status?: 'success' | 'failed' | 'pending';
  } | null;
  onDelete?: () => Promise<void>;
  onView?: () => void;
  loading?: boolean;
}

const CVStatusDisplay: React.FC<CVStatusDisplayProps> = ({
  cvData,
  onDelete,
  onView,
  loading = false,
}) => {
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);

  if (!cvData) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const openDeleteConfirm = () => {
    if (loading) return;
    setIsConfirmVisible(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmVisible(false);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) {
      setIsConfirmVisible(false);
      return;
    }

    try {
      await onDelete();
    } finally {
      setIsConfirmVisible(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'success':
        return 'Analiza zakończona';
      case 'failed':
        return 'Analiza nie powiodła się';
      case 'pending':
        return 'Analiza w toku...';
      default:
        return 'Niezweryfikowano';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cvCard}>
        <FileText size={40} color="#0052A5" style={styles.icon} />

        <View style={styles.cvInfo}>
          <Text style={styles.filename} numberOfLines={2}>
            {cvData.filename || 'CV.pdf'}
          </Text>
          <Text style={styles.uploadDate}>{formatDate(cvData.uploaded_at)}</Text>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { borderColor: getStatusColor(cvData.extraction_status) },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(cvData.extraction_status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(cvData.extraction_status) },
                ]}
              >
                {getStatusLabel(cvData.extraction_status)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={onView}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#0052A5" />
          ) : (
            <>
              <Eye size={18} color="#0052A5" />
              <Text style={styles.viewButtonText}>Podgląd PDF</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={openDeleteConfirm}
          disabled={loading}
        >
          <Trash2 size={18} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Usuń CV</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Usuń CV</Text>
            <Text style={styles.modalMessage}>
              Na pewno chcesz usunąć wgrane CV? Tej operacji nie można cofnąć.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelDelete}
                disabled={loading}
              >
                <Text style={styles.modalCancelText}>Anuluj</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={handleConfirmDelete}
                disabled={loading}
              >
                <Text style={styles.modalDeleteText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  cvCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    gap: 12,
  },
  icon: {
    marginTop: 2,
  },
  cvInfo: {
    flex: 1,
    gap: 8,
  },
  filename: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  uploadDate: {
    fontSize: 13,
    color: '#64748B',
  },
  statusContainer: {
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewButtonText: {
    color: '#0052A5',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 25,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modalDeleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#DC2626',
  },
  modalDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CVStatusDisplay;
