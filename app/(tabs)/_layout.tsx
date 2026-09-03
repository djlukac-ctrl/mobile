import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme';

const TabIcon = ({ symbol, active }: { symbol: string; active: boolean }) => (
  <Text style={{ fontSize: 17, color: active ? colors.lime : '#7E90A8' }}>{symbol}</Text>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#06162F',
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: 78,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: '#7E90A8',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ focused }) => <TabIcon symbol="⌂" active={focused} /> }} />
      <Tabs.Screen name="actualites" options={{ title: 'Actualités', tabBarIcon: ({ focused }) => <TabIcon symbol="▤" active={focused} /> }} />
      <Tabs.Screen name="podcasts" options={{ title: 'Podcasts', tabBarIcon: ({ focused }) => <TabIcon symbol="◉" active={focused} /> }} />
      <Tabs.Screen name="artistes" options={{ title: 'Artistes', tabBarIcon: ({ focused }) => <TabIcon symbol="★" active={focused} /> }} />
      <Tabs.Screen name="partenaires" options={{ title: 'Partenaires', tabBarIcon: ({ focused }) => <TabIcon symbol="◇" active={focused} /> }} />
      <Tabs.Screen name="plus" options={{ href: null }} />
    </Tabs>
  );
}
