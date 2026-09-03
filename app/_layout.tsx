import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RadioProvider } from '../src/RadioProvider';

export default function RootLayout() {
  return (
    <RadioProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#020D24' } }} />
    </RadioProvider>
  );
}
