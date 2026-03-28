import { useFocusEffect, useRouter } from 'expo-router';
import { Building2, Calendar } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { listCandidateApplications, type CandidateApplicationItem } from '@/src/services/mPraca/candidate/api/questionnaireApi';

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#E5E7EB';
const MO_BG = '#F9FAFB';

export type AppStatus = 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED';

export interface ApplicationItem {
  id: string;
  jobTitle: string;
  companyName: string;
  sentDate: string;
  status: AppStatus;
}

const getStatusConfig = (status: AppStatus) => {
  switch (status) {
    case 'SENT': return { label: 'Wysłano', bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB' };
    case 'VIEWED': return { label: 'Wyświetlono', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
    case 'ACCEPTED': return { label: 'Kolejny etap', bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
    case 'REJECTED': return { label: 'Odrzucono', bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' };
  }
};

export default function MyApplicationsScreen() {
  const router = useRouter();
  const [apps, setApps] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizeStatus = (status: string): AppStatus => {
    if (status === 'VIEWED' || status === 'ACCEPTED' || status === 'REJECTED') {
      return status;
    }
    return 'SENT';
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) {
      return 'Brak daty';
    }

    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return 'Brak daty';
    }

    return parsed.toLocaleDateString('pl-PL');
  };

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await listCandidateApplications();
      setApps(
        (response.items || []).map((item: CandidateApplicationItem) => ({
          id: item.applicationId,
          jobTitle: item.job?.title || 'Stanowisko nieznane',
          companyName: item.job?.company || 'Firma nieznana',
          sentDate: formatDate(item.createdAt),
          status: normalizeStatus(item.status),
        })),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nie udało się pobrać aplikacji.';
      setErrorMessage(message);
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadApplications();
    }, [loadApplications]),
  );

  const handlePress = (id: string) => {
    router.push({ pathname: '/(tabs)/mPraca/candidate/application-details', params: { applicationId: id } });
  };

  const renderItem = ({ item }: { item: ApplicationItem }) => {
    const config = getStatusConfig(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8}
        onPress={() => handlePress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Aplikacja na ${item.jobTitle} w firmie ${item.companyName}, status: ${config.label}`}
      >
        <View style={styles.cardContent}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</Text>
          
          <View style={styles.infoRow}>
            <Building2 size={14} color={MO_TEXT_SECONDARY} style={styles.icon} />
            <Text style={styles.infoText}>{item.companyName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={14} color={MO_TEXT_SECONDARY} style={styles.icon} />
            <Text style={styles.infoText}>Wysłano: {item.sentDate}</Text>
          </View>
        </View>
        
        <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
          <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={MO_BLUE} />
          <Text style={styles.helperText}>Ładowanie aplikacji...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadApplications}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      ) : apps.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.helperText}>Nie masz jeszcze żadnych aplikacji.</Text>
        </View>
      ) : (
      <FlatList
        data={apps}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_BG },
  
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MO_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MO_BORDER,
    ...Platform.select({
       ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4 },
       android: { elevation: 1 }
    })
  },
  cardContent: { flex: 1, marginRight: 12 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  icon: { marginRight: 6 },
  infoText: { fontSize: 14, color: MO_TEXT_SECONDARY, fontWeight: '500' },
  
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  helperText: {
    marginTop: 12,
    fontSize: 14,
    color: MO_TEXT_SECONDARY,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: MO_BLUE,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: MO_WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
});
