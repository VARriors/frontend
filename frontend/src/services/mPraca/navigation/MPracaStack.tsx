import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen from '../screens/LandingScreen';
import CVGuard from '../candidate/components/CVGuard';
import CandidateDashboard from '../candidate/screens/CandidateDashboard';
import AddCVScreen from '../candidate/screens/AddCVScreen';
import type { MPracaStackParamList } from './types';

const Stack = createNativeStackNavigator<MPracaStackParamList>();

export default function MPracaStack() {
  return (
    <Stack.Navigator
      initialRouteName="LandingPage"
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: '#000000', fontWeight: '500' },
        headerTintColor: '#0052A5', // mObywatel blue
        headerShadowVisible: false, // czysty biały wygląd
        headerBackVisible: false, // Ukryj tekst powrotu na rzecz samej strzałki
      }}
    >
      <Stack.Screen 
        name="LandingPage" 
        component={LandingScreen} 
        options={{ title: 'mPraca' }} 
      />
      <Stack.Screen 
        name="CandidateFlow" 
        component={CVGuard} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AddCV" 
        component={AddCVScreen} 
        options={{ title: 'Dodaj CV' }} 
      />
      <Stack.Screen 
        name="CandidateDashboard" 
        component={CandidateDashboard} 
        options={{ title: 'Ścieżka Kandydata', headerBackVisible: false }} 
      />
    </Stack.Navigator>
  );
}
