import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme';

type Partner = {
  id: number;
  name: string;
  type: 'partner' | 'broadcaster' | string;
  description?: string;
  city?: string;
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  logo_url?: string;
};

const API = 'https://lechoduder.fr/api/partners.php';

export default function PartnersScreen() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError('Impossible de charger les partenaires pour le moment.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.lime} />}>
        <Text style={styles.kicker}>L’ÉCHO DU DER · RÉSEAU LOCAL</Text>
        <Text style={styles.title}>Partenaires</Text>
        <Text style={styles.intro}>Les entreprises, associations et lieux qui soutiennent ou diffusent L’Écho du Der.</Text>

        {loading ? <ActivityIndicator color={colors.lime} size="large" style={styles.loader} /> : null}
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.retry}>Réessayer</Text></Pressable></View> : null}

        {!loading && !error && items.map((item) => {
          const firstLink = item.website_url || item.facebook_url || item.instagram_url;
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.logoBox}>
                {item.logo_url ? <Image source={{ uri: item.logo_url }} style={styles.logo} resizeMode="contain" /> : <Text style={styles.logoFallback}>{item.name.slice(0, 2).toUpperCase()}</Text>}
              </View>
              <View style={styles.body}>
                <View style={styles.metaRow}>
                  <Text style={styles.badge}>{item.type === 'broadcaster' ? 'DIFFUSEUR' : 'PARTENAIRE'}</Text>
                  {item.city ? <Text style={styles.city}>{item.city}</Text> : null}
                </View>
                <Text style={styles.name}>{item.name}</Text>
                {item.description ? <Text style={styles.description} numberOfLines={4}>{item.description}</Text> : null}
                {firstLink ? <Pressable onPress={() => Linking.openURL(firstLink)}><Text style={styles.link}>Découvrir  →</Text></Pressable> : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { padding: 20, paddingTop: 24, paddingBottom: 32 },
  kicker: { color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  title: { marginTop: 7, color: colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  intro: { marginTop: 9, marginBottom: 22, color: colors.muted, fontSize: 13, lineHeight: 20 },
  loader: { marginTop: 50 },
  errorBox: { padding: 20, borderRadius: 20, backgroundColor: colors.panelDark, borderWidth: 1, borderColor: colors.border },
  errorText: { color: colors.text },
  retry: { marginTop: 12, color: colors.lime, fontWeight: '900' },
  card: { marginBottom: 14, overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panelDark },
  logoBox: { height: 150, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', padding: 22 },
  logo: { width: '100%', height: '100%' },
  logoFallback: { color: '#07172C', fontSize: 36, fontWeight: '900' },
  body: { padding: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  badge: { color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  city: { color: '#8295AE', fontSize: 10, fontWeight: '700' },
  name: { marginTop: 9, color: colors.text, fontSize: 21, fontWeight: '900' },
  description: { marginTop: 9, color: colors.muted, fontSize: 12, lineHeight: 18 },
  link: { marginTop: 14, color: colors.cyan, fontSize: 11, fontWeight: '900' },
});
