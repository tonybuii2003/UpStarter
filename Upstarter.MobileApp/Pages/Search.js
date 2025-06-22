import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView
} from 'react-native';
import ChatInputBar from '../Components/ChatInputBar';
import { Ionicons } from '@expo/vector-icons';

// A simple bot that replies to messages
const useChatBot = (addMessage) => {
  const reply = (message) => {
    const botMessage = {
      id: Math.random().toString(),
      text: `I'm a bot, and I received your message: "${message.text}"`,
      timestamp: new Date(),
      isUser: false,
    };
    setTimeout(() => addMessage(botMessage), 1000); // Simulate network delay
  };

  return { reply };
};

export default function Search() {
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  const addMessage = useCallback((newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    // Scroll to the bottom when a new message is added
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const bot = useChatBot(addMessage);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    const userMessage = {
      id: Math.random().toString(),
      text,
      timestamp: new Date(),
      isUser: true,
    };
    addMessage(userMessage);
    bot.reply(userMessage); // Bot replies to the user's message
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageRow, item.isUser ? styles.userMessageRow : styles.botMessageRow]}>
      {!item.isUser && <Ionicons name="logo-android" size={24} color="#1ecb8b" style={styles.botIcon} />}
      <View style={[styles.messageBubble, item.isUser ? styles.userMessageBubble : styles.botMessageBubble]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
                <Ionicons name="search" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Ask me anything!</Text>
                <Text style={styles.emptySubText}>
                    You can ask about startups, founders, funding, or anything else.
                </Text>
            </View>
          )}
        />
        <ChatInputBar onSendMessage={handleSendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  messageList: {
    flexGrow: 1,
    padding: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessageRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: '#007bff',
  },
  botMessageBubble: {
    backgroundColor: '#f1f0f0',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  botIcon: {
      marginRight: 8,
      alignSelf: 'flex-end'
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  emptyText: {
      fontSize: 22,
      fontWeight: 'bold',
      marginTop: 16,
      color: '#555'
  },
  emptySubText: {
      fontSize: 16,
      color: '#aaa',
      textAlign: 'center',
      marginTop: 8,
  }
}); 