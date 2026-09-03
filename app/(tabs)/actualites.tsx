import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme';

type NewsItem = {
  id: number;
  title: string;
  category?: string;
  summary?: string;
  content?: string;
  image_url?: string;
  venue?: string;
  city?: string;
  published_at?: string;
  article_url?: string;
};

const API = 'https://lechoduder.fr/api/news.php?limit=20';

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function excerpt(item: NewsItem) {
  const text = (item.summary || item.content || '').trim();
  return text.length > 145 ? `${text.slice(0, 142).trim()}…` : text;
}

export default function NewsScreen() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}&t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError('Impossible de charger les actualités pour le moment.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.page}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.lime} />}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>L’ÉCHO DU DER · AUTOUR DU LAC</Text>
          <Text style={styles.heading}>Actualités</Text>
          <Text style={styles.intro}>Radio, événements, artistes locaux, partenaires et sorties musicales.</Text>
        </View>

        {loading ? <ActivityIndicator color={colors.lime} size="large" style={styles.loader} /> : null}
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.retry}>Réessayer</Text></Pressable></View> : null}

        {!loading && !error && items.length === 0 ? <Text style={styles.empty}>Aucune actualité publiée pour le moment.</Text> : null}

        {items.map((item, index) => (
          <Pressable key={item.id} style={[styles.card, index === 0 && styles.cardFeatured]} onPress={() => item.article_url && Linking.openURL(item.article_url)}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={[styles.image, index === 0 && styles.imageFeatured]} /> : null}
            <View style={styles.cardBody}>
              {index === 0 ? <Text style={styles.latest}>LA DERNIÈRE ACTU</Text> : null}
              <View style={styles.metaRow}>
                <Text style={styles.category}>{item.category || 'ACTUALITÉ'}</Text>
                <Text style={styles.date}>{formatDate(item.published_at)}</Text>
              </View>
              <Text style={[styles.title, index === 0 && styles.titleFeatured]}>{item.title}</Text>
              {excerpt(item) ? <Text style={styles.summary}>{excerpt(item)}</Text> : null}
              {(item.venue || item.city) ? <Text style={styles.place}>📍 {[item.venue, item.city].filter(Boolean).join(' · ')}</Text> : null}
              <Text style={styles.read}>Lire l’actualité  →</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { padding: 20, paddingTop: 24, paddingBottom: 32 },
  header: { marginBottom: 22 },
  kicker: { color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  heading: { marginTop: 7, color: colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1.1 },
  intro: { marginTop: 9, maxWidth: 330, color: colors.muted, fontSize: 13, lineHeight: 20 },
  loader: { marginTop: 50 },
  errorBox: { padding: 20, borderRadius: 20, backgroundColor: colors.panelDark, borderWidth: 1, borderColor: colors.border },
  errorText: { color: colors.text, fontSize: 13 },
  retry: { marginTop: 12, color: colors.lime, fontWeight: '900' },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 50 },
  card: { marginBottom: 16, overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panelDark },
  cardFeatured: { borderColor: 'rgba(216,255,86,0.25)', backgroundColor: colors.panel },
  image: { width: '100%', height: 180, backgroundColor: '#0A244A' },
  imageFeatured: { height: 220 },
  cardBody: { padding: 18 },
  latest: { marginBottom: 10, color: colors.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  category: { flexShrink: 1, color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  date: { color: '#8194AD', fontSize: 10, fontWeight: '700' },
  title: { marginTop: 10, color: colors.text, fontSize: 20, lineHeight: 24, fontWeight: '900', letterSpacing: -0.45 },
  titleFeatured: { fontSize: 25, lineHeight: 29 },
  summary: { marginTop: 10, color: colors.muted, fontSize: 12, lineHeight: 18 },
  place: { marginTop: 10, color: '#D7E0EA', fontSize: 11, fontWeight: '700' },
  read: { marginTop: 14, color: colors.lime, fontSize: 11, fontWeight: '900' },
});
