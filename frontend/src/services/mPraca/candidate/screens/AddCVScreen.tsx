import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MPracaStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MPracaStackParamList, 'AddCV'>;

export default function AddCVScreen({ navigation }: Props) {
  const handleGenerateCV = () => {
    // Po wygenerowaniu CV przechodzimy do Preferencji
    navigation.replace('Preferences');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Aby aplikować na oferty w usłudze mPraca, potrzebujesz dokumentu CV.</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wygeneruj automatycznie</Text>
          <Text style={styles.cardDesc}>
            Możesz pobrać swoje dane z Zakładu Ubezpieczeń Społecznych, CEIDG, Rejestru PESEL oraz uczelni wyższych (POL-on), by utworzyć zweryfikowane CV rządowe.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleGenerateCV}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Wygeneruj na podstawie danych</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator}>
          <Text style={styles.separatorText}>LUB</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Prześlij własny plik</Text>
          <Text style={styles.cardDesc}>
            Wgraj przygotowane wcześniej CV w formacie PDF (maksymalnie do 5 MB).
          </Text>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleGenerateCV}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Wybierz plik z urządzenia</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  content: { 
    paddingHorizontal: 20, 
    paddingTop: 32, 
    paddingBottom: 40 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#1A1A1A', 
    marginBottom: 24, 
    lineHeight: 30 
  },
  card: { 
    backgroundColor: '#F8F9FA', 
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: '#EAECF0' 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1A1A1A', 
    marginBottom: 8 
  },
  cardDesc: { 
    fontSize: 14, 
    color: '#4A5568', 
    lineHeight: 22, 
    marginBottom: 20 
  },
  primaryButton: { 
    backgroundColor: '#0052A5', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  primaryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  secondaryButton: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#CBD5E1', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  secondaryButtonText: { 
    color: '#0052A5', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  separator: { 
    alignItems: 'center', 
    marginVertical: 24 
  },
  separatorText: { 
    color: '#94A3B8', 
    fontWeight: '700' 
  }
});
