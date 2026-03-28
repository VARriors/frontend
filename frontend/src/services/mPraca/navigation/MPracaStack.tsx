import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import CandidateCenterScreen from '../candidate/screens/CandidateCenterScreen';
import UrzadPracyScreen from '../candidate/screens/UrzadPracyScreen';
import EmployerDashboard from '../employer/screens/EmployerDashboard';
import CVGuard from '../candidate/components/CVGuard';
import AddCVScreen from '../candidate/screens/AddCVScreen';
import PreferencesScreen from '../candidate/screens/PreferencesScreen';
import JobSearchScreen from '../candidate/screens/JobSearchScreen';
import MyApplicationsScreen from '../candidate/screens/MyApplicationsScreen';
import ApplicationDetailsScreen from '../candidate/screens/ApplicationDetailsScreen';
import CreateJobOfferScreen from '../employer/screens/CreateJobOfferScreen';
import CandidatesListScreen from '../employer/screens/CandidatesListScreen';
import CandidateProfileScreen from '../employer/screens/CandidateProfileScreen';

import type { MPracaStackParamList } from './types';

const Stack = createNativeStackNavigator<MPracaStackParamList>();

type MPracaStackProps = {
  initialRoute?: keyof MPracaStackParamList;
};

export default function MPracaStack({ initialRoute = 'CandidateCenter' }: MPracaStackProps) {
  // Przekazujemy initialRouteName do Navigatora, ale React Navigation czasem keszuje stany stosów.
  // Dzięki użyciu 'key' w komponencie nadrzędnym (MPracaEntryPoint), ten komponent zostanie zamontowany na nowo.
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: '#000000', fontWeight: '500' },
        headerTintColor: '#0052A5',
        headerShadowVisible: false,
        headerLeft: (props) => {
          if (!props.canGoBack) return null;
          return (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginLeft: -8 }}>
              <ChevronLeft size={28} color="#1F2937" />
            </TouchableOpacity>
          );
        }
      })}
    >
      {/* KANDYDAT */}
      <Stack.Screen
        name="CandidateCenter"
        component={CandidateCenterScreen}
        options={{ title: 'mPraca: Szukam Pracy', headerLeft: () => null }}
      />
      <Stack.Screen
        name="CandidateFlow"
        component={CVGuard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddCV"
        component={AddCVScreen}
        options={{ title: 'Moje CV' }}
      />
      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
        options={{ title: 'Twoje Preferencje' }}
      />
      <Stack.Screen
        name="JobSearch"
        component={JobSearchScreen}
        options={{ title: 'Wyszukiwarka Ofert' }}
      />
      <Stack.Screen
        name="MyApplications"
        component={MyApplicationsScreen}
        options={{ title: 'Moje Aplikacje' }}
      />
      <Stack.Screen
        name="ApplicationDetails"
        component={ApplicationDetailsScreen}
        options={{ title: 'Szczegóły Aplikacji' }}
      />

      {/* URZĄD PRACY */}
      <Stack.Screen
        name="UrzadPracy"
        component={UrzadPracyScreen}
        options={{ title: 'Państwowy Urząd Pracy', headerLeft: () => null }}
      />

      {/* PRACODAWCA */}
      <Stack.Screen
        name="EmployerDashboard"
        component={EmployerDashboard}
        options={{ title: 'Panel Pracodawcy', headerLeft: () => null }}
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
        options={{ title: 'Profil Kandydata' }}
      />
    </Stack.Navigator>
  );
}
