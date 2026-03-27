import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen from '../screens/LandingScreen';
import CVGuard from '../candidate/components/CVGuard';
import CandidateDashboard from '../candidate/screens/CandidateDashboard';
import AddCVScreen from '../candidate/screens/AddCVScreen';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import PreferencesScreen from '../candidate/screens/PreferencesScreen';
import JobOffersScreen from '../candidate/screens/JobOffersScreen';
import JobSearchScreen from '../candidate/screens/JobSearchScreen';
import MyApplicationsScreen from '../candidate/screens/MyApplicationsScreen';
import ApplicationDetailsScreen from '../candidate/screens/ApplicationDetailsScreen';
import EmployerDashboard from '../employer/screens/EmployerDashboard';
import CreateJobOfferScreen from '../employer/screens/CreateJobOfferScreen';
import CandidatesListScreen from '../employer/screens/CandidatesListScreen';
import CandidateProfileScreen from '../employer/screens/CandidateProfileScreen';
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
      <Stack.Screen 
        name="Preferences" 
        component={PreferencesScreen} 
        options={{ title: 'Twoje Preferencje', headerBackVisible: false }} 
      />
      <Stack.Screen 
        name="JobOffers" 
        component={JobOffersScreen} 
        options={{ title: 'Mamy dla Ciebie Oferty!', headerBackVisible: false }} 
      />
      <Stack.Screen 
        name="JobSearch" 
        component={JobSearchScreen} 
        options={({ navigation }) => ({ 
          title: 'Szukaj Pracy',
          headerShown: true,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginLeft: -8 }}>
              <ChevronLeft size={28} color="#1F2937" />
            </TouchableOpacity>
          )
        })} 
      />
      <Stack.Screen 
        name="MyApplications" 
        component={MyApplicationsScreen} 
        options={({ navigation }) => ({ 
          title: 'Moje Aplikacje',
          headerShown: true,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginLeft: -8 }}>
              <ChevronLeft size={28} color="#1F2937" />
            </TouchableOpacity>
          )
        })} 
      />
      <Stack.Screen 
        name="ApplicationDetails" 
        component={ApplicationDetailsScreen} 
        options={({ navigation }) => ({ 
          title: 'Szczegóły Aplikacji',
          headerShown: true,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginLeft: -8 }}>
              <ChevronLeft size={28} color="#1F2937" />
            </TouchableOpacity>
          )
        })} 
      />
      
      {/* EMPLOYER PULLS */}
      <Stack.Screen 
        name="EmployerDashboard" 
        component={EmployerDashboard} 
        options={{ title: 'Panel Pracodawcy', headerBackVisible: false }} 
      />
      <Stack.Screen 
        name="CreateJobOffer" 
        component={CreateJobOfferScreen} 
        options={{ title: 'Dodawanie Oferty' }} 
      />
      <Stack.Screen 
        name="CandidatesList" 
        component={CandidatesListScreen} 
        options={{ title: 'Aplikacje' }} 
      />
      <Stack.Screen 
        name="CandidateProfile" 
        component={CandidateProfileScreen} 
        options={{ title: 'Szczegóły Aplikacji' }} 
      />
    </Stack.Navigator>
  );
}
