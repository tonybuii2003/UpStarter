// Pages/FoundersChat.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Client } from '@langchain/langgraph-sdk';

export default function FoundersChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const threadRef               = useRef(null);
  const clientRef               = useRef(null);
  const nextId                  = useRef(1);

  // 1️⃣ Init the SDK client
  useEffect(() => {
    clientRef.current = new Client({
      apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_API_URL,
      apiKey: process.env.LANGCHAIN_API_KEY,  // proxy in prod!
    });
    // Seed the first assistant message
    setMessages([{
      id: nextId.current++,
      role: 'assistant',
      text: 'What do you want to know about this startup?',
    }]);
  }, []);

  // 2️⃣ Send handler
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    // Append user message
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: 'user', text },
    ]);

    // Ensure thread exists
    if (!threadRef.current) {
      const { thread_id } = await clientRef.current.threads.create();
      threadRef.current = thread_id;
    }

    // Add a placeholder for the assistant reply
    const loadingId = nextId.current++;
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: 'assistant-temp', text: '' },
    ]);

    // Stream reply
    let reply = '';
    const stream = clientRef.current.runs.stream(
      threadRef.current,
      process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID,
      { input: { messages: [{ role: 'user', content: text }] }, streamMode: 'messages' }
    );
    for await (const chunk of stream) {
      reply += chunk.message.content;
      // Update the temp message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId ? { ...msg, text: reply } : msg
        )
      );
    }
    // Finalize it
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === loadingId
          ? { id: loadingId, role: 'assistant', text: reply }
          : msg
      )
    );
  }, [input]);

  // 3️⃣ Render each message
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.bubble,
        item.role === 'user'
          ? styles.userBubble
          : styles.assistantBubble,
      ]}
    >
      <Text
        style={[
          styles.bubbleText,
          item.role === 'user' ? styles.userText : styles.assistantText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.messages}
          inverted
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type your question…"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  messages: { padding: 12, flexGrow: 1, justifyContent: 'flex-end' },
  bubble: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userBubble:   { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  assistantBubble: { backgroundColor: '#F1F0F0', alignSelf: 'flex-start' },
  bubbleText: { fontSize: 16 },
  userText:  { color: '#000', fontWeight: '500' },
  assistantText: { color: '#000' },

  inputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
});
