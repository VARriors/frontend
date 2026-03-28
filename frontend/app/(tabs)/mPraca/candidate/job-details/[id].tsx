import React, { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Briefcase, MapPin, Building2, Banknote, Calendar, ShieldCheck } from 'lucide-react-native';
import { mockJobOffers, JobOffer } from '@/src/services/mPraca/candidate/data/MockData';
import CVRequirementModal from '@/src/services/mPraca/candidate/components/CVRequirementModal';
import { validateJobCVRequirement } from '@/src/services/mPraca/candidate/api/jobRequirementsApi';

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#E5E7EB';
const MO_BG = '#F9FAFB';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const job = mockJobOffers.find(j => j.id === id);

  const [checkingCvRequirement, setCheckingCvRequirement] = useState(false);
  const [cvModalVisible, setCvModalVisible] = useState(false);
  const [cvModalData, setCvModalData] = useState<{
    jobId: string;
    jobTitle: string;
    requiresCV: boolean;
    reason?: string;
  } | null>(null);

  const handleApplyPress = useCallback(
    async (job: JobOffer) => {
      const candidateId = 'mock-candidate-123';
      setCheckingCvRequirement(true);

      try {
        const validation = await validateJobCVRequirement(job.id, candidateId);

        if (!validation.valid) {
          setCvModalData({
            jobId: job.id,
            jobTitle: job.title,
            requiresCV: validation.requires_cv,
            reason: validation.reason,
          });
          setCvModalVisible(true);
        } else {
          Alert.alert(
            'Aplikacja Wysłana',
            `Twoja aplikacja na stanowisko "${job.title}" została wysłana pomyślnie!`,
            [{ text: 'OK' }],
          );
        }
      } catch (error) {
        console.error('Error checking CV requirement:', error);
        Alert.alert(
          'Aplikacja Wysłana',
          `Twoja aplikacja na stanowisko "${job.title}" została wysłana pomyślnie!`,
          [{ text: 'OK' }],
        );
      } finally {
        setCheckingCvRequirement(false);
      }
    },
    [],
  );

  const handleUploadCVFromModal = useCallback(() => {
    setCvModalVisible(false);
    router.push('/mPraca/candidate/questionnaire');
  }, [router]);

  if (!job) {
    return (
      <View style={styles.center}>
        <Text>Nie znaleziono oferty.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.categoryBadge}>{job.category.toUpperCase()}</Text>
          <Text style={styles.jobTitle}>{job.title}</Text>

          <View style={styles.infoRow}>
            <Building2 size={18} color={MO_TEXT_SECONDARY} />
            <Text style={styles.infoText}>{job.company}</Text>
          </View>

          <View style={styles.infoRow}>
            <Banknote size={18} color="#047857" />
            <Text style={[styles.infoText, { color: '#047857', fontWeight: '700' }]}>{job.salaryRange}</Text>
          </View>

          {job.requiredBadges && job.requiredBadges.length > 0 && (
            <View style={styles.badgesSection}>
              <Text style={styles.sectionTitle}>Wymagania potwierdzone przez mObywatel:</Text>
              <View style={styles.badgesContainer}>
                {job.requiredBadges.map((badge) => (
                  <View key={badge} style={styles.badge}>
                    <ShieldCheck size={14} color={MO_BLUE} style={{ marginRight: 4 }} />
                    <Text style={styles.badgeText}>
                      {badge === 'sanepid' ? 'Książeczka Sanepid' :
                       badge === 'krk' ? 'Niekaralność (KRK)' :
                       badge === 'driving_license' ? 'Prawo Jazdy B' : badge}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Opis stanowiska</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </View>

          <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                  <Calendar size={18} color={MO_TEXT_SECONDARY} />
                  <View style={styles.detailItemContent}>
                      <Text style={styles.detailLabel}>Termin aplikowania</Text>
                      <Text style={styles.detailValue}>Do 15 kwietnia 2024</Text>
                  </View>
              </View>
              <View style={styles.detailItem}>
                  <MapPin size={18} color={MO_TEXT_SECONDARY} />
                  <View style={styles.detailItemContent}>
                      <Text style={styles.detailLabel}>Lokalizacja</Text>
                      <Text style={styles.detailValue}>Warszawa, Mazowieckie</Text>
                  </View>
              </View>
              <View style={styles.detailItem}>
                  <Briefcase size={18} color={MO_TEXT_SECONDARY} />
                  <View style={styles.detailItemContent}>
                      <Text style={styles.detailLabel}>Rodzaj umowy</Text>
                      <Text style={styles.detailValue}>Umowa o pracę</Text>
                  </View>
              </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleApplyPress(job)}
          disabled={checkingCvRequirement}
          activeOpacity={0.8}
        >
          {checkingCvRequirement ? (
            <ActivityIndicator color={MO_WHITE} />
          ) : (
            <Text style={styles.applyButtonText}>Aplikuj jednym kliknięciem</Text>
          )}
        </TouchableOpacity>
      </View>

      <CVRequirementModal
        visible={cvModalVisible}
        jobTitle={cvModalData?.jobTitle || ''}
        reason={cvModalData?.reason}
        onUploadCV={handleUploadCVFromModal}
        onCancel={() => {
          setCvModalVisible(false);
          setCvModalData(null);
        }}
        loading={checkingCvRequirement}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_BG },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: MO_WHITE,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: MO_BORDER,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  categoryBadge: { fontSize: 12, fontWeight: '700', color: MO_BLUE, letterSpacing: 0.5, marginBottom: 12 },
  jobTitle: { fontSize: 24, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 16, color: MO_TEXT_PRIMARY, marginLeft: 10, fontWeight: '500' },
  badgesSection: { marginTop: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 12 },
  badgesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  badgeText: { fontSize: 13, color: MO_BLUE, fontWeight: '600' },
  divider: { height: 1, backgroundColor: MO_BORDER, marginVertical: 20 },
  descriptionSection: { marginBottom: 24 },
  descriptionText: { fontSize: 16, color: '#4B5563', lineHeight: 24 },
  detailsList: { gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start' },
  detailItemContent: { marginLeft: 12 },
  detailLabel: { fontSize: 12, color: MO_TEXT_SECONDARY, marginBottom: 2 },
  detailValue: { fontSize: 15, color: MO_TEXT_PRIMARY, fontWeight: '600' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: MO_WHITE,
    borderTopWidth: 1,
    borderTopColor: MO_BORDER,
  },
  applyButton: { backgroundColor: MO_BLUE, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  applyButtonText: { color: MO_WHITE, fontSize: 17, fontWeight: '700' },
});
