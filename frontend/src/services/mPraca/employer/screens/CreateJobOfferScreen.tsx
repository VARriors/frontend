import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#D1D5DB';
const MO_BG = '#F9FAFB';

type Priority = 'Krytyczne' | 'Przydatne' | 'Obojętne';

interface RegRequirement {
  id: string;
  label: string;
}

const REQUIREMENTS: RegRequirement[] = [
  { id: 'krk', label: 'Niekaralność (KRK)' },
  { id: 'sanepid', label: 'Badania Sanepid' },
  { id: 'driving', label: 'Prawo Jazdy (Kat. B)' },
];

export default function CreateJobOfferScreen() {
  const [title, setTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  
  const [priorities, setPriorities] = useState<Record<string, Priority>>({
    krk: 'Obojętne',
    sanepid: 'Obojętne',
    driving: 'Obojętne',
  });

  const handlePrioritySelect = (reqId: string, value: Priority) => {
    setPriorities((prev) => ({ ...prev, [reqId]: value }));
  };

  const handleSave = () => {
    // Tutaj mockowanie zapisu do bazy mPraca
    console.log('Zapisano ofertę:', { title, salary, description, priorities });
    // navigation.goBack()
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.pageTitle}>Nowa Oferta mPraca</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tytuł stanowiska</Text>
            <TextInput
              style={styles.input}
              placeholder="np. Senior Frontend Developer"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              accessibilityLabel="Pole edycji Tytuł stanowiska"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Widełki płacowe (PLN)</Text>
            <TextInput
              style={styles.input}
              placeholder="np. 10000 - 15000 brutto"
              placeholderTextColor="#9CA3AF"
              value={salary}
              onChangeText={setSalary}
              accessibilityLabel="Pole edycji Widełki płacowe"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Opis stanowiska</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Wprowadź krótki opis stanowiska pracownika..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Pole edycji Opis stanowiska"
            />
          </View>

          <View style={styles.prioritiesSection}>
            <Text style={styles.sectionTitle}>Priorytety Pracodawcy (AI Match)</Text>
            <Text style={styles.sectionSubtitle}>Zdecyduj, które państwowe cechy są kluczowe. System AI mObywatel przefiltruje dziesiątki CV w kilka sekund poszukując tych flag.</Text>
            
            {REQUIREMENTS.map((req) => (
              <View key={req.id} style={styles.priorityRow}>
                <Text style={styles.priorityLabel}>{req.label}</Text>
                
                <View style={styles.segmentedControl}>
                  {(['Obojętne', 'Przydatne', 'Krytyczne'] as Priority[]).map((level) => {
                    const isActive = priorities[req.id] === level;
                    return (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.segmentButton, 
                          isActive && styles.segmentActive,
                          isActive && level === 'Krytyczne' && { backgroundColor: '#FEE2E2', borderColor: '#F87171' }, // Czerwony nacisk
                          isActive && level === 'Przydatne' && { backgroundColor: '#FEF3C7', borderColor: '#FBBF24' }, // Żółty nacisk
                          isActive && level === 'Obojętne' && { backgroundColor: MO_WHITE, borderColor: MO_BORDER }
                        ]}
                        onPress={() => handlePrioritySelect(req.id, level)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isActive }}
                      >
                        <Text style={[
                          styles.segmentText,
                          isActive && styles.segmentTextActive,
                          isActive && level === 'Krytyczne' && { color: '#B91C1C' },
                          isActive && level === 'Przydatne' && { color: '#92400E' }
                        ]}>
                          {level}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Opublikuj ofertę pracy"
          >
            <Text style={styles.saveButtonText}>Opublikuj za pomocą Profilu Firmy</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_WHITE },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 24 },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: MO_TEXT_PRIMARY, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: MO_BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: MO_TEXT_PRIMARY,
    backgroundColor: MO_BG,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  
  prioritiesSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: MO_TEXT_SECONDARY, lineHeight: 18, marginBottom: 20 },
  
  priorityRow: { marginBottom: 24 },
  priorityLabel: { fontSize: 15, fontWeight: '600', color: MO_TEXT_PRIMARY, marginBottom: 12 },
  
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: MO_WHITE,
    borderColor: MO_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: MO_TEXT_SECONDARY,
  },
  segmentTextActive: {
    color: MO_TEXT_PRIMARY,
    fontWeight: '700',
  },

  footer: {
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: MO_WHITE,
  },
  saveButton: {
    backgroundColor: MO_BLUE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: MO_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: { color: MO_WHITE, fontSize: 16, fontWeight: '700' },
});
