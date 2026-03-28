import {AlertCircle, CheckCircle2, Landmark, Mail, ShieldCheck} from 'lucide-react-native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  getBezrobotnyStatus,
  registerAsUnemployed,
} from '@/src/services/mPraca/candidate/api/bezrobotnyApi';

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_TEXT_MUTED = '#9CA3AF';
const MO_BORDER = '#E5E7EB';
const MO_BG = '#F9FAFB';

export default function UrzadPracyScreen() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      setIsLoading(true);
      try {
        const status = await getBezrobotnyStatus();
        setIsRegistered(status.isRegisteredAsUnemployed);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Nie udało się pobrać statusu.';
        Alert.alert('Błąd', message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadStatus();
  }, []);

  const submitRegister = async () => {
    setIsSubmitting(true);
    try {
      const status = await registerAsUnemployed();
      setIsRegistered(status.isRegisteredAsUnemployed);
      Alert.alert(
        'Rejestracja zakończona',
        'Zostałeś zarejestrowany jako bezrobotny. Ochrona zdrowotna została aktywowana.',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nie udało się zakończyć rejestracji.';
      Alert.alert('Błąd rejestracji', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = () => {
    if (isSubmitting) {
      return;
    }
    void submitRegister();
  };

  const handleReadiness = () => {
    Alert.alert(
      'Gotowość potwierdzona!',
      'Zwolniono Cię z osobistej wizyty w Urzędzie Pracy w tym miesiącu.',
    );
  };

  const handleAllowanceApplication = () => {
    Alert.alert('Wnioskuj o dodatek aktywizacyjny', 'Podpisz elektronicznie wniosek', [
      {text: 'Anuluj', style: 'cancel'},
      {
        text: 'Podpisz',
        onPress: () => Alert.alert('Potwierdzenie', 'Wniosek wysłano do urzędu skarbowego'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── HEADER ─── */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderIconRow}>
            <View style={styles.pageHeaderIconBg}>
              <Landmark size={24} color={MO_WHITE} />
            </View>
          </View>
          <Text style={styles.pageTitle}>Urząd Pracy</Text>
          <Text style={styles.pageSubtitle}>
            Załatwiaj państwowe formalności związane ze statusem zatrudnienia online w mObywatelu.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={MO_BLUE} />
            <Text style={styles.loadingText}>Pobieranie statusu z urzędu...</Text>
          </View>
        ) : null}

        {/* ─── STATUS SECTION ─── */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusCard,
              isRegistered ? styles.statusCardActive : styles.statusCardInactive,
            ]}>
            <View style={styles.statusIconBox}>
              {isRegistered ? (
                <ShieldCheck size={28} color="#10B981" />
              ) : (
                <AlertCircle size={28} color="#EF4444" />
              )}
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>TWÓJ STATUS:</Text>
              <Text
                style={[
                  styles.statusText,
                  isRegistered ? styles.statusTextActive : styles.statusTextInactive,
                ]}>
                {isRegistered ? 'Zarejestrowany' : 'Niezarejestrowany'}
              </Text>
            </View>
          </View>
        </View>

        {!isRegistered ? (
          <View style={styles.unregisteredSection}>
            <Text style={styles.infoText}>
              Nie figurujesz w rejestrze osób bezrobotnych. Zarejestruj się teraz, aby zyskać dostęp
              do ochrony zdrowotnej i ofert pracy.
            </Text>
            <TouchableOpacity
              style={[styles.registerButton, isSubmitting && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isSubmitting}
              activeOpacity={0.8}>
              {isSubmitting ? (
                <ActivityIndicator color={MO_WHITE} />
              ) : (
                <>
                  <Landmark size={18} color={MO_WHITE} style={{marginRight: 8}} />
                  <Text style={styles.registerButtonText}>Zarejestruj się jako bezrobotny</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.registeredSection}>
            <Text style={styles.sectionTitle}>Panel Urzędowy</Text>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => Alert.alert('Oferty', 'Masz 2 nowe dopasowania od doradcy PUP.')}
              activeOpacity={0.7}>
              <View style={[styles.serviceIconBg, {backgroundColor: '#EFF6FF'}]}>
                <Mail size={24} color={MO_BLUE} />
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>Oferty od Doradcy</Text>
                <Text style={styles.serviceDesc}>Wyselekcjonowane przez urzędnika PUP</Text>
              </View>
              <View style={styles.serviceBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={handleReadiness}
              activeOpacity={0.7}>
              <View style={[styles.serviceIconBg, {backgroundColor: '#ECFDF5'}]}>
                <CheckCircle2 size={24} color="#10B981" />
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>Gotowość do pracy</Text>
                <Text style={styles.serviceDesc}>Potwierdź chęć podjęcia zatrudnienia</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={handleAllowanceApplication}
              activeOpacity={0.7}>
              <View style={[styles.serviceIconBg, {backgroundColor: '#FFF7ED'}]}>
                <Landmark size={24} color="#EA580C" />
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>Dodatek aktywizacyjny</Text>
                <Text style={styles.serviceDesc}>Złóż wniosek o wsparcie finansowe</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() =>
                Alert.alert('Składki', 'Informacje o składkach zaciągane z serwerów ZUS.')
              }
              activeOpacity={0.7}>
              <View style={[styles.serviceIconBg, {backgroundColor: '#F5F3FF'}]}>
                <ShieldCheck size={24} color="#7C3AED" />
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>Polisa i Zasiłek</Text>
                <Text style={styles.serviceDesc}>Szczegóły zasiłku dla bezrobotnych</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={{height: 20}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: MO_BG},
  scroll: {paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20},

  // ─── Header ───
  pageHeader: {paddingVertical: 20, paddingHorizontal: 4, marginBottom: 16},
  pageHeaderIconRow: {marginBottom: 16},
  pageHeaderIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: MO_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: MO_BLUE,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: MO_TEXT_PRIMARY,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: MO_TEXT_SECONDARY,
    lineHeight: 22,
  },

  // ─── Loading ───
  loadingBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#1E3A8A',
    fontSize: 13,
    fontWeight: '600',
  },

  // ─── Status Section ───
  statusSection: {marginBottom: 24},
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {elevation: 1},
    }),
  },
  statusCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusCardInactive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusIconBox: {
    marginRight: 12,
  },
  statusContent: {flex: 1},
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: MO_TEXT_SECONDARY,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#10B981',
  },
  statusTextInactive: {
    color: '#EF4444',
  },

  // ─── Unregistered Section ───
  unregisteredSection: {
    backgroundColor: MO_WHITE,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: MO_BORDER,
  },
  infoText: {
    fontSize: 15,
    color: MO_TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: MO_BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: MO_BLUE,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: MO_WHITE,
    fontSize: 15,
    fontWeight: '700',
  },

  // ─── Registered Section ───
  registeredSection: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: MO_TEXT_PRIMARY,
    marginBottom: 16,
  },

  // ─── Service Cards ───
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MO_WHITE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MO_BORDER,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {elevation: 1},
    }),
  },
  serviceIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MO_TEXT_PRIMARY,
    marginBottom: 3,
  },
  serviceDesc: {
    fontSize: 13,
    color: MO_TEXT_SECONDARY,
    lineHeight: 18,
  },
  serviceBadge: {
    backgroundColor: '#EF4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: MO_WHITE,
    fontSize: 13,
    fontWeight: '800',
  },
});
