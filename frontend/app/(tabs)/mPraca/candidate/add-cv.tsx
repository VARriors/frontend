import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CVUpload from '@/src/services/mPraca/candidate/components/CVUpload';
import CVStatusDisplay from '@/src/services/mPraca/candidate/components/CVStatusDisplay';
import CVPDFViewer from '@/src/services/mPraca/candidate/components/CVPDFViewer';
import {
  uploadCV,
  getCV,
  deleteCV,
  getConfiguredCandidateId,
} from '@/src/services/mPraca/candidate/api/questionnaireApi';


interface CVData {
  file_id: string;
  filename?: string;
  uploaded_at?: string;
  extraction_status?: 'success' | 'failed' | 'pending';
  extracted_data?: {
    email?: string | null;
    phone?: string | null;
    languages?: { jezyk: string; poziom: string }[];
    skills?: string[];
  };
}

export default function AddCVScreen() {
  const [candidateId, setCandidateId] = useState<string>('');
  const [currentCV, setCurrentCV] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  // Get candidateId on mount
  useEffect(() => {
    try {
      const id = getConfiguredCandidateId();
      setCandidateId(id);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Failed to get candidate ID';
      setFetchError(msg);
      console.error('Error getting candidateId:', error);
    }
  }, []);

  // Load CV metadata when screen is focused or after upload/delete
  useFocusEffect(
    useCallback(() => {
      loadCVMetadata();
    }, [candidateId])
  );

  const loadCVMetadata = async () => {
    if (!candidateId) return;

    try {
      setIsLoading(true);
      setFetchError(null);

      const response = await getCV(candidateId);
      if (response?.cv) {
        setCurrentCV(response.cv);
      } else {
        setCurrentCV(null);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Failed to load CV metadata';
      setFetchError(msg);
      console.error('Error loading CV metadata:', error);
      setCurrentCV(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadCV = async (fileData: {
    name: string;
    size: number;
    uri: string;
    type: string;
    file?: File;
  }) => {
    if (!candidateId) {
      Alert.alert('Błąd', 'Nie udało się określić ID kandydata');
      return;
    }

    try {
      setIsUploading(true);
      setFetchError(null);

      const result = await uploadCV(candidateId, fileData);

      setCurrentCV({
        file_id: result.file_id,
        filename: fileData.name,
        uploaded_at: new Date().toISOString(),
        extraction_status: result.extraction_status,
        extracted_data: result.extracted_data || undefined,
      });

      Alert.alert('Sukces', 'CV zostało wgrane pomyślnie.');
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Wgranie CV nie powiodło się';
      setFetchError(msg);
      Alert.alert('Błąd', msg);
      console.error('Error uploading CV:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCV = async () => {
    if (!candidateId || !currentCV) return;

    try {
      setIsDeleting(true);
      setFetchError(null);

      await deleteCV(candidateId);
      setCurrentCV(null);

      Alert.alert('Sukces', 'CV zostało usunięte.');
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Usunięcie CV nie powiodło się';
      setFetchError(msg);
      Alert.alert('Błąd', msg);
      console.error('Error deleting CV:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewPDF = () => {
    if (currentCV?.file_id) {
      setViewerVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          Aby aplikować na oferty w usłudze mPraca, potrzebujesz dokumentu CV.
        </Text>

        <View style={styles.section}>
          {isLoading && candidateId ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0052A5" />
              <Text style={styles.loadingText}>Ładowanie CV...</Text>
            </View>
          ) : fetchError && !currentCV ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Błąd: {fetchError}
              </Text>
              <Text style={styles.errorSubtext}>
                Spróbuj odświeżyć stronę lub wróć do menu głównego.
              </Text>
            </View>
          ) : currentCV ? (
            <>
              <Text style={styles.sectionTitle}>Wgrane CV</Text>
              <CVStatusDisplay
                cvData={currentCV}
                onDelete={handleDeleteCV}
                onView={handleViewPDF}
                loading={isDeleting}
              />

              <Text style={styles.replaceCVText}>
                Aby zastąpić wgrane CV, wgraj nowy plik poniżej.
              </Text>
            </>
          ) : (
            <View style={styles.noCvContainer}>
              <Text style={styles.noCvTitle}>Nie masz jeszcze dodanego CV</Text>
              <Text style={styles.noCvText}>
                Wgraj swoje CV poniżej, aby móc aplikować na oferty
                w usłudze mPraca.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {currentCV ? 'Zastąp CV' : 'Wgraj CV'}
          </Text>
          <Text style={styles.sectionDesc}>
            Wgraj swoje CV w formacie PDF (maksymalnie do 5 MB). System
            automatycznie przetworzy dokument i wyodrębni dane takie jak
            adres e-mail, numer telefonu, umiejętności i języki.
          </Text>

          <CVUpload
            onUpload={handleUploadCV}
            loading={isUploading}
            disabled={isUploading}
          />
        </View>
      </ScrollView>

      <CVPDFViewer
        visible={viewerVisible}
        fileId={currentCV?.file_id || ''}
        filename={currentCV?.filename || 'CV.pdf'}
        candidateId={candidateId}
        onClose={() => setViewerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
    lineHeight: 28,
  },
  section: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
  },
  replaceCVText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  noCvContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  noCvTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  noCvText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
