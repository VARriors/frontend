import { useRouter } from 'expo-router';
import { Building2, Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#E5E7EB';
const MO_BG = '#F9FAFB';

export type AppStatus = 'SENT' | 'VIEWED' | 'INVITED' | 'REJECTED';

export interface ApplicationItem {
  id: string;
  jobTitle: string;
  companyName: string;
  sentDate: string;
  status: AppStatus;
}

const mockApps: ApplicationItem[] = [
  { id: '1', jobTitle: 'Senior React Developer', companyName: 'FinTech S.A.', sentDate: '12.05.2024', status: 'INVITED' },
  { id: '2', jobTitle: 'Frontend Engineer', companyName: 'TechHouse', sentDate: '10.05.2024', status: 'VIEWED' },
  { id: '3', jobTitle: 'Junior/Mid React Native', companyName: 'StartupX', sentDate: '09.05.2024', status: 'SENT' },
  { id: '4', jobTitle: 'Fullstack Developer', companyName: 'Corp IT', sentDate: '01.05.2024', status: 'REJECTED' },
];

const getStatusConfig = (status: AppStatus) => {
  switch (status) {
    case 'SENT': return { label: 'Wysłano', bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB' };
    case 'VIEWED': return { label: 'Wyświetlono', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
    case 'INVITED': return { label: 'Zaproszenie', bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
    case 'REJECTED': return { label: 'Odrzucono', bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' };
  }
};

export default function MyApplicationsScreen() {
  const router = useRouter();
  const [apps] = useState(mockApps);

  const handlePress = (id: string) => {
    router.push({ pathname: '/(tabs)/mPraca/candidate/application-details', params: { applicationId: id } });
  };

  const renderItem = ({ item }: { item: ApplicationItem }) => {
    const config = getStatusConfig(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8}
        onPress={() => handlePress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Aplikacja na ${item.jobTitle} w firmie ${item.companyName}, status: ${config.label}`}
      >
        <View style={styles.cardContent}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</Text>
          
          <View style={styles.infoRow}>
            <Building2 size={14} color={MO_TEXT_SECONDARY} style={styles.icon} />
            <Text style={styles.infoText}>{item.companyName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={14} color={MO_TEXT_SECONDARY} style={styles.icon} />
            <Text style={styles.infoText}>Wysłano: {item.sentDate}</Text>
          </View>
        </View>
        
        <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
          <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={apps}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_BG },
  
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MO_WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MO_BORDER,
    ...Platform.select({
       ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4 },
       android: { elevation: 1 }
    })
  },
  cardContent: { flex: 1, marginRight: 12 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  icon: { marginRight: 6 },
  infoText: { fontSize: 14, color: MO_TEXT_SECONDARY, fontWeight: '500' },
  
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 12, fontWeight: '700' }
});
