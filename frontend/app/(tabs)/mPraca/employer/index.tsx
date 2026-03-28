import {useRouter} from 'expo-router';
import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FileText, Users} from 'lucide-react-native';

export default function EmployerDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Panel Pracodawcy</Text>
        <Text style={styles.subtitle}>
          Zarządzaj rekrutacjami w oparciu o prawdziwe dane mObywatel i filtry AI.
        </Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(tabs)/mPraca/employer/create-job-offer')}
            activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <FileText size={32} color="#0052A5" />
            </View>
            <View style={styles.cardTexts}>
              <Text style={styles.cardTitle}>Dodaj ofertę pracy</Text>
              <Text style={styles.cardSubtitle}>Opublikuj stanowisko z autoweryfikacją</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(tabs)/mPraca/employer/offers-list')}
            activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <Users size={32} color="#0052A5" />
            </View>
            <View style={styles.cardTexts}>
              <Text style={styles.cardTitle}>Menedżer Aplikacji</Text>
              <Text style={styles.cardSubtitle}>Przejrzyj spływające CV z wynikiem AI Match</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {padding: 24, paddingTop: 40},
  title: {fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 8},
  subtitle: {fontSize: 16, color: '#4B5563', marginBottom: 32, lineHeight: 24},
  grid: {flexDirection: 'column', gap: 16},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {marginRight: 16},
  cardTexts: {flex: 1},
  cardTitle: {fontSize: 18, fontWeight: '700', color: '#0052A5', marginBottom: 4},
  cardSubtitle: {fontSize: 14, color: '#6B7280', lineHeight: 20},
});
