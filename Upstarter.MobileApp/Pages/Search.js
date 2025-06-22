import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // or any other icon library you prefer

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0ACF83',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'Comfortaa-Regular',
    fontSize: 16,
    color: '#333',
  },
});