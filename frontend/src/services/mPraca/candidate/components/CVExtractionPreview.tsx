/**
 * CV Extraction Preview Component
 *
 * Displays extracted data from a CV (email, phone, languages, skills).
 * Allows user to review and auto-populate questionnaire fields.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  Languages,
  Zap,
  Trash2,
} from 'lucide-react-native';

interface ExtractedData {
  email?: string | null;
  phone?: string | null;
  languages?: Array<{ jezyk: string; poziom: string }>;
  skills?: string[];
}

interface CVExtractionPreviewProps {
  extractedData: ExtractedData | null;
  extractionStatus?: 'success' | 'failed' | 'pending';
  uploadedAt?: string;
  onDelete?: () => void;
  onAutoFill?: (data: ExtractedData) => void;
  loading?: boolean;
  autoFillApplied?: boolean;
}

const CVExtractionPreview: React.FC<CVExtractionPreviewProps> = ({
  extractedData,
  extractionStatus = 'pending',
  uploadedAt,
  onDelete,
  onAutoFill,
  loading = false,
  autoFillApplied = false,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!extractedData) {
    return null;
  }

  const copyToClipboard = (text: string, label: string) => {
    // Simple clipboard copy - in reality, use react-native-clipboard or similar
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  const handleAutoFill = () => {
    if (!onAutoFill) {
      return;
    }

    if (Platform.OS === 'web') {
      onAutoFill(extractedData);
      return;
    }

    Alert.alert(
      'Auto-fill questionnaire?',
      'This will populate extracted fields in the form.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Auto-fill',
          onPress: () => onAutoFill(extractedData),
        },
      ],
    );
  };

  const handleDelete = () => {
    if (!onDelete) {
      return;
    }

    // RN Web Alert callback handling is inconsistent across browsers,
    // so trigger delete directly there.
    if (Platform.OS === 'web') {
      onDelete();
      return;
    }

    Alert.alert(
      'Delete CV?',
      'You can upload a new CV anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: onDelete, style: 'destructive' },
      ],
    );
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return 'Recently';
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('pl-PL') + ' ' + date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {extractionStatus === 'success' ? (
          <CheckCircle size={20} color="#10B981" />
        ) : extractionStatus === 'failed' ? (
          <AlertCircle size={20} color="#EF4444" />
        ) : (
          <AlertCircle size={20} color="#F59E0B" />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>CV Extracted</Text>
          <Text style={styles.headerSubtitle}>
            {extractionStatus === 'success'
              ? 'Data successfully extracted from your CV'
              : extractionStatus === 'failed'
              ? 'Could not extract all data from CV'
              : 'Analyzing your CV...'}
          </Text>
        </View>
      </View>

      <Text style={styles.uploadedAt}>
        Uploaded {formatDate(uploadedAt)}
      </Text>

      {/* Email */}
      {extractedData.email && (
        <View style={styles.fieldCard}>
          <View style={styles.fieldHeader}>
            <Mail size={18} color="#3B82F6" />
            <Text style={styles.fieldLabel}>Email</Text>
          </View>
          <Text style={styles.fieldValue}>{extractedData.email}</Text>
          <Text style={styles.fieldHint}>
            💡 Tap "Auto-fill" to populate the email field
          </Text>
        </View>
      )}

      {/* Phone */}
      {extractedData.phone && (
        <View style={styles.fieldCard}>
          <View style={styles.fieldHeader}>
            <Phone size={18} color="#3B82F6" />
            <Text style={styles.fieldLabel}>Phone</Text>
          </View>
          <Text style={styles.fieldValue}>{extractedData.phone}</Text>
          <Text style={styles.fieldHint}>
            💡 Tap "Auto-fill" to populate the phone field
          </Text>
        </View>
      )}

      {/* Languages */}
      {extractedData.languages && extractedData.languages.length > 0 && (
        <View style={styles.fieldCard}>
          <View style={styles.fieldHeader}>
            <Languages size={18} color="#3B82F6" />
            <Text style={styles.fieldLabel}>Languages</Text>
          </View>
          <View style={styles.languageList}>
            {extractedData.languages.map((lang, idx) => (
              <View key={idx} style={styles.languageChip}>
                <Text style={styles.languageText}>
                  {lang.jezyk} • {lang.poziom}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.fieldHint}>
            💡 Review languages and their levels. You can modify them in the form.
          </Text>
        </View>
      )}

      {/* Skills */}
      {extractedData.skills && extractedData.skills.length > 0 && (
        <View style={styles.fieldCard}>
          <View style={styles.fieldHeader}>
            <Zap size={18} color="#3B82F6" />
            <Text style={styles.fieldLabel}>Skills</Text>
          </View>
          <View style={styles.skillsList}>
            {extractedData.skills.map((skill, idx) => (
              <View key={idx} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.fieldHint}>
            💡 Detected skills. Add them to experience or preferences in the form if relevant.
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.autoFillButton, (loading || autoFillApplied) && styles.disabledButton]}
          onPress={handleAutoFill}
          disabled={loading || autoFillApplied}
        >
          <Text style={styles.autoFillButtonText}>
            {autoFillApplied ? 'Auto-fill applied' : '✓ Auto-fill Form'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
          disabled={loading}
        >
          <Trash2 size={18} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* No data warning */}
      {!extractedData.email &&
        !extractedData.phone &&
        (!extractedData.languages || extractedData.languages.length === 0) &&
        (!extractedData.skills || extractedData.skills.length === 0) && (
          <View style={styles.warningCard}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.warningText}>
              Could not extract any data from your CV. Please fill the form manually.
            </Text>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#047857',
    marginTop: 4,
  },
  uploadedAt: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  fieldCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    gap: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  fieldValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginLeft: 26,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 26,
  },
  languageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 26,
  },
  languageChip: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  languageText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 26,
  },
  skillChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  autoFillButton: {
    backgroundColor: '#10B981',
  },
  autoFillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    borderColor: '#9CA3AF',
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
});

export default CVExtractionPreview;
