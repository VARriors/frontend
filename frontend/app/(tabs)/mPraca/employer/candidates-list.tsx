import { CandidateApplication } from '@/src/services/mPraca/employer/data/EmployerMockData';
import { fetchJobApplicants } from '@/src/services/api';
import { resolveEmployerIdForApp } from '@/src/services/mPraca/employer/data/EmployerSession';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import { Platform, SafeAreaView, SectionList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#111827';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#E5E7EB';
const MO_BG = '#F9FAFB';

// Odznaki
const BADGES: Record<string, string> = {
  sanepid: 'Sanepid',
  krk: 'Niekaralność (KRK)',
  driving: 'Prawo Jazdy',
};

const renderBadges = (item: CandidateApplication) => {
  const activeBadges = [];
  if (item.hasSanepid) activeBadges.push('sanepid');
  if (item.cleanCriminalRecord) activeBadges.push('krk');
  if (item.hasDrivingLicense) activeBadges.push('driving');

  if (activeBadges.length === 0) return null;

  return (
    <View style={styles.badgesWrapper}>
      {activeBadges.map((b) => (
        <View key={b} style={styles.badge}>
          <Text style={styles.badgeText}>✓ {BADGES[b]}</Text>
        </View>
      ))}
    </View>
  );
};

export default function CandidatesListScreen() {
  const router = useRouter();
  const { jobId, jobTitle, employerId: employerIdParam } = useLocalSearchParams<{ jobId?: string; jobTitle?: string; employerId?: string }>();
  const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplicants = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }
      try {
        const employerId = typeof employerIdParam === 'string' && employerIdParam.trim()
          ? employerIdParam.trim()
          : resolveEmployerIdForApp(true);
        const data = await fetchJobApplicants(employerId, jobId);

        const mappedCandidates: CandidateApplication[] = data.items.map((item: any) => ({
          id: item.applicationId,
          candidateId: item.candidateId,
          name: `${item.candidate.firstName || ''} ${item.candidate.lastName || ''}`.trim() || 'Anonimowy Kandydat',
          title: jobTitle || 'Kandydat',
          summary: item.candidate.email || 'Brak danych kontaktowych',
          fullCvText: '',
          hasSanepid: false,
          cleanCriminalRecord: true,
          hasDrivingLicense: false,
          aiMatchScore: Math.floor(Math.random() * 40) + 60, // Mocked score for now
          status: item.status,
        }));

        setCandidates(mappedCandidates);
      } catch (error) {
        console.error('Error loading applicants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplicants();
  }, [jobId, jobTitle, employerIdParam]);

  const headerTitle = useMemo(
    () => jobTitle || 'Oferta pracy',
    [jobTitle]
  );

  const handleCandidatePress = (id: string, candidateId: string | undefined, currentStatus: string) => {
    // Navigate to profile
    router.push({
      pathname: '/mPraca/employer/candidate-profile',
      params: {
        applicationId: id,
        candidateId: candidateId
      }
    });
  };

  const aiMatchList = candidates
    .filter((c) => c.aiMatchScore >= 80)
    .sort((a, b) => b.aiMatchScore - a.aiMatchScore);
  const remainingList = candidates
    .filter((c) => c.aiMatchScore < 80)
    .sort((a, b) => b.aiMatchScore - a.aiMatchScore);

  const sections = [
    { title: 'Rekomendacje AI ✨', data: aiMatchList, isPremium: true },
    { title: 'Wszyscy kandydaci', data: remainingList, isPremium: false },
  ];

  const renderItem = ({ item }: { item: CandidateApplication }) => {
    const isUnread = item.status === 'UNREAD';

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.cardUnread]}
        activeOpacity={0.8}
        onPress={() => handleCandidatePress(item.id, (item as any).candidateId, item.status)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            {isUnread && (
              <View
                style={styles.unreadDot}
                accessibilityLabel="Nowa aplikacja"
              />
            )}
            <Text
              style={[styles.nameText, isUnread && styles.nameTextUnread]}
            >
              {item.name}
            </Text>
          </View>
          <View
            style={[
              styles.scoreBox,
              item.aiMatchScore >= 80 && styles.scoreBoxPremium,
            ]}
          >
            <Text
              style={[
                styles.scoreText,
                item.aiMatchScore >= 80 && styles.scoreTextPremium,
              ]}
            >
              {item.aiMatchScore}% Match
            </Text>
          </View>
        </View>

        <Text style={styles.titleText}>{item.title}</Text>

        <Text style={styles.summaryText} numberOfLines={2}>
          {item.summary}
        </Text>

        {renderBadges(item)}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={MO_BLUE} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title, isPremium, data } }) => {
          if (data.length === 0) return null;
          return (
            <View
              style={[
                styles.sectionHeader,
                isPremium && styles.sectionHeaderPremium,
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  isPremium && styles.sectionTitlePremium,
                ]}
              >
                {title}
              </Text>
            </View>
          );
        }}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitleLabel}>Aplikacje na stanowisko:</Text>
            <Text style={styles.pageTitle}>{headerTitle}</Text>
            <Text style={styles.pageSubtitle}>
              Przeskanowane przez system mObywatel. Kandydaci zweryfikowani
              państwowo.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_BG },
  listContent: { padding: 16, paddingBottom: 60 },
  pageHeader: { marginBottom: 24, marginTop: 8 },
  pageTitleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: MO_BLUE,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MO_TEXT_PRIMARY,
    marginBottom: 8,
  },
  pageSubtitle: { fontSize: 15, color: MO_TEXT_SECONDARY, lineHeight: 22 },

  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeaderPremium: { borderBottomColor: '#FBCFE8' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: MO_TEXT_SECONDARY },
  sectionTitlePremium: { color: '#BE185D' },

  card: {
    backgroundColor: MO_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MO_BORDER,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  cardUnread: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0284C7',
    marginRight: 8,
    marginTop: 2,
  },
  nameText: { fontSize: 18, fontWeight: '600', color: MO_TEXT_PRIMARY },
  nameTextUnread: { fontWeight: '800' },

  scoreBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBoxPremium: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  scoreText: { fontSize: 12, fontWeight: '700', color: MO_TEXT_SECONDARY },
  scoreTextPremium: { color: '#BE185D' },

  titleText: { fontSize: 14, fontWeight: '500', color: MO_BLUE, marginBottom: 10 },
  summaryText: { fontSize: 14, color: MO_TEXT_SECONDARY, lineHeight: 20, marginBottom: 12 },

  badgesWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  badgeText: { color: '#047857', fontSize: 11, fontWeight: '600' },
});
