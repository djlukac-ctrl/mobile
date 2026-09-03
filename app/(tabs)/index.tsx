import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRadio } from '../../src/RadioProvider';
import { colors } from '../../src/theme';

export default function HomeScreen() {
  const { nowPlaying, playing, loading, toggle } = useRadio();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.brandWrap}>
          <Text style={styles.brand}>L’ÉCHO DU DER</Text>
          <Text style={styles.tagline}>LA RADIO DU LAC DU DER</Text>
        </View>

        <View style={styles.liveCard}>
          <Text style={styles.eyebrow}>● EN CE MOMENT · EN DIRECT</Text>
          <View style={styles.trackRow}>
            <View style={styles.coverWrap}>
              {nowPlaying?.cover ? <Image source={{ uri: nowPlaying.cover }} style={styles.cover} /> : <View style={[styles.cover, styles.coverFallback]}><Text style={styles.coverText}>ÉD</Text></View>}
            </View>
            <View style={styles.trackCopy}>
              {loading ? <ActivityIndicator color={colors.lime} /> : null}
              <Text style={styles.title} numberOfLines={2}>{nowPlaying?.title || 'L’Écho du Der'}</Text>
              <Text style={styles.artist} numberOfLines={1}>{nowPlaying?.artist || 'La radio du Lac du Der'}</Text>
              <Text style={styles.listeners}>🎧 {Number(nowPlaying?.listeners || 0)} auditeur{Number(nowPlaying?.listeners || 0) > 1 ? 's' : ''} à l’écoute</Text>
            </View>
          </View>
          <Pressable style={[styles.playButton, playing && styles.playButtonPlaying]} onPress={toggle}>
            <Text style={styles.playIcon}>{playing ? 'Ⅱ' : '▶'}</Text>
            <Text style={styles.playLabel}>{playing ? 'Mettre en pause' : 'Écouter le direct'}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>L’ÉCHO DU DER</Text>
          <Text style={styles.sectionTitle}>La radio dans ta poche.</Text>
          <Text style={styles.sectionText}>Le direct continue pendant que tu navigues dans l’application. Retrouve maintenant les actualités du Der depuis l’onglet dédié.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  brandWrap: { alignItems: 'center', marginBottom: 34 },
  brand: { color: colors.text, fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  tagline: { marginTop: 5, color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  liveCard: { padding: 22, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(216,255,86,0.20)', backgroundColor: colors.panel },
  eyebrow: { color: colors.lime, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 18 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  coverWrap: { borderRadius: 20, overflow: 'hidden' },
  cover: { width: 108, height: 108, borderRadius: 20 },
  coverFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.panelDark },
  coverText: { color: colors.lime, fontSize: 32, fontWeight: '900' },
  trackCopy: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontSize: 26, lineHeight: 29, fontWeight: '900', letterSpacing: -0.8 },
  artist: { marginTop: 6, color: '#D7E0EA', fontSize: 16, fontWeight: '700' },
  listeners: { marginTop: 12, color: colors.muted, fontSize: 11, fontWeight: '600' },
  playButton: { marginTop: 22, minHeight: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, backgroundColor: colors.lime },
  playButtonPlaying: { backgroundColor: '#F3F6F8' },
  playIcon: { color: '#07172C', fontSize: 16, fontWeight: '900' },
  playLabel: { color: '#07172C', fontSize: 15, fontWeight: '900' },
  section: { marginTop: 24, padding: 20, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(6,26,61,0.72)' },
  sectionKicker: { color: colors.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  sectionTitle: { marginTop: 8, color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.6 },
  sectionText: { marginTop: 10, color: colors.muted, fontSize: 13, lineHeight: 20 },
});
