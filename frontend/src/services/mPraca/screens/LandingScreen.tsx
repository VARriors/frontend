import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MPracaStackParamList } from '../navigation/types';
import { Briefcase, Building2 } from 'lucide-react-native';
import { OnboardingState } from '../data/OnboardingState';

type Props = NativeStackScreenProps<MPracaStackParamList, 'LandingPage'>;

export default function LandingScreen({ navigation }: Props) {
  
  const handleCandidatePress = () => {
    // Krok 2: Logika kliknięcia "Dla szukającego pracy"
    // Jeśli użytkownik wypełnił już swoje preferencje zawodowe i wgrał CV
    // omijamy OnboardingStack i ładujemy go BEZPOŚREDNIO do CandidateDashboard
    if (OnboardingState.hasCompletedPreferences) {
      navigation.navigate('CandidateDashboard');
    } else {
      // W przeciwnym razie uderzamy w CandidateFlow (czyli sympozjum weryfikacji CV -> Preferencje)
      navigation.navigate('CandidateFlow');
    }
  };

  const handleEmployerPress = () => {
    navigation.navigate('EmployerDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Wybierz swoją ścieżkę</Text>
          <Text style={styles.subheader}>
            Wybierz, w jaki sposób chcesz korzystać z usług mPraca z uwierzytelnieniem obywatelskim.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.tile, styles.candidateTile]}
          onPress={handleCandidatePress}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Briefcase size={32} color="#0052A5" />
          </View>
          <View style={styles.tileTextContainer}>
            <Text style={styles.tileTitle}>Dla szukającego pracy</Text>
            <Text style={styles.tileDescription}>
              Przeglądaj najnowsze oferty, wgrywaj CV i zarządzaj aplikacjami jednym kliknięciem.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tile}
          onPress={handleEmployerPress}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#F3F4F6' }]}>
            <Building2 size={32} color="#4B5563" />
          </View>
          <View style={styles.tileTextContainer}>
            <Text style={[styles.tileTitle, { color: '#1F2937' }]}>Dla pracodawcy</Text>
            <Text style={styles.tileDescription}>
              Znajdź kandydatów zweryfikowanych państwowo. Zarządzaj ogłoszeniami i procesem rekrutacji.
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Szare bardzo jasne tło
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    flex: 1,
  },
  headerContainer: {
    marginBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  subheader: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  candidateTile: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tileTextContainer: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0052A5',
    marginBottom: 6,
  },
  tileDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
