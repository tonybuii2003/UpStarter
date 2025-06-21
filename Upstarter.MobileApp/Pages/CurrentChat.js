import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ChatInputBar from '../Components/ChatInputBar';

export default function CurrentChat({ route }) {
  const { name, profileImage } = route.params;
  const navigation = useNavigation();

  // Placeholder handlers
  const handleSendMessage = () => {};
  const handleSendImage = () => {};
  const handleRecordAudio = () => {};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={profileImage} style={styles.avatar} />
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.messagesPlaceholder}>
          <Text style={styles.placeholderText}>Messages will appear here...</Text>
        </View>
        <ChatInputBar
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          onRecordAudio={handleRecordAudio}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    zIndex: -1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  messagesPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 18,
  },
}); 