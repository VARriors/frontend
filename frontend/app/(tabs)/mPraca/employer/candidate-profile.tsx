import { CandidateApplication, mockCandidates } from '@/src/services/mPraca/employer/data/EmployerMockData';
import React, { useState } from 'react';
import { Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MO_GREEN = '#10B981'; // Green for Accept
const MO_RED = '#EF4444'; // Red for Reject
const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#4B5563';
const MO_BORDER = '#D1D5DB';
const MO_BG = '#F9FAFB';

export default function CandidateProfileScreen() {
  // W prawdziwej aplikacji ID pobieralibyśmy z parametrów nawigacji (route.params.candidateId)
  const [candidate] = useState<CandidateApplication>(mockCandidates[0]); 
  const [isCvModalVisible, setCvModalVisible] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!candidateId) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchCandidateProfile(candidateId);
        if (data) {
          const questionnaire = data.questionnaire || {};
          const fields = questionnaire.fields || {};

          setCandidate({
            id: candidateId,
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Anonimowy Kandydat',
            title: 'Kandydat',
            summary: `Email: ${data.email || 'Brak'}`,
            fullCvText: data.cv_content || 'Brak przesłanego CV.',
            hasSanepid: fields.sanepid?.value === true || fields.sanepid?.value === 'true',
            cleanCriminalRecord: fields.niekaralnosc?.value === true || fields.niekaralnosc?.value === 'true',
            hasDrivingLicense: fields.prawo_jazdy?.value === true || fields.prawo_jazdy?.value === 'true',
            prefTypUmowy: fields.pref_typ_umowy?.value || [],
            prefWymiarEtatu: fields.pref_wymiar_etatu?.value || [],
            prefBranze: fields.preferencje?.value || [],
            aiMatchScore: 85,
            status: 'VIEWED',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [candidateId]);

  // Funkcje do globalnego zarządzania stanem
  const handleAccept = () => {
    /* 
      TODO: Zaktualizuj globalny stan aplikacyjny, np. Redux / Zustand:
      dispatch(updateApplicationStatus({ id: candidate.id, status: 'ACCEPTED' }));
      AI powiadomi użytkownika: "Firma X rozpatrzyła Twoją aplikację pozytywnie!"
    */
    console.log(`ZAAKCEPTOWANO Kandydata: ${candidate.id}`);
    // navigation.goBack();
  };

  const handleReject = () => {
    /*
      TODO: Odrzucenie w tle.
      dispatch(updateApplicationStatus({ id: candidate.id, status: 'REJECTED' }));
      Zgodnie z UX pracodawca nie musi pisać ręcznie wiadomości - mPraca zamyka aplikację.
    */
    console.log(`ODRZUCONO Kandydata: ${candidate.id}`);
    // navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.name}>{candidate.name}</Text>
          <Text style={styles.title}>{candidate.title}</Text>
          
          <View style={styles.matchScore}>
            <Text style={styles.matchScoreText}>AI Weryfikacja: {candidate.aiMatchScore}% Zgodności</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Podsumowanie</Text>
          <Text style={styles.summaryText}>{candidate.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencje zawodowe</Text>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={styles.subSectionTitle}>Branże:</Text>
              <View style={styles.chipsRow}>
                {candidate.prefBranze.map(b => (
                  <View key={b} style={styles.prefChip}>
                    <Text style={styles.prefChipText}>{b}</Text>
                  </View>
                ))}
                {candidate.prefBranze.length === 0 && <Text style={styles.noDataText}>Nie określono</Text>}
              </View>
            </View>

            <View>
              <Text style={styles.subSectionTitle}>Rodzaj umowy:</Text>
              <View style={styles.chipsRow}>
                {candidate.prefTypUmowy.map(t => (
                  <View key={t} style={styles.prefChip}>
                    <Text style={styles.prefChipText}>{t}</Text>
                  </View>
                ))}
                {candidate.prefTypUmowy.length === 0 && <Text style={styles.noDataText}>Nie określono</Text>}
              </View>
            </View>

            <View>
              <Text style={styles.subSectionTitle}>Wymiar etatu:</Text>
              <View style={styles.chipsRow}>
                {candidate.prefWymiarEtatu.map(w => (
                  <View key={w} style={styles.prefChip}>
                    <Text style={styles.prefChipText}>{w}</Text>
                  </View>
                ))}
                {candidate.prefWymiarEtatu.length === 0 && <Text style={styles.noDataText}>Nie określono</Text>}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Państwowe Uprawnienia (Certyfikaty mObywatel)</Text>
          <View style={styles.badgesWrapper}>
            {candidate.cleanCriminalRecord && (
              <View style={[styles.badge, styles.badgeVerified]}>
                <Text style={styles.badgeTextVerified}>✓ Brak Wpisów w KRK</Text>
              </View>
            )}
            {candidate.hasSanepid && (
              <View style={[styles.badge, styles.badgeVerified]}>
                <Text style={styles.badgeTextVerified}>✓ Zaświadczenie Sanepid</Text>
              </View>
            )}
            {candidate.hasDrivingLicense && (
              <View style={[styles.badge, styles.badgeVerified]}>
                <Text style={styles.badgeTextVerified}>✓ Prawo Jazdy Kat. B</Text>
              </View>
            )}
            {!candidate.cleanCriminalRecord && !candidate.hasSanepid && !candidate.hasDrivingLicense && (
              <Text style={styles.noBadgesText}>Brak dodanych uprawnień</Text>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.fullCvButton}
          onPress={() => setCvModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fullCvButtonText}>Pokaż pełne CV 📄</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* BOTTOM ACTION BAR - PANEL DECYZYJNY */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={handleReject}
          activeOpacity={0.8}
        >
          <Text style={styles.rejectButtonText}>Odrzuć</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]} 
          onPress={handleAccept}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptButtonText}>Kolejny Etap ✓</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL Z PEŁNYM CV */}
      <Modal visible={isCvModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setCvModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pełne CV: {candidate.name}</Text>
            <TouchableOpacity onPress={() => setCvModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Zamknij</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.cvText}>{candidate.fullCvText}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_BG },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  header: { marginBottom: 32, alignItems: 'center' },
  name: { fontSize: 28, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 4 },
  title: { fontSize: 18, color: MO_BLUE, fontWeight: '600', marginBottom: 12 },
  matchScore: { backgroundColor: '#FDF2F8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#FBCFE8' },
  matchScoreText: { color: '#BE185D', fontWeight: '700', fontSize: 13 },
  
  section: { backgroundColor: MO_WHITE, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: MO_BORDER, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 1 } }) },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  subSectionTitle: { fontSize: 14, fontWeight: '600', color: MO_TEXT_SECONDARY, marginBottom: 8 },
  summaryText: { fontSize: 15, color: MO_TEXT_SECONDARY, lineHeight: 24 },
  noDataText: { fontSize: 13, color: MO_TEXT_SECONDARY, fontStyle: 'italic' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prefChip: { backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#DBEAFE' },
  prefChipText: { color: MO_BLUE, fontSize: 13, fontWeight: '500' },

  badgesWrapper: { flexDirection: 'column', gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  badgeVerified: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  badgeTextVerified: { color: '#047857', fontWeight: '600', fontSize: 15 },
  noBadgesText: { fontSize: 14, color: MO_TEXT_SECONDARY, fontStyle: 'italic' },
  
  fullCvButton: { backgroundColor: MO_WHITE, borderWidth: 1, borderColor: MO_BLUE, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  fullCvButtonText: { color: MO_BLUE, fontSize: 16, fontWeight: '700' },
  
  bottomBar: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: MO_WHITE, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 12 },
  actionButton: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rejectButton: { backgroundColor: MO_WHITE, borderWidth: 1, borderColor: MO_RED },
  rejectButtonText: { color: MO_RED, fontSize: 16, fontWeight: '700' },
  acceptButton: { backgroundColor: MO_GREEN, shadowColor: MO_GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  acceptButtonText: { color: MO_WHITE, fontSize: 16, fontWeight: '700' },
  
  modalContainer: { flex: 1, backgroundColor: MO_WHITE },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: MO_BORDER },
  modalTitle: { fontSize: 18, fontWeight: '700', color: MO_TEXT_PRIMARY },
  closeButton: { padding: 4 },
  closeButtonText: { fontSize: 16, color: MO_BLUE, fontWeight: '600' },
  modalScroll: { padding: 24, paddingBottom: 60 },
  cvText: { fontSize: 16, color: MO_TEXT_PRIMARY, lineHeight: 26 }
});
