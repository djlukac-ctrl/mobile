import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { ActivityIndicator, Image, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRadio } from '../../src/RadioProvider';
import { colors } from '../../src/theme';

type Podcast = {
  id: number;
  show_name: string;
  title: string;
  guest?: string;
  description?: string;
  image_url?: string;
  audio_url?: string;
  duration?: string;
  listen_count?: number;
  published_at?: string;
};

const API = 'https://lechoduder.fr/api/podcasts.php?limit=30';
const LISTEN_API = 'https://lechoduder.fr/api/podcast-listen.php';

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default function PodcastsScreen() {
  const { playing: radioPlaying, toggle: toggleRadio } = useRadio();
  const [items, setItems] = useState<Podcast[]>([]);
  const [selected, setSelected] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const counted = useMemo(() => new Set<number>(), []);
  const player = useAudioPlayer(null, { updateInterval: 500 });

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}&t=${Date.now()}`);
      if (!response.ok) throw new Error('HTTP');
      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError('Impossible de charger les podcasts pour le moment.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const countListen = async (episode: Podcast) => {
    if (counted.has(episode.id)) return;
    counted.add(episode.id);
    try {
      const response = await fetch(LISTEN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: episode.id }),
      });
      if (!response.ok) return;
      const data = await response.json();
      setItems((current) => current.map((item) => item.id === episode.id ? { ...item, listen_count: Number(data.listen_count || 0) } : item));
    } catch {}
  };

  const playEpisode = async (episode: Podcast) => {
    if (!episode.audio_url) return;
    if (radioPlaying) toggleRadio();
    if (playingId === episode.id) {
      player.pause();
      setPlayingId(null);
      return;
    }
    setSelected(episode);
    player.replace(episode.audio_url);
    player.play();
    setPlayingId(episode.id);
    setTimeout(() => countListen(episode), 8000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.lime} />}>
        <View style={styles.header}>
          <Text style={styles.kicker}>L’ÉCHO DU DER · À RÉÉCOUTER</Text>
          <Text style={styles.heading}>Podcasts</Text>
          <Text style={styles.intro}>Interviews, rencontres et voix locales à écouter quand tu veux.</Text>
        </View>

        {selected ? (
          <View style={styles.nowCard}>
            <Text style={styles.nowKicker}>EN COURS DE LECTURE</Text>
            <Text style={styles.nowTitle}>{selected.title}</Text>
            <Text style={styles.nowMeta}>{selected.show_name}{selected.guest ? ` · ${selected.guest}` : ''}</Text>
          </View>
        ) : null}

        {loading ? <ActivityIndicator color={colors.lime} size="large" style={styles.loader} /> : null}
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.retry}>Réessayer</Text></Pressable></View> : null}

        {!loading && !error && items.map((item, index) => (
          <View key={item.id} style={[styles.card, index === 0 && styles.featured]}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : null}
            <View style={styles.body}>
              <Text style={styles.show}>{index === 0 ? 'DERNIER ÉPISODE · ' : ''}{item.show_name}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{[item.guest, formatDate(item.published_at), item.duration].filter(Boolean).join(' · ')}</Text>
              {item.description ? <Text style={styles.description} numberOfLines={3}>{item.description}</Text> : null}
              <View style={styles.bottomRow}>
                <Pressable style={[styles.playButton, playingId === item.id && styles.playButtonActive]} onPress={() => playEpisode(item)}>
                  <Text style={styles.playText}>{playingId === item.id ? 'Ⅱ  Pause' : '▶  Écouter'}</Text>
                </Pressable>
                <Text style={styles.listens}>🎧 {Number(item.listen_count || 0)} écoute{Number(item.listen_count || 0) > 1 ? 's' : ''}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { padding: 20, paddingTop: 24, paddingBottom: 36 },
  header: { marginBottom: 20 },
  kicker: { color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  heading: { marginTop: 7, color: colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  intro: { marginTop: 8, color: colors.muted, fontSize: 13, lineHeight: 19 },
  nowCard: { marginBottom: 16, padding: 16, borderRadius: 18, backgroundColor: 'rgba(57,220,255,.08)', borderWidth: 1, borderColor: 'rgba(57,220,255,.22)' },
  nowKicker: { color: colors.cyan, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  nowTitle: { marginTop: 6, color: colors.text, fontSize: 18, fontWeight: '900' },
  nowMeta: { marginTop: 4, color: colors.muted, fontSize: 11 },
  loader: { marginTop: 50 },
  errorBox: { padding: 20, borderRadius: 20, backgroundColor: colors.panelDark, borderWidth: 1, borderColor: colors.border },
  errorText: { color: colors.text },
  retry: { marginTop: 12, color: colors.lime, fontWeight: '900' },
  card: { marginBottom: 15, overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panelDark },
  featured: { borderColor: 'rgba(216,255,86,.22)', backgroundColor: colors.panel },
  image: { width: '100%', height: 200, backgroundColor: '#0A244A' },
  body: { padding: 17 },
  show: { color: colors.lime, fontSize: 8, fontWeight: '900', letterSpacing: .9 },
  title: { marginTop: 8, color: colors.text, fontSize: 21, lineHeight: 25, fontWeight: '900' },
  meta: { marginTop: 7, color: '#8FA3BB', fontSize: 10, fontWeight: '700' },
  description: { marginTop: 10, color: colors.muted, fontSize: 12, lineHeight: 18 },
  bottomRow: { marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  playButton: { paddingHorizontal: 16, minHeight: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime },
  playButtonActive: { backgroundColor: '#F4F6F8' },
  playText: { color: '#07172C', fontSize: 12, fontWeight: '900' },
  listens: { flexShrink: 1, color: colors.muted, fontSize: 10, fontWeight: '700' },
});
