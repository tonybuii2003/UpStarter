// Create a new file: Components/ModeSwitcher.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useMode } from '../context/ModeContext';

const ModeSwitcher = () => {
  const { mode, toggleMode } = useMode();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, mode === 'founder' && styles.activeButton]}
        onPress={() => toggleMode()}
      >
        <Text style={[styles.text, mode === 'founder' && styles.activeText]}>Founder</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, mode === 'investor' && styles.activeButton]}
        onPress={() => toggleMode()}
      >
        <Text style={[styles.text, mode === 'investor' && styles.activeText]}>Investor</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    padding: 2,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 18,
    flex: 1,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#41b06e',
  },
  text: {
    color: '#666',
    fontWeight: 'bold',
  },
  activeText: {
    color: 'white',
  },
});

export default ModeSwitcher;