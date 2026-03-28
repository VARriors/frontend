import { fetchEmployerOffersWithApplications } from '@/src/services/api';
import { getStoredEmployerCompany, resolveEmployerIdForApp } from '@/src/services/mPraca/employer/data/EmployerSession';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#111827';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#E5E7EB';
const MO_BG = '#F9FAFB';

type EmployerJobOffer = {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  applicationsCount: number;
};

const COMPANY_NAME = 'VARriors';

export default function EmployerOffersListScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<EmployerJobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('Twoja firma');

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);

      const employerId = resolveEmployerIdForApp(true);
      const payload = await fetchEmployerOffersWithApplications(employerId, true);

      const storedCompanyName = getStoredEmployerCompany();
      if (storedCompanyName) {
        setCompanyName(storedCompanyName);
      }

      const items: EmployerJobOffer[] = (payload.items || []).map((item) => ({
        id: item.id,
        title: item.title,
        company: item.company || storedCompanyName || 'Twoja firma',
        location: item.location,
        description: undefined,
        applicationsCount: item.applicationsCount || 0,
      }));

      if (!storedCompanyName && items.length > 0 && items[0].company) {
        setCompanyName(items[0].company);
      }

      setOffers(items);
    } catch (e) {
      console.error('Failed to load employer offers', e);
      setError('Nie udało się pobrać ofert. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const openCandidatesForOffer = (offer: EmployerJobOffer) => {
    console.log('Opening candidates for offer:', offer);
    const employerId = resolveEmployerIdForApp(true);
    console.log('Employer ID:', employerId);
    router.push({
      pathname: '/(tabs)/mPraca/employer/candidates-list',
      params: { jobId: offer.id, jobTitle: offer.title, employerId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitleLabel}>Menedżer Aplikacji</Text>
          <Text style={styles.pageTitle}>Nasze oferty pracy</Text>
          <Text style={styles.pageSubtitle}>
            Poniżej widzisz wszystkie ogłoszenia opublikowane dla firmy {companyName}.
          </Text>
        </View>

        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator color={MO_BLUE} size="large" />
            <Text style={styles.loadingText}>Ładuję oferty…</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadOffers}>
              <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && offers.length === 0 && (
          <View style={styles.centerBox}>
            <Text style={styles.emptyTitle}>Brak opublikowanych ofert</Text>
            <Text style={styles.emptySubtitle}>
              Dodaj pierwszą ofertę z poziomu panelu pracodawcy, aby zobaczyć ją tutaj.
            </Text>
          </View>
        )}

        {!loading && !error && offers.map((offer) => (
          <TouchableOpacity
            key={offer.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => openCandidatesForOffer(offer)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerCompany}>{offer.company}</Text>
            </View>
            {offer.location ? (
              <Text style={styles.offerMeta}>{offer.location}</Text>
            ) : null}
            <Text style={styles.applicationsCount}>
              Aplikacje: {offer.applicationsCount}
            </Text>
            {offer.description ? (
              <Text style={styles.offerDescription} numberOfLines={2}>
                {offer.description}
              </Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_BG },
  listContent: { padding: 16, paddingBottom: 60 },
  pageHeader: { marginBottom: 24, marginTop: 8 },
  pageTitleLabel: { fontSize: 13, fontWeight: '700', color: MO_BLUE, textTransform: 'uppercase', marginBottom: 4 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: MO_TEXT_SECONDARY, lineHeight: 22 },

  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 14, color: MO_TEXT_SECONDARY },
  errorText: { fontSize: 14, color: '#DC2626', textAlign: 'center', marginBottom: 12 },
  retryButton: {
    backgroundColor: MO_BLUE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryButtonText: { color: MO_WHITE, fontSize: 14, fontWeight: '600' },

  emptyTitle: { fontSize: 18, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 4, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: MO_TEXT_SECONDARY, textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: MO_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MO_BORDER,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: { marginBottom: 8 },
  offerTitle: { fontSize: 16, fontWeight: '700', color: MO_TEXT_PRIMARY },
  offerCompany: { fontSize: 13, fontWeight: '600', color: MO_BLUE, marginTop: 2 },
  offerMeta: { fontSize: 13, color: MO_TEXT_SECONDARY, marginBottom: 4 },
  applicationsCount: { fontSize: 13, color: MO_BLUE, fontWeight: '700', marginBottom: 6 },
  offerDescription: { fontSize: 14, color: MO_TEXT_SECONDARY, lineHeight: 20 },
});
