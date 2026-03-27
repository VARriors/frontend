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
        
        {/* BIG MPRAKA BUTTON */}
        <TouchableOpacity 
          style={styles.heroButton} 
          onPress={() => router.push('/mPraca')}
          activeOpacity={0.8}
        >
          <View style={styles.heroIconContainer}>
            <Ionicons name="briefcase" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>mPraca (NOWOŚĆ)</Text>
            <Text style={styles.heroSubtitle}>Znajdź pracę lub pracownika z pomocą zweryfikowanego profilu CV.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#0052A5" />
        </TouchableOpacity>

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
  heroButton: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 32, shadowColor: '#0052A5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#EFF6FF' },
  heroIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0052A5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  heroTextContainer: { flex: 1, paddingRight: 16 },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#0052A5', marginBottom: 6 },
  heroSubtitle: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  gridItem: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, marginBottom: 16 },
  gridText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: '#1F2937' }
});
