import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function ChatInputBar({
  onSendMessage,
  onSendImage,
  onRecordAudio,
  leftIconSource,
}) {
  const [message, setMessage] = useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.leftSquare}>
        {leftIconSource ? (
          <Image source={leftIconSource} style={styles.leftIcon} />
        ) : (
          <Ionicons name="apps" size={24} color="#0ACF83" />
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Message..."
        value={message}
        onChangeText={setMessage}
        placeholderTextColor="#888"
        multiline={true}
        textAlignVertical="top"
        maxLength={1000}
      />
      <TouchableOpacity style={styles.iconButton} onPress={onSendImage}>
        <Ionicons name="image-outline" size={24} color="#0ACF83" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={onRecordAudio}>
        <MaterialIcons name="keyboard-voice" size={24} color="#0ACF83" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#0ACF83',
    borderRadius: 12,
    margin: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  leftSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#0ACF83',
  },
  leftIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 0,
    fontSize: 16,
    color: '#222',
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconButton: {
    padding: 6,
    marginLeft: 2,
    alignSelf: 'flex-end',
  },
}); 