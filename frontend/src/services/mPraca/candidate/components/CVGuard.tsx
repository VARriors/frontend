import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MPracaStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MPracaStackParamList, 'CandidateFlow'>;

export default function CVGuard({ navigation }: Props) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Mockowanie sprawdzenia w bazie czy obywatel posiada wymagane CV na koncie
    const checkCV = async () => {
      setIsChecking(true);
      
      // Symulacja np. pobierania z API statusu kandydata
      setTimeout(() => {
        const hasCV = false; // MOCK: obecnie wymusza false, by przekierować na AddCV
        setIsChecking(false);

        if (hasCV) {
          navigation.replace('CandidateDashboard');
        } else {
          navigation.replace('AddCV');
        }
      }, 800);
    };

    checkCV();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0052A5" />
      <Text style={styles.text}>Weryfikacja danych kandydata...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
});
