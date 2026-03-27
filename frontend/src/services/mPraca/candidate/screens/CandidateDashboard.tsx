import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MPracaStackParamList } from '../../navigation/types';

const TILE_DATA = [
  { id: 'search', title: 'Szukaj', desc: 'Przeglądaj wszystkie oferty i filtruj', icon: '🔍', color: '#EEF2FF' },
  { id: 'preferences', title: 'Preferencje', desc: 'Edytuj swoje branże i kryteria', icon: '⚙️', color: '#FFFBEB' },
  { id: 'match', title: 'Dopasuj', desc: 'Odkryj rekomendacje z systemem kart', icon: '✨', color: '#FFF1F2' },
  { id: 'applications', title: 'Moje Aplikacje', desc: 'Śledź statusy: 3 w toku, 1 odrzucona', icon: '📁', color: '#F0FDF4' },
];

export default function CandidateDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<MPracaStackParamList>>();

  const handleTilePress = (id: string) => {
    if (id === 'search') {
      navigation.navigate('JobSearch');
    } else if (id === 'preferences') {
      navigation.navigate('Preferences');
    } else if (id === 'applications') {
      navigation.navigate('MyApplications');
    } else if (id === 'match') {
      navigation.navigate('JobOffers');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Witaj, Janie!</Text>
          <Text style={styles.subtitle}>Znajdź pracę idealnie pasującą do Ciebie w bezpiecznym środowisku, dzięki mObywatel.</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsBox}>
            <Text style={styles.statsNumber}>12</Text>
            <Text style={styles.statsLabel}>Nowych ofert z Twojej branży we Wrocławiu</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {TILE_DATA.map((tile) => (
            <TouchableOpacity 
              key={tile.id} 
              style={[styles.tile, { backgroundColor: tile.color }]} 
              activeOpacity={0.8}
              onPress={() => handleTilePress(tile.id)}
            >
              <View style={styles.tileHeader}>
                <Text style={styles.icon}>{tile.icon}</Text>
              </View>
              <Text style={styles.tileTitle}>{tile.title}</Text>
              <Text style={styles.tileDesc}>{tile.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
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
    paddingBottom: 48,
  },
  header: {
    marginBottom: 24,
  },
  welcome: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0052A5',
    marginRight: 16,
  },
  statsLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16, // Dla nowszych wersji React Native / Yoga
  },
  tile: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16, // Fallback dla starszych RN bez wsparcia dla gap
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  tileHeader: {
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  tileDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});
