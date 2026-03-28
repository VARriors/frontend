import React, { useCallback, useState, useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Briefcase, MapPin, Building2, Banknote, Calendar, ShieldCheck, GraduationCap, Languages, Award, Heart, Clock, Globe } from 'lucide-react-native';
import { JobOffer } from '@/src/services/mPraca/candidate/data/MockData';
import { fetchJob, applyForJob, checkHasApplied } from '@/src/services/api';
import CVRequirementModal from '@/src/services/mPraca/candidate/components/CVRequirementModal';
import { validateJobCVRequirement } from '@/src/services/mPraca/candidate/api/jobRequirementsApi';
import { getCandidateContext } from '@/src/services/mPraca/candidate/api/questionnaireApi';

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#E5E7EB';
const MO_BG = '#F9FAFB';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadJobAndCandidate = async () => {
      if (!id) {
        return;
      }

      setLoading(true);

      try {
        const [jobData, context] = await Promise.all([
          fetchJob(id as string),
          getCandidateContext(),
        ]);

        if (!active) {
          return;
        }

        setJob(jobData);
        setCandidateId(context.candidateId);

        const appliedStatus = await checkHasApplied(id as string, context.candidateId);
        if (!active) {
          return;
        }
        setHasApplied(appliedStatus);
      } catch (error) {
        console.error('Error fetching job data:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadJobAndCandidate();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !candidateId) {
      return;
    }

    let active = true;

    const refreshApplicationStatus = async () => {
      const appliedStatus = await checkHasApplied(id as string, candidateId);
      if (active) {
        setHasApplied(appliedStatus);
      }
    };

    refreshApplicationStatus();

    return () => {
      active = false;
    };
  }, [id, candidateId]);

  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertConfig, setCustomAlertConfig] = useState<{
    title: string;
    message: string;
    type: 'confirm' | 'success' | 'error';
    onConfirm?: () => void;
  }>({ title: '', message: '', type: 'success' });

  const showAlert = (title: string, message: string, type: 'confirm' | 'success' | 'error', onConfirm?: () => void) => {
    setCustomAlertConfig({ title, message, type, onConfirm });
    setCustomAlertVisible(true);
  };

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
      if (!candidateId) {
        showAlert('Brak profilu', 'Nie udało się pobrać danych kandydata. Otwórz kwestionariusz i spróbuj ponownie.', 'error');
        return;
      }

      const executeApplication = async () => {
        setCheckingCvRequirement(true);
        try {
          const validation = await validateJobCVRequirement(job.id, candidateId);

          if (!validation.valid) {
            setCvModalData({
              jobId: job.id,
              jobTitle: job.title,
              requiresCV: validation.requires_cv,
              reason: validation.reason || undefined,
            });
            setCvModalVisible(true);
          } else {
            // Check requirement passed, proceed with real application
            await applyForJob(job.id, candidateId, job.employer_id || job.employerId);

            setHasApplied(true);
            showAlert('Aplikacja Wysłana', `Twoja aplikacja na stanowisko "${job.title}" została wysłana pomyślnie!`, 'success');
          }
        } catch (error: any) {
          console.error('Error applying for job:', error);
          showAlert('Błąd Aplikacji', error?.message || 'Nie udało się wysłać aplikacji. Spróbuj ponownie.', 'error');
        } finally {
          setCheckingCvRequirement(false);
        }
      };

      showAlert(
        'Potwierdzenie Aplikacji',
        `Czy na pewno chcesz wysłać aplikację na stanowisko "${job.title}"?`,
        'confirm',
        executeApplication
      );
    },
    [candidateId],
  );

  const handleUploadCVFromModal = useCallback(() => {
    setCvModalVisible(false);
    if (!job) {
      router.push('/(tabs)/mPraca/candidate/questionnaire');
      return;
    }
    router.push({
      pathname: '/(tabs)/mPraca/candidate/questionnaire',
      params: {
        jobId: job.id,
        employerId: job.employer_id || job.employerId,
      },
    });
  }, [router, job]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={MO_BLUE} />
        <Text style={{ marginTop: 10 }}>Ładowanie oferty...</Text>
      </View>
    );
  }

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
          <Text style={styles.categoryBadge}>{job.category?.toUpperCase() || 'INNE'}</Text>
          <Text style={styles.jobTitle}>{job.title || 'Brak tytułu'}</Text>

          <View style={styles.infoRow}>
            <Building2 size={18} color={MO_TEXT_SECONDARY} />
            <Text style={styles.infoText}>{job.company || 'Brak firmy'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Banknote size={18} color="#047857" />
            <Text style={[styles.infoText, { color: '#047857', fontWeight: '700' }]}>{job.salaryRange || 'Nie podano'}</Text>
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

          {job.responsibilities && job.responsibilities.length > 0 && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Twoje obowiązki</Text>
              {job.responsibilities.map((resp, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.listDot}>•</Text>
                  <Text style={styles.descriptionText}>{resp}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Opis stanowiska</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </View>

          {job.expectations && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Nasze oczekiwania</Text>
              <Text style={styles.descriptionText}>{job.expectations}</Text>
            </View>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>To oferujemy</Text>
              {job.benefits.map((benefit, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Heart size={16} color="#E11D48" style={{ marginRight: 8, marginTop: 4 }} />
                  <Text style={styles.descriptionText}>{benefit}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.detailsList}>
              {job.applicationDeadline && (
                <View style={styles.detailItem}>
                    <Calendar size={18} color={MO_TEXT_SECONDARY} />
                    <View style={styles.detailItemContent}>
                        <Text style={styles.detailLabel}>Termin aplikowania</Text>
                        <Text style={styles.detailValue}>{job.applicationDeadline}</Text>
                    </View>
                </View>
              )}
              <View style={styles.detailItem}>
                  <MapPin size={18} color={MO_TEXT_SECONDARY} />
                  <View style={styles.detailItemContent}>
                      <Text style={styles.detailLabel}>Lokalizacja</Text>
                      <Text style={styles.detailValue}>{job.location || 'Warszawa, Mazowieckie'}</Text>
                  </View>
              </View>
              <View style={styles.detailItem}>
                  <Briefcase size={18} color={MO_TEXT_SECONDARY} />
                  <View style={styles.detailItemContent}>
                      <Text style={styles.detailLabel}>Rodzaj umowy</Text>
                      <Text style={styles.detailValue}>{job.employmentType || 'Umowa o pracę'}</Text>
                  </View>
              </View>
              {job.workTime && (
                <View style={styles.detailItem}>
                    <Clock size={18} color={MO_TEXT_SECONDARY} />
                    <View style={styles.detailItemContent}>
                        <Text style={styles.detailLabel}>Wymiar etatu</Text>
                        <Text style={styles.detailValue}>{job.workTime}</Text>
                    </View>
                </View>
              )}
              {job.workMode && (
                <View style={styles.detailItem}>
                    <Globe size={18} color={MO_TEXT_SECONDARY} />
                    <View style={styles.detailItemContent}>
                        <Text style={styles.detailLabel}>Tryb pracy</Text>
                        <Text style={styles.detailValue}>{job.workMode}</Text>
                    </View>
                </View>
              )}
              {job.positionLevel && (
                <View style={styles.detailItem}>
                    <Award size={18} color={MO_TEXT_SECONDARY} />
                    <View style={styles.detailItemContent}>
                        <Text style={styles.detailLabel}>Poziom stanowiska</Text>
                        <Text style={styles.detailValue}>{job.positionLevel}</Text>
                    </View>
                </View>
              )}
              {job.minEducation && (
                <View style={styles.detailItem}>
                    <GraduationCap size={18} color={MO_TEXT_SECONDARY} />
                    <View style={styles.detailItemContent}>
                        <Text style={styles.detailLabel}>Wykształcenie</Text>
                        <Text style={styles.detailValue}>{job.minEducation}</Text>
                    </View>
                </View>
              )}
              {job.languages && job.languages.length > 0 && (
                <View style={styles.detailItem}>
                    <Languages size={18} color={MO_TEXT_SECONDARY} />
                    <View style={styles.detailItemContent}>
                        <Text style={styles.detailLabel}>Języki</Text>
                        <Text style={styles.detailValue}>{job.languages.join(', ')}</Text>
                    </View>
                </View>
              )}
          </View>

          {job.tags && job.tags.length > 0 && (
            <View style={[styles.badgesSection, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>Tagi:</Text>
              <View style={styles.badgesContainer}>
                {job.tags.map((tag) => (
                  <View key={tag} style={[styles.badge, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}>
                    <Text style={[styles.badgeText, { color: MO_TEXT_SECONDARY }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.applyButton, hasApplied && { backgroundColor: '#9CA3AF' }]}
          onPress={() => handleApplyPress(job)}
          disabled={checkingCvRequirement || hasApplied}
          activeOpacity={0.8}
        >
          {checkingCvRequirement ? (
            <ActivityIndicator color={MO_WHITE} />
          ) : (
            <Text style={styles.applyButtonText}>
              {hasApplied ? 'Aplikacja wysłana' : 'Aplikuj jednym kliknięciem'}
            </Text>
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

      <Modal
        visible={customAlertVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>{customAlertConfig.title}</Text>
            <Text style={styles.alertMessage}>{customAlertConfig.message}</Text>
            <View style={styles.alertButtons}>
              {customAlertConfig.type === 'confirm' && (
                <TouchableOpacity
                  style={[styles.alertButton, styles.alertButtonCancel]}
                  onPress={() => setCustomAlertVisible(false)}
                >
                  <Text style={styles.alertButtonCancelText}>Anuluj</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.alertButton, styles.alertButtonConfirm]}
                onPress={() => {
                  setCustomAlertVisible(false);
                  if (customAlertConfig.onConfirm) {
                    customAlertConfig.onConfirm();
                  }
                }}
              >
                <Text style={styles.alertButtonConfirmText}>
                  {customAlertConfig.type === 'confirm' ? 'Aplikuj' : 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  listDot: { fontSize: 16, color: '#4B5563', marginRight: 8, marginTop: -2 },
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
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: MO_WHITE,
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MO_TEXT_PRIMARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  alertButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  alertButtonCancelText: {
    color: MO_TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  alertButtonConfirm: {
    backgroundColor: MO_BLUE,
  },
  alertButtonConfirmText: {
    color: MO_WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});
