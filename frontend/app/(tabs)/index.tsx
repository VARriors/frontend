import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DocumentsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/God%C5%82o_Rzeczypospolitej_Polskiej.svg/330px-God%C5%82o_Rzeczypospolitej_Polskiej.svg.png' }} 
            style={styles.logo} 
          />
          <Text style={styles.headerTitle}>mObywatel</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.profileBtn} activeOpacity={0.8}>
            <Text style={styles.profileText}>JK</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.greeting}>Witaj, Janie!</Text>

        <TouchableOpacity style={styles.idCard} activeOpacity={0.9}>
          <View style={styles.idHeader}>
            <Text style={styles.idTitle}>mDowód</Text>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/God%C5%82o_Rzeczypospolitej_Polskiej.svg/330px-God%C5%82o_Rzeczypospolitej_Polskiej.svg.png' }} 
              style={styles.idEagle} 
            />
          </View>
          <Text style={styles.idName}>JAN KOWALSKI</Text>
          <Text style={styles.idDetail}>Data urodzenia: 01.01.1990</Text>
          <View style={styles.idFooter}>
            <Text style={styles.idPesel}>PESEL: 90010112345</Text>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Moje dokumenty</Text>
        <View style={styles.documentItem}>
          <View style={styles.docIcon}>
            <Ionicons name="card-outline" size={24} color="#0052A5" />
          </View>
          <View style={styles.docText}>
            <Text style={styles.docTitle}>mPrawo Jazdy</Text>
            <Text style={styles.docSubtitle}>Ważne</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logo: { width: 32, height: 32, marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  profileText: { fontSize: 16, fontWeight: '700', color: '#0052A5' },
  greeting: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginBottom: 24 },
  idCard: { backgroundColor: '#E53935', borderRadius: 16, padding: 24, shadowColor: '#E53935', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8, marginBottom: 32 },
  idHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  idTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  idEagle: { width: 24, height: 24, tintColor: '#FFFFFF' },
  idName: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  idDetail: { fontSize: 14, color: '#FFCDD2', marginBottom: 24 },
  idFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)', paddingTop: 16 },
  idPesel: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  documentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  docIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  docText: { flex: 1 },
  docTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  docSubtitle: { fontSize: 13, color: '#10B981', marginTop: 4 }
});
