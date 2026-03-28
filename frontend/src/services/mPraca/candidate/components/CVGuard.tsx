import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function CVGuard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkCV = async () => {
      setIsChecking(true);

      // Symulacja np. pobierania z API statusu kandydata
      setTimeout(() => {
        const hasCV = false; // MOCK: wymusza false -> przekierowuje na AddCV
        setIsChecking(false);

        if (hasCV) {
          // Użytkownik ma CV, wracamy na stronę główną
          router.back();
        } else {
          router.replace('/(tabs)/mPraca/candidate/add-cv');
        }
      }, 800);
    };

    checkCV();
  }, [router]);

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
