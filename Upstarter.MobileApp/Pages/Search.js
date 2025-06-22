import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
  TouchableOpacity
} from 'react-native';
import ChatInputBar from '../Components/ChatInputBar';
import SimplifiedPotentialMatch from '../Components/SimplifiedPotentialMatch';
import SimplifiedMatchStartup from '../Components/SimplifiedMatchStartup';
import { Ionicons } from '@expo/vector-icons';
import { SERVER_URL } from '../constants/constants';

// API call to the agent_user_qa endpoint
const callAgentUserQA = async (user_id, query) => {
  try {
    const response = await fetch(`${SERVER_URL}/agent_user_qa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        question: query
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling agent_user_qa:', error);
    throw error;
  }
};

export default function Search() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const flatListRef = useRef(null);

  const addMessage = useCallback((newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    // Scroll to the bottom when a new message is added
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleAccept = () => {
    // Handle accept logic here
    console.log('Accepted:', selectedUser);
    setModalVisible(false);
    setSelectedUser(null);
    // You can add additional logic here like sending to backend, etc.
  };

  const handleReject = () => {
    // Handle reject logic here
    console.log('Rejected:', selectedUser);
    setModalVisible(false);
    setSelectedUser(null);
    // You can add additional logic here like sending to backend, etc.
  };

  const renderModalContent = (item) => {
    if (!item) return null;
    
    // Check if it's a startup by looking for startup-specific properties
    const isStartup = item.business_plan_content !== undefined || item.industry !== undefined;
    
    if (isStartup) {
      return (
        <SimplifiedMatchStartup
          compact={false}
          name={item.name || "Unknown Startup"}
          logo_path={item.logo_path || ""}
          business_plan_content={item.business_plan_content || ""}
          about_content={item.about_content || ""}
          industry={item.industry || ""}
          cofounders={item.cofounders || []}
        />
      );
    } else {
      return (
        <SimplifiedPotentialMatch
          compact={false}
          name={item.name || "Unknown"}
          university={item.university || ""}
          major={item.major || ""}
          education_level={item.education_level || ""}
          about_me={item.about_me || ""}
          seed={item.seed || 1}
        />
      );
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMessage = {
      id: Math.random().toString(),
      text,
      timestamp: new Date(),
      isUser: true,
    };
    addMessage(userMessage);
    
    // Show loading indicator
    setIsLoading(true);
    const loadingMessage = {
      id: Math.random().toString(),
      text: '',
      timestamp: new Date(),
      isUser: false,
      isLoading: true,
    };
    addMessage(loadingMessage);
    
    try {
      // Call the API with user_id: 1 and the current query
      const response = await callAgentUserQA(1, text);
      
      // Remove loading message and add the actual response
      setMessages((prevMessages) => 
        prevMessages.filter(msg => !msg.isLoading)
      );
      
      // Create the bot message based on response type
      const botMessage = {
        id: Math.random().toString(),
        text: response.content,
        timestamp: new Date(),
        isUser: false,
        type: response.type, // 'text', 'user_ids', or 'startup_ids'
        userData: response.type === 'user_ids' || response.type === 'startup_ids' ? response.content : null,
      };
      addMessage(botMessage);
      
    } catch (error) {
      // Remove loading message and add error message
      setMessages((prevMessages) => 
        prevMessages.filter(msg => !msg.isLoading)
      );
      
      const errorMessage = {
        id: Math.random().toString(),
        text: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
        isUser: false,
        isError: true,
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageRow, item.isUser ? styles.userMessageRow : styles.botMessageRow]}>
      {!item.isUser && <Ionicons name="logo-android" size={24} color="#1ecb8b" style={styles.botIcon} />}
      <View style={[styles.messageBubble, item.isUser ? styles.userMessageBubble : styles.botMessageBubble]}>
        {item.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#1ecb8b" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        ) : item.type === 'user_ids' && item.userData ? (
          <View style={styles.userListContainer}>
            {item.userData.map((user, index) => (
              <View key={index} style={styles.userItemContainer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleUserSelect(user)}
                  style={styles.smallCardContainer}
                >
                  <SimplifiedPotentialMatch
                    compact={true}
                    name={user.name || "Unknown"}
                    university={user.university || ""}
                    major={user.major || ""}
                    education_level={user.education_level || ""}
                    about_me={user.about_me || ""}
                    seed={user.seed || index}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : item.type === 'startup_ids' && item.userData ? (
          <View style={styles.userListContainer}>
            {item.userData.map((startup, index) => (
              <View key={index} style={styles.userItemContainer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleUserSelect(startup)}
                  style={styles.smallCardContainer}
                >
                  <SimplifiedMatchStartup
                    compact={true}
                    name={startup.name || "Unknown Startup"}
                    logo_path={startup.logo_path || ""}
                    business_plan_content={startup.business_plan_content || ""}
                    about_content={startup.about_content || ""}
                    industry={startup.industry || ""}
                    cofounders={startup.cofounders || []}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[item.isUser ? styles.messageText : styles.botmessageText, item.isError && styles.errorText]}>{item.text}</Text>
        )}
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

      {/* Zoom-in Modal */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {selectedUser && renderModalContent(selectedUser)}
            </ScrollView>
            
            {/* FABs inside modal */}
            {selectedUser && (
              <View style={styles.modalFabContainer}>
                <TouchableOpacity style={styles.fabAccept} onPress={handleAccept}>
                  <Ionicons name="checkmark" size={32} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.fabReject} onPress={handleReject}>
                  <Ionicons name="close" size={32} color="#1ecb8b" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#black',
    marginRight: '10%',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  botmessageText: {
    fontSize: 16,
    color: 'black',
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
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1ecb8b',
  },
  errorText: {
    color: 'red',
  },
  userListContainer: {
    paddingVertical: 5,
  },
  userItemContainer: {
    marginBottom: 2,
  },
  smallCardContainer: {
    transform: [{ scale: 0.7 }],
    marginVertical: -30,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    flex: 1,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalFabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  fabAccept: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1ecb8b',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabReject: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1ecb8b',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
}); 