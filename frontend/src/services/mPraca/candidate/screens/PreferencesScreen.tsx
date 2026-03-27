import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Kolory zgodne z design systemem mObywatel
const MO_BLUE = '#0052A5';
const MO_LIGHT_BLUE = '#E6F0FA';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#D1D5DB';

const CATEGORIES = [
  'IT / Technologia',
  'Gastronomia',
  'Budownictwo',
  'Administracja',
  'Sprzedaż i Obsługa Klienta',
  'Edukacja',
  'Logistyka i Transport',
  'Praca fizyczna',
  'Księgowość',
  'Służba Zdrowia'
];

export default function PreferencesScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => 
      prev.includes(category) 
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = () => {
    // Użytkownik zapisuje preferencje. Jeśli to initial setup, nawigujemy do Dashboardu.
    // Z Dashboardu można wejść we wszystko, a 'GoBack' również powinno działać z Dashboardu (właściwie replace).
    navigation.navigate('CandidateDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Jakiej pracy szukasz?</Text>
          <Text style={styles.subtitle}>
            Zaznacz branże, w których masz doświadczenie lub w których chciałbyś pracować. Dopasujemy do Ciebie najlepsze oferty.
          </Text>
        </View>

        <View style={styles.chipsContainer}>
          {CATEGORIES.map((category) => {
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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.8}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Zapisz i przejdź do ofert"
        >
          <Text style={styles.saveButtonText}>Zapisz i przejdź do ofert</Text>
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
