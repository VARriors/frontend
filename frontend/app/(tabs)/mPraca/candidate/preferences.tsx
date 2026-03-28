import { setPreferencesCompleted } from '@/src/services/mPraca/data/OnboardingState';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BRANZE, TYPY_UMOWY, WYMIAR_ETATU } from '@/src/services/mPraca/candidate/data/questionnaireSchema';

// Kolory zgodne z design systemem mObywatel
const MO_BLUE = '#0052A5';
const MO_LIGHT_BLUE = '#E6F0FA';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#D1D5DB';


export default function PreferencesScreen() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedContractType, setSelectedContractType] = useState<string>('');
  const [selectedWorkTime, setSelectedWorkTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Dla potrzeb hackathonu używamy stałego ID kandydata (Jan Kowalski)
  const candidateId = "65f1a2b3c4d5e6f7a8b9c0d1";

  useEffect(() => {
    const fetchCurrentPreferences = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/candidates/questionnaire/${candidateId}`);
        if (response.ok) {
          const data = await response.json();
          const currentPrefs = data.questionnaire?.fields?.preferencje?.value || [];
          const currentContractType = data.questionnaire?.fields?.pref_typ_umowy?.value || '';
          const currentWorkTime = data.questionnaire?.fields?.pref_wymiar_etatu?.value || '';

          setSelectedCategories(Array.isArray(currentPrefs) ? currentPrefs : [currentPrefs]);
          setSelectedContractType(currentContractType);
          setSelectedWorkTime(currentWorkTime);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania aktualnych preferencji:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCurrentPreferences();
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/candidates/questionnaire/${candidateId}/user-input`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            preferencje: selectedCategories,
            pref_typ_umowy: selectedContractType,
            pref_wymiar_etatu: selectedWorkTime,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Błąd podczas zapisywania preferencji');
      }

      // Użytkownik zapisuje preferencje lokalnie
      setPreferencesCompleted(true);

      // Resetujemy historię nawigacji
      router.replace('/(tabs)/mPraca/candidate');
    } catch (error) {
      console.error(error);
      Alert.alert("Błąd", "Nie udało się zapisać preferencji. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={MO_BLUE} />
        <Text style={{ marginTop: 16, color: MO_TEXT_SECONDARY }}>Ładowanie Twoich preferencji...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Jakiej pracy szukasz?</Text>
          <Text style={styles.subtitle}>
            Zaznacz branże, rodzaje umów i wymiar pracy, które Cię interesują. Dopasujemy do Ciebie najlepsze oferty.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Branże</Text>
          <View style={styles.chipsContainer}>
            {BRANZE.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <TouchableOpacity
                  key={category}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={category}
                  activeOpacity={0.7}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Rodzaj umowy</Text>
          <View style={styles.chipsContainer}>
            {TYPY_UMOWY.map((type) => {
              const isSelected = selectedContractType === type;
              return (
                <TouchableOpacity
                  key={type}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={type}
                  activeOpacity={0.7}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedContractType(type)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Wymiar etatu</Text>
          <View style={styles.chipsContainer}>
            {WYMIAR_ETATU.map((time) => {
              const isSelected = selectedWorkTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={time}
                  activeOpacity={0.7}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedWorkTime(time)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.7 }]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Zapisz i przejdź do ofert"
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Zapisywanie...' : 'Zapisz i przejdź do ofert'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MO_WHITE,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MO_TEXT_PRIMARY,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: MO_TEXT_SECONDARY,
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: MO_TEXT_PRIMARY,
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12, // React Native wspiera gap! (w nowszych wersjach)
  },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: MO_BORDER,
    backgroundColor: MO_WHITE,
  },
  chipSelected: {
    borderColor: MO_BLUE,
    backgroundColor: MO_LIGHT_BLUE,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
    color: MO_TEXT_PRIMARY,
  },
  chipTextSelected: {
    color: MO_BLUE,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    backgroundColor: MO_WHITE,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: MO_BLUE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: MO_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: MO_WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});
