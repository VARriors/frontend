import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MPracaStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MPracaStackParamList, 'LandingPage'>;

export default function LandingScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Wybierz swoją ścieżkę</Text>
        <Text style={styles.subheader}>
          Usługa mPraca ułatwia dostęp do rynku pracy, uwierzytelnia Twoje dane dzięki mObywatel i pomaga zdobyć nowe zatrudnienie.
        </Text>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('CandidateFlow')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Dla osób szukających pracy</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('EmployerDashboard')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Dla pracodawców</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subheader: {
    fontSize: 16,
    color: '#4B5563', // WCAG compliant gray
    lineHeight: 24,
    marginBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#0052A5', // Rządowy niebieski z aplikacji
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0052A5',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6', // Czyste, jasne tło
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});
