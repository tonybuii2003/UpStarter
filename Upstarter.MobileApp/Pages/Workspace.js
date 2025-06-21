import { StyleSheet, Text, View } from 'react-native';

export default function Workspace() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Workspace Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#41b06e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 20,
  },
}); 