import { View, Text, SafeAreaView } from 'react-native';

export default function QRScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A' }}>Skanuj Kod QR</Text>
      <Text style={{ color: '#6B7280', marginTop: 8 }}>Moduł skanowania (w budowie)</Text>
    </SafeAreaView>
  );
}
