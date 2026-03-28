import { CandidateApplication } from '@/src/services/mPraca/employer/data/EmployerMockData';
import { fetchJobMatches, JobMatchCandidate } from '@/src/services/api';
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

export default function CandidatesListScreen() {
  const router = useRouter();
  const { jobId, jobTitle, employerId: employerIdParam } = useLocalSearchParams<{ jobId?: string; jobTitle?: string; employerId?: string }>();
  
  const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCandidates = async () => {
      // Jeśli nie przychodzi z navigacji, dajemy fallback dla celów testowych
      const currentJobId = jobId || '69c78725d4ba0965ec1e75fa';
      
      if (!currentJobId) {
        setError('Brak ID ogłoszenia.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("SENDING REQ", currentJobId);
        const matchesResponse = await fetchJobMatches(currentJobId, 50);
        console.log("GOT RES", matchesResponse)

        if (matchesResponse && matchesResponse.matches && matchesResponse.matches.length > 0) {
          const mappedCandidates: CandidateApplication[] = matchesResponse.matches.map((match: JobMatchCandidate) => {
            const candidate = match.candidate;
            const smartMatch = match.smartMatch;
            const application = match.application;

            return {
              id: application?.applicationId || candidate.id || Math.random().toString(),
              candidateId: candidate.id,
              name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Anonimowy Kandydat',
              title: jobTitle || 'Stanowisko',
              summary: candidate.email || 'Brak danych kontaktowych',
              fullCvText: '',
              hasSanepid: false,
              cleanCriminalRecord: true,
              hasDrivingLicense: false,
              prefTypUmowy: [],
              prefWymiarEtatu: [],
              prefBranze: [],
              aiMatchScore: Math.round(smartMatch.final_match_percentage),
              aiMatchFeedback: smartMatch.evaluations?.map(e => `• ${e.description}: ${e.justification}`).join('\n') || '',
              aiMatchSummary: smartMatch.summary || '',
              status: application?.status || 'UNREAD',
            };
          });

          setCandidates(mappedCandidates);
        } else {
          setCandidates([]);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError('Wystąpił błąd podczas pobierania danych o kandydatach.');
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [jobId, jobTitle]);

  const headerTitle = useMemo(() => jobTitle || 'Oferta pracy', [jobTitle]);

  const handleCandidatePress = (id: string, candidateId: string | undefined, currentStatus: string) => {
    const resolvedEmployerId = typeof employerIdParam === 'string' && employerIdParam.trim()
      ? employerIdParam.trim()
      : resolveEmployerIdForApp(true);

    router.push({
      pathname: '/mPraca/employer/candidate-profile',
      params: {
        applicationId: id,
        candidateId: candidateId,
        employerId: resolvedEmployerId,
        applicationStatus: currentStatus,
      }
    });
  };

  const aiMatchList = candidates
    .filter((c) => c.aiMatchScore >= 70)
    .sort((a, b) => b.aiMatchScore - a.aiMatchScore);
    
  const remainingList = candidates
    .filter((c) => c.aiMatchScore < 70)
    .sort((a, b) => b.aiMatchScore - a.aiMatchScore);

  const sections = [
    { title: 'Rekomendacje AI ✨', data: aiMatchList, isPremium: true },
    { title: 'Pozostali kandydaci', data: remainingList, isPremium: false },
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
              <View style={styles.unreadDot} accessibilityLabel="Nowa aplikacja" />
            )}
            <Text style={[styles.nameText, isUnread && styles.nameTextUnread]}>
              {item.name}
            </Text>
          </View>
          <View style={[styles.scoreBox, item.aiMatchScore >= 70 && styles.scoreBoxPremium]}>
            <Text style={[styles.scoreText, item.aiMatchScore >= 70 && styles.scoreTextPremium]}>
              {item.aiMatchScore}% Match
            </Text>
          </View>
        </View>

        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.contactText} numberOfLines={1}>{item.summary}</Text>

        <View style={styles.aiSection}>
          <Text style={styles.aiLabel}>Ocena LLM (Podsumowanie):</Text>
          {item.aiMatchSummary ? (
            <Text style={styles.aiSummaryText}>{item.aiMatchSummary}</Text>
          ) : (
            <Text style={styles.aiSummaryMissing}>Brak oceny LLM</Text>
          )}
        </View>

      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={MO_BLUE} />
        <Text style={styles.loadingText}>Analizowanie kandydatów przez AI...</Text>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {error ? error : 'Brak aplikacji na to stanowisko.'}
            </Text>
          </View>
        }
        renderSectionHeader={({ section: { title, isPremium, data } }) => {
          if (data.length === 0) return null;
          return (
            <View style={[styles.sectionHeader, isPremium && styles.sectionHeaderPremium]}>
              <Text style={[styles.sectionTitle, isPremium && styles.sectionTitlePremium]}>
                {title} ({data.length})
              </Text>
            </View>
          );
        }}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitleLabel}>Menedżer Aplikacji</Text>
            <Text style={styles.pageTitle}>{headerTitle}</Text>
            <Text style={styles.pageSubtitle}>
              Kandydaci ocenieni natychmiastowo przez zintegrowany model językowy w mObywatel.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_BG },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: MO_TEXT_SECONDARY, fontWeight: '500' },
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
  pageSubtitle: { fontSize: 14, color: MO_TEXT_SECONDARY, lineHeight: 22 },

  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeaderPremium: { borderBottomColor: '#FDF2F8' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: MO_TEXT_SECONDARY },
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

  titleText: { fontSize: 14, fontWeight: '500', color: MO_BLUE, marginBottom: 4 },
  contactText: { fontSize: 13, color: MO_TEXT_SECONDARY, marginBottom: 12 },

  aiSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
    marginTop: 8,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 6,
  },
  aiSummaryText: {
    fontSize: 13,
    color: MO_TEXT_PRIMARY,
    lineHeight: 18,
  },
  aiSummaryMissing: {
    fontSize: 13,
    color: '#EF4444',
    fontStyle: 'italic',
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: MO_TEXT_SECONDARY,
    fontSize: 16,
  }
});
