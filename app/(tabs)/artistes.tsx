import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme';

export default function ArtistsScreen() {
  return <SafeAreaView style={styles.safe}><View style={styles.page}><Text style={styles.kicker}>TALENTS DU TERRITOIRE</Text><Text style={styles.title}>Artistes locaux</Text><Text style={styles.text}>Les profils artistes seront reliés au site dans la prochaine étape.</Text></View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:colors.background}, page:{padding:24}, kicker:{color:colors.lime,fontSize:9,fontWeight:'900',letterSpacing:1.5}, title:{marginTop:8,color:colors.text,fontSize:34,fontWeight:'900'}, text:{marginTop:12,color:colors.muted,fontSize:14,lineHeight:21} });
