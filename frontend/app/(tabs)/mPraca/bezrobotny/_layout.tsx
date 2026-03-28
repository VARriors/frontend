import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

export default function BezrobotnyLayout() {
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
          title: 'Urząd Pracy',
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
    </Stack>
  );
}
