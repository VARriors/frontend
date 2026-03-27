import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MPracaStackParamList } from '../../navigation/types';
import { Search, FileText, Settings, Briefcase } from 'lucide-react-native';

const MO_BLUE = '#0052A5';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#E5E7EB';

export default function CandidateCenterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MPracaStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Szukam pracy</Text>
          <Text style={styles.subtitle}>
            Skorzystaj z wyszukiwarki ofert lub uzupełnij swój profil, by zyskać weryfikację państwową.
          </Text>
        </View>

        {/* PRZYCISK SZUKAJ */}
        <TouchableOpacity 
          style={styles.searchHeroButton}
          onPress={() => navigation.navigate('JobSearch')}
          activeOpacity={0.8}
        >
          <View style={styles.searchIconBg}>
            <Search size={28} color="#FFFFFF" />
          </View>
          <View style={styles.searchHeroText}>
            <Text style={styles.searchTitle}>Szukaj ofert pracy</Text>
            <Text style={styles.searchSubtitle}>Przeglądaj wszystkie oferty i dopasuj zarobki</Text>
          </View>
        </TouchableOpacity>

        {/* MÓJ PROFIL KANDYDATA */}
        <Text style={styles.sectionTitle}>Mój Profil Kandydata</Text>
        <View style={styles.listContainer}>

          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => navigation.navigate('CandidateFlow')}
            activeOpacity={0.7}
          >
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}>
              <FileText size={24} color={MO_BLUE} />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Moje CV</Text>
              <Text style={styles.listSubtitle}>Zarządzaj swoimi doświadczeniami i certyfikatami</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => navigation.navigate('Preferences')}
            activeOpacity={0.7}
          >
            <View style={[styles.listIconBg, { backgroundColor: '#FDF4FF' }]}>
              <Settings size={24} color="#C026D3" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Moje Preferencje</Text>
              <Text style={styles.listSubtitle}>Jaka branża najbardziej Cię interesuje?</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.listItem, styles.lastListItem]}
            onPress={() => navigation.navigate('MyApplications')}
            activeOpacity={0.7}
          >
            <View style={[styles.listIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Briefcase size={24} color="#059669" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Moje Aplikacje</Text>
              <Text style={styles.listSubtitle}>Śledź statusy swoich rekrutacji</Text>
            </View>
          </TouchableOpacity>

        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 8 },
  subtitle: { fontSize: 15, color: MO_TEXT_SECONDARY, lineHeight: 22 },

  // GŁÓWNY PRZYCISK WYSZUKIWANIA
  searchHeroButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    shadowColor: '#0052A5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIconBg: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: MO_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  searchHeroText: { flex: 1 },
  searchTitle: { fontSize: 18, fontWeight: '800', color: MO_BLUE, marginBottom: 4 },
  searchSubtitle: { fontSize: 13, color: MO_TEXT_SECONDARY, lineHeight: 18 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 16 },
  
  // LISTA PROFILU
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: MO_BORDER,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastListItem: { borderBottomWidth: 0 },
  listIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listTextContainer: { flex: 1 },
  listTitle: { fontSize: 16, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 2 },
  listSubtitle: { fontSize: 13, color: MO_TEXT_SECONDARY }
});
