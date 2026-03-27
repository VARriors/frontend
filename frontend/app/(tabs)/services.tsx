import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usługi dla Obywatela</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* SEKCJA MPRACA */}
        <Text style={styles.sectionTitleMain}>mPraca (NOWOŚĆ)</Text>
        <View style={styles.mPracaList}>
          
          <TouchableOpacity 
            style={styles.mPracaItem} 
            onPress={() => router.push({ pathname: '/mPraca', params: { startRoute: 'CandidateCenter' } })}
            activeOpacity={0.8}
          >
            <View style={[styles.mPracaIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="search-outline" size={26} color="#0052A5" />
            </View>
            <View style={styles.mPracaTextContainer}>
              <Text style={styles.mPracaTitle}>Szukam pracy</Text>
              <Text style={styles.mPracaDesc}>Osobisty profil kandydata, CV i filtrowanie ofert</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mPracaItem} 
            onPress={() => router.push({ pathname: '/mPraca', params: { startRoute: 'UrzadPracy' } })}
            activeOpacity={0.8}
          >
            <View style={[styles.mPracaIconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="briefcase-outline" size={26} color="#166534" />
            </View>
            <View style={styles.mPracaTextContainer}>
              <Text style={styles.mPracaTitle}>Urząd Pracy</Text>
              <Text style={styles.mPracaDesc}>Status bezrobotnego, ubezpieczenie, oferty z urzędu</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mPracaItem} 
            onPress={() => router.push({ pathname: '/mPraca', params: { startRoute: 'EmployerDashboard' } })}
            activeOpacity={0.8}
          >
            <View style={[styles.mPracaIconContainer, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="business-outline" size={26} color="#374151" />
            </View>
            <View style={styles.mPracaTextContainer}>
              <Text style={styles.mPracaTitle}>Dla Pracodawcy</Text>
              <Text style={styles.mPracaDesc}>Weryfikuj kandydatów AI i dodawaj stanowiska</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>

        </View>

        <Text style={styles.sectionTitle}>Inne usługi mObywatel</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem}>
            <Ionicons name="car-outline" size={28} color="#0052A5" />
            <Text style={styles.gridText}>Punkty Karne</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Ionicons name="bus-outline" size={28} color="#0052A5" />
            <Text style={styles.gridText}>Bilety</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Ionicons name="receipt-outline" size={28} color="#0052A5" />
            <Text style={styles.gridText}>Mandaty</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Ionicons name="medkit-outline" size={28} color="#0052A5" />
            <Text style={styles.gridText}>e-Recepta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  content: { padding: 20 },
  
  sectionTitleMain: { fontSize: 20, fontWeight: '800', color: '#0052A5', marginBottom: 12 },
  mPracaList: { marginBottom: 32 },
  mPracaItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mPracaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  mPracaTextContainer: { flex: 1, paddingRight: 8 },
  mPracaTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  mPracaDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  gridItem: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, marginBottom: 16 },
  gridText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: '#1F2937' }
});
