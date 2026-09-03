import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme';

type Artist = {
  id: number;
  name: string;
  bio?: string;
  photo_url?: string;
  city?: string;
  genre?: string;
  links?: Record<string, string | null>;
};

const API = 'https://lechoduder.fr/api/artists.php';

export default function ArtistsScreen() {
  const [items, setItems] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}?t=${Date.now()}`);
      if (!response.ok) throw new Error('HTTP');
      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError('Impossible de charger les artistes locaux pour le moment.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.lime} />}>
        <View style={styles.header}>
          <Text style={styles.kicker}>L’ÉCHO DU DER · TALENTS DU TERRITOIRE</Text>
          <Text style={styles.heading}>Artistes locaux</Text>
          <Text style={styles.intro}>Découvre les artistes accompagnés et diffusés par L’Écho du Der.</Text>
        </View>

        {loading ? <ActivityIndicator color={colors.lime} size="large" style={styles.loader} /> : null}
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.retry}>Réessayer</Text></Pressable></View> : null}
        {!loading && !error && items.length === 0 ? <Text style={styles.empty}>Aucun profil artiste publié pour le moment.</Text> : null}

        {!loading && !error && items.map((artist) => {
          const links = Object.entries(artist.links || {}).filter(([, url]) => Boolean(url));
          return (
            <View key={artist.id} style={styles.card}>
              {artist.photo_url ? <Image source={{ uri: artist.photo_url }} style={styles.photo} /> : null}
              <View style={styles.body}>
                <Text style={styles.name}>{artist.name}</Text>
                {(artist.genre || artist.city) ? <Text style={styles.meta}>{[artist.genre, artist.city].filter(Boolean).join(' · ')}</Text> : null}
                {artist.bio ? <Text style={styles.bio}>{artist.bio}</Text> : null}
                {links.length ? (
                  <View style={styles.links}>
                    {links.map(([label, url]) => (
                      <Pressable key={label} style={styles.linkChip} onPress={() => url && Linking.openURL(url)}>
                        <Text style={styles.linkText}>{label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
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
  page: { padding: 20, paddingTop: 24, paddingBottom: 36 },
  header: { marginBottom: 20 },
  kicker: { color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1.35 },
  heading: { marginTop: 7, color: colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  intro: { marginTop: 8, color: colors.muted, fontSize: 13, lineHeight: 19 },
  loader: { marginTop: 50 },
  errorBox: { padding: 20, borderRadius: 20, backgroundColor: colors.panelDark, borderWidth: 1, borderColor: colors.border },
  errorText: { color: colors.text },
  retry: { marginTop: 12, color: colors.lime, fontWeight: '900' },
  empty: { marginTop: 50, color: colors.muted, textAlign: 'center' },
  card: { marginBottom: 16, overflow: 'hidden', borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panelDark },
  photo: { width: '100%', height: 260, backgroundColor: '#0A244A' },
  body: { padding: 18 },
  name: { color: colors.text, fontSize: 25, fontWeight: '900', letterSpacing: -.6 },
  meta: { marginTop: 6, color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: .5 },
  bio: { marginTop: 12, color: colors.muted, fontSize: 12, lineHeight: 19 },
  links: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linkChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: 'rgba(57,220,255,.08)', borderWidth: 1, borderColor: 'rgba(57,220,255,.20)' },
  linkText: { color: colors.cyan, fontSize: 10, fontWeight: '900' },
});
