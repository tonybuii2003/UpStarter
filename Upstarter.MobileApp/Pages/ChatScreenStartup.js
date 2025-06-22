
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import PotentialStartup from '../Components/PotentialStartups'; // Import your component

const { width: SCREEN_W } = Dimensions.get('window');

const ChatScreenStartup = ({ route, navigation }) => {
  const { startup } = route.params;
  const [messages, setMessages] = useState([
    {
      text: `Here's some information about ${startup.name}:`,
      sender: 'bot',
      component: (
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <PotentialStartup 
            compact={true}
            name={startup.name}
            industry={startup.industry}
            description={startup.about_content}
            logo={startup.logo_path}
            cofounders={startup.cofounders || []}
          />
        </TouchableOpacity>
      )
    },
    { 
      text: `Hi! I'm Upstarter AI. I can answer questions about ${startup.name} and their team. What would you like to know?`, 
      sender: 'bot',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef();
  const cancelTokenRef = useRef(null);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    // Add user message
    const userMessage = { text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Add temporary bot message
    const botMessageId = messages.length + 1;
    setMessages(prev => [...prev, { text: '', sender: 'bot', loading: true }]);
    
    // Cancel any existing request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New request initiated');
    }

    const cancelToken = axios.CancelToken.source();
    cancelTokenRef.current = cancelToken;

    try {
      const response = await axios.post(
        `http://10.56.121.148:8000/ask_stream/${startup.startup_id}`,
        { question: inputText },
        {
          cancelToken: cancelToken.token,
          headers: {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json'
          },
          responseType: 'text'
        }
      );

      // Process the streamed response
      const data = response.data;
      const lines = data.split('\n');
      let fullResponse = '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsedData = JSON.parse(line.substring(6));
            if (parsedData.text) {
              fullResponse += parsedData.text;
              setMessages(prev => 
                prev.map((msg, idx) => 
                  idx === botMessageId 
                    ? { ...msg, text: fullResponse, loading: false } 
                    : msg
                )
              );
            }
          } catch (error) {
            console.error('Error parsing event data:', error);
          }
        }
      }
      
      setIsLoading(false);
      cancelTokenRef.current = null;
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Request error:', error);
        setIsLoading(false);
        cancelTokenRef.current = null;
        
        setMessages(prev => [
          ...prev.slice(0, -1), 
          { text: 'Error occurred. Please try again.', sender: 'bot' }
        ]);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Clean up Axios request when component unmounts
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{startup.name}</Text>
        <Text style={styles.headerSubtitle}>AI Assistant</Text>
      </View>
      
      {/* Chat messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message, index) => (
          <View key={index}>
            {message.component ? (
              <TouchableOpacity 
                style={styles.componentContainer}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                {message.component}
              </TouchableOpacity>
            ) : (
              <View 
                style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.userBubble : styles.botBubble,
                  message.loading ? styles.loadingBubble : null
                ]}
              >
                {message.sender === 'bot' && (
                  <View style={styles.botAvatar}>
                    <Text style={styles.botAvatarText}>AI</Text>
                  </View>
                )}
                <View style={styles.messageContent}>
                  <Text style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.userBubbleText : styles.botBubbleText,
                    message.loading ? {backgroundColor: 'transparent'} : null
                  ]}>
                    {message.text}
                  </Text>
                  {message.loading && (
                    <View style={styles.loadingDots}>
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your question..."
          placeholderTextColor="#999"
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={isLoading || !inputText.trim()}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={isLoading || !inputText.trim() ? "#ccc" : "#1ecb8b"} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Modal for showing full startup details */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable 
            style={styles.modalBackdrop}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <ScrollView>
              <PotentialStartup 
                compact={false}
                name={startup.name}
                industry={startup.industry}
                description={startup.about_content}
                logo={startup.logo_path}
                businessPlan={startup.business_plan_content}
                cofounders={startup.cofounders || []}
              />
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1ecb8b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  botAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    padding: 12,
    borderRadius: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  userBubbleText: {
    backgroundColor: '#1ecb8b',
    color: '#fff',
  },
  botBubbleText: {
    backgroundColor: '#f0f0f0',
    color: '#333',
  },
  loadingDots: {
    flexDirection: 'row',
    paddingLeft: 12,
    paddingBottom: 12,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  componentContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: SCREEN_W * 0.9,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1ecb8b',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default ChatScreenStartup;