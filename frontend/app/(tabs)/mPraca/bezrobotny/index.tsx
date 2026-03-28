import { useNavigation } from '@react-navigation/native';
import { AlertCircle, CheckCircle2, Landmark, Mail, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MO_BLUE = '#0052A5';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#E5E7EB';

export default function UrzadPracyScreen() {
  const [isRegistered, setIsRegistered] = useState(false);
  const navigation = useNavigation();

  const handleRegister = () => {
    Alert.alert(
      "Złożenie wniosku",
      "Czy na pewno chcesz zarejestrować się jako bezrobotny w Urzędzie Pracy? Otrzymasz natychmiastowe ubezpieczenie zdrowotne i zostanie Ci przydzielony doradca.",
      [
        { text: "Anuluj", style: "cancel" },
        { 
          text: "Zarejestruj się", 
          onPress: () => setIsRegistered(true),
          style: "default" 
        }
      ]
    );
  };

  const handeReadiness = () => {
    Alert.alert("Gotowość potwierdzona!", "Zwolniono Cię z osobistej wizyty w Urzędzie Pracy w tym miesiącu.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Urząd Pracy</Text>
          <Text style={styles.subtitle}>
            Załatwiaj państwowe formalności związane ze statusem zatrudnienia online w mObywatelu.
          </Text>
        </View>

        {/* STATUS BOX */}
        <View style={[styles.statusBox, isRegistered ? styles.statusBoxRegistered : styles.statusBoxUnregistered]}>
          <View style={styles.statusRow}>
            {isRegistered ? <ShieldCheck size={32} color="#047857" /> : <AlertCircle size={32} color="#DC2626" />}
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.statusLabel}>TWÓJ STATUS ZATRUDNIENIA:</Text>
              <Text style={[styles.statusValue, isRegistered ? { color: '#047857' } : { color: '#DC2626' }]}>
                {isRegistered ? 'ZAREJESTROWANY, UBEZPIECZONY' : 'STATUS NIEZNANY'}
              </Text>
            </View>
          </View>
        </View>

        {!isRegistered ? (
          <View style={styles.unregisteredContainer}>
            <Text style={styles.infoText}>
              Nie figurujesz w rejestrze osób bezrobotnych. Masz prawo do złożenia szybkiego wniosku bez wizyty fizycznej w Urzędzie.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
              <Landmark size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Zarejestruj się jako bezrobotny</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.registeredContainer}>
            
            <Text style={styles.sectionTitle}>Panel Urzędowy</Text>
            
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => Alert.alert('Oferty', 'Masz 2 nowe dopasowania od doradcy PUP.')}>
              <View style={[styles.iconFrame, { backgroundColor: '#EFF6FF' }]}>
                <Mail size={24} color={MO_BLUE} />
              </View>
              <View style={styles.actionTextRow}>
                <Text style={styles.actionTitle}>Oferty od Doradcy (PUP)</Text>
                <Text style={styles.actionDesc}>Wyselekcjonowane przez Twojego urzędnika</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2 nowe</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={handeReadiness}>
              <View style={[styles.iconFrame, { backgroundColor: '#F0FDF4' }]}>
                <CheckCircle2 size={24} color="#166534" />
              </View>
              <View style={styles.actionTextRow}>
                <Text style={styles.actionTitle}>Gotowość do pracy</Text>
                <Text style={styles.actionDesc}>Potwierdź chęć podjęcia zatrudnienia jednym kliknięciem</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => Alert.alert('Składki', 'Informacje o składkach zaciągane z serwerów ZUS.')}>
              <View style={[styles.iconFrame, { backgroundColor: '#FDF4FF' }]}>
                <ShieldCheck size={24} color="#C026D3" />
              </View>
              <View style={styles.actionTextRow}>
                <Text style={styles.actionTitle}>Polisa i Zasiłek</Text>
                <Text style={styles.actionDesc}>Szczegóły zasiłku dla bezrobotnych i ZUS</Text>
              </View>
            </TouchableOpacity>

          </View>
        )}

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

  statusBox: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBoxUnregistered: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  statusBoxRegistered: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusLabel: { fontSize: 12, fontWeight: '800', color: '#6B7280', marginBottom: 2 },
  statusValue: { fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },

  unregisteredContainer: { alignItems: 'center', marginTop: 10 },
  infoText: { fontSize: 15, textAlign: 'center', color: MO_TEXT_SECONDARY, marginBottom: 24, lineHeight: 24 },
  primaryButton: {
    backgroundColor: MO_BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 99,
    width: '100%',
    justifyContent: 'center',
    shadowColor: MO_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  registeredContainer: {},
  sectionTitle: { fontSize: 18, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 16 },
  
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MO_BORDER,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  iconFrame: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextRow: { flex: 1, paddingRight: 8 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 4 },
  actionDesc: { fontSize: 13, color: MO_TEXT_SECONDARY, lineHeight: 18 },
  badge: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
});
