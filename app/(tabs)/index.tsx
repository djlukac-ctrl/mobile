import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRadio } from '../../src/RadioProvider';
import { colors } from '../../src/theme';

const API_BASE = 'https://lechoduder.fr';

type RequestMode = 'request' | 'suggest';

export default function HomeScreen() {
  const { nowPlaying, playing, loading, toggle } = useRadio();
  const [voteBusy, setVoteBusy] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');
  const [requestMode, setRequestMode] = useState<RequestMode | null>(null);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestArtist, setRequestArtist] = useState('');
  const [requestBusy, setRequestBusy] = useState(false);

  const vote = async (value: 1 | -1) => {
    if (voteBusy) return;
    setVoteBusy(true);
    setVoteMessage('');
    try {
      const response = await fetch(`${API_BASE}/api/vote.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Vote impossible.');
      setVoteMessage(value === 1 ? 'Ton vote positif est enregistré.' : 'Ton vote négatif est enregistré.');
    } catch (error) {
      setVoteMessage(error instanceof Error ? error.message : 'Vote impossible.');
    } finally {
      setVoteBusy(false);
    }
  };

  const openRequest = (mode: RequestMode) => {
    setRequestMode(mode);
    setRequestTitle('');
    setRequestArtist('');
  };

  const submitRequest = async () => {
    if (requestBusy || !requestTitle.trim()) return;
    setRequestBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/request.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: requestTitle.trim(), artist: requestArtist.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Envoi impossible.');
      setRequestMode(null);
      Alert.alert(requestMode === 'suggest' ? 'Suggestion envoyée' : 'Demande envoyée', requestMode === 'suggest' ? 'Merci ! Ton titre a bien été proposé à L’Écho du Der.' : (data?.message || 'Ta demande a bien été envoyée.'));
    } catch (error) {
      Alert.alert('Impossible d’envoyer', error instanceof Error ? error.message : 'Réessaie dans quelques instants.');
    } finally {
      setRequestBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
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
          <Text style={styles.sectionKicker}>TON AVIS COMPTE</Text>
          <Text style={styles.sectionTitle}>Tu aimes ce titre ?</Text>
          <View style={styles.voteRow}>
            <Pressable style={[styles.voteButton, styles.voteUp]} disabled={voteBusy} onPress={() => vote(1)}><Text style={styles.voteEmoji}>👍</Text><Text style={styles.voteTextDark}>J’aime</Text></Pressable>
            <Pressable style={[styles.voteButton, styles.voteDown]} disabled={voteBusy} onPress={() => vote(-1)}><Text style={styles.voteEmoji}>👎</Text><Text style={styles.voteText}>Pas pour moi</Text></Pressable>
          </View>
          {voteMessage ? <Text style={styles.feedback}>{voteMessage}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>À TOI DE JOUER</Text>
          <Text style={styles.sectionTitle}>Qu’est-ce qu’on diffuse ?</Text>
          <Text style={styles.sectionText}>Demande un morceau maintenant ou propose-nous un titre à ajouter à la programmation.</Text>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionPrimary} onPress={() => openRequest('request')}><Text style={styles.actionPrimaryText}>Demander un titre</Text></Pressable>
            <Pressable style={styles.actionSecondary} onPress={() => openRequest('suggest')}><Text style={styles.actionSecondaryText}>Suggérer un titre</Text></Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={requestMode !== null} transparent animationType="fade" onRequestClose={() => setRequestMode(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>{requestMode === 'suggest' ? 'SUGGESTION' : 'DEMANDE DE TITRE'}</Text>
            <Text style={styles.modalTitle}>{requestMode === 'suggest' ? 'Proposer un morceau' : 'Quel titre veux-tu entendre ?'}</Text>
            <TextInput style={styles.input} value={requestTitle} onChangeText={setRequestTitle} placeholder="Titre du morceau" placeholderTextColor="#71849D" autoFocus />
            <TextInput style={styles.input} value={requestArtist} onChangeText={setRequestArtist} placeholder="Artiste (facultatif)" placeholderTextColor="#71849D" />
            <Pressable style={[styles.modalSubmit, (!requestTitle.trim() || requestBusy) && styles.disabled]} disabled={!requestTitle.trim() || requestBusy} onPress={submitRequest}>
              {requestBusy ? <ActivityIndicator color="#07172C" /> : <Text style={styles.modalSubmitText}>Envoyer</Text>}
            </Pressable>
            <Pressable style={styles.modalCancel} onPress={() => setRequestMode(null)}><Text style={styles.modalCancelText}>Annuler</Text></Pressable>
          </View>
        </View>
      </Modal>
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
  section: { marginTop: 18, padding: 20, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(6,26,61,0.72)' },
  sectionKicker: { color: colors.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  sectionTitle: { marginTop: 8, color: colors.text, fontSize: 23, fontWeight: '900', letterSpacing: -0.6 },
  sectionText: { marginTop: 9, color: colors.muted, fontSize: 12, lineHeight: 18 },
  voteRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  voteButton: { flex: 1, minHeight: 50, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  voteUp: { backgroundColor: colors.lime },
  voteDown: { backgroundColor: '#0B2A55', borderWidth: 1, borderColor: colors.border },
  voteEmoji: { fontSize: 16 },
  voteTextDark: { color: '#07172C', fontSize: 12, fontWeight: '900' },
  voteText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  feedback: { marginTop: 10, color: colors.muted, fontSize: 11 },
  actionRow: { gap: 10, marginTop: 16 },
  actionPrimary: { minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime },
  actionPrimaryText: { color: '#07172C', fontSize: 13, fontWeight: '900' },
  actionSecondary: { minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(57,220,255,0.35)', backgroundColor: 'rgba(57,220,255,0.06)' },
  actionSecondaryText: { color: colors.cyan, fontSize: 13, fontWeight: '900' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,7,22,0.82)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  modalCard: { width: '100%', borderRadius: 26, padding: 22, backgroundColor: '#071D41', borderWidth: 1, borderColor: 'rgba(216,255,86,0.18)' },
  modalKicker: { color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  modalTitle: { marginTop: 8, marginBottom: 18, color: colors.text, fontSize: 24, lineHeight: 28, fontWeight: '900' },
  input: { height: 52, marginBottom: 10, paddingHorizontal: 15, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: '#04142F', color: colors.text, fontSize: 14 },
  modalSubmit: { height: 52, marginTop: 4, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime },
  modalSubmitText: { color: '#07172C', fontSize: 13, fontWeight: '900' },
  disabled: { opacity: 0.5 },
  modalCancel: { height: 44, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
});
