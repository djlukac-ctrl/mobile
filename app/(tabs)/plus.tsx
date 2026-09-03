import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme';

export default function MoreScreen() {
  return <SafeAreaView style={styles.safe}><View style={styles.page}><Text style={styles.kicker}>L’ÉCHO DU DER</Text><Text style={styles.title}>Plus</Text><Text style={styles.text}>Partenaires, demandes de titres, votes et réglages arriveront ici.</Text></View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:colors.background}, page:{padding:24}, kicker:{color:colors.lime,fontSize:9,fontWeight:'900',letterSpacing:1.5}, title:{marginTop:8,color:colors.text,fontSize:34,fontWeight:'900'}, text:{marginTop:12,color:colors.muted,fontSize:14,lineHeight:21} });
