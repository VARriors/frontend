import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

export default function CandidateLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: '#000000', fontWeight: '500' },
        headerTintColor: '#0052A5',
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8, marginLeft: -8 }}
            accessibilityLabel="Cofnij"
            accessibilityRole="button"
          >
            <ChevronLeft size={28} color="#1F2937" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Szukam Pracy',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/services')}
              style={{ padding: 8, marginLeft: -8 }}
              accessibilityLabel="Wróć do Serwisów"
              accessibilityRole="button"
            >
              <ChevronLeft size={28} color="#1F2937" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="job-search" options={{ title: 'Wyszukiwarka Ofert' }} />
      <Stack.Screen name="add-cv" options={{ title: 'Moje CV' }} />
      <Stack.Screen name="preferences" options={{ title: 'Twoje Preferencje' }} />
      <Stack.Screen name="my-applications" options={{ title: 'Moje Aplikacje' }} />
      <Stack.Screen name="application-details" options={{ title: 'Szczegóły Aplikacji' }} />
    </Stack>
  );
}
