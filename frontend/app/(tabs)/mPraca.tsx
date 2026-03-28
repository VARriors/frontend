import MPracaStack from '@/src/services/mPraca/navigation/MPracaStack';
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function MPracaEntryPoint() {
  const params = useLocalSearchParams<{ startRoute?: string }>();
  const route = params.startRoute || 'CandidateCenter';

  // Używamy key={route}, aby wymusić przeładowanie (odświeżenie) wewnętrznego navigation stacka
  // w przypadku gdy użytkownik wchodzi z serwisy.tsx w inny filar mPracy
  return (
    <View style={{ flex: 1 }}>
      <MPracaStack key={route} initialRoute={route as any} />
    </View>
  );
}
