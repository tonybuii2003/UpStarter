import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image} from 'react-native';
import  {LinearGradient}  from 'expo-linear-gradient'; // Changed import
import PotentialMatch from '../Components/PotentialMatch';
import { Ionicons } from '@expo/vector-icons';

export default function Matching() {
  return (
    <View
      colors={["#6A8DFF", "#1E4D91"]}
      style={styles.gradient}
     
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* PotentialMatch card will go here */}
        <PotentialMatch />
      </ScrollView>
      {/* Floating Action Buttons */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <TouchableOpacity style={styles.fabAccept}>
          <Ionicons name="checkmark" size={36} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabReject}>
          <Ionicons name="close" size={36} color="#1ecb8b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,

  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  cardPlaceholder: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    backgroundColor: '#f8f8f8',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    color: '#1E4D91',
    fontSize: 20,
    fontWeight: 'bold',
  },

  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'space-between',
    zIndex: 10,
    pointerEvents: 'box-none',

  },
  fabAccept: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1ecb8b',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '18%',
    borderWidth: 2,
    borderColor: '#1ecb8b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  fabReject: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '18%',
    borderWidth: 2,
    borderColor: '#1ecb8b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 6,
  },
  logoImageMatch: {
    width: "35%",
    height: 100,
    resizeMode: 'contain',

  },
  logoImageContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingTop: 18,
    paddingRight: 24,
  }
}); 