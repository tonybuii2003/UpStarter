import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, Modal, Pressable, TextInput, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { SERVER_URL } from '../constants/constants';
import { 
  CompanyDescriptionModal, 
  BusinessOpportunityModal, 
  BusinessPlanModal, 
  MarketingPlanModal 
} from '../Components/WorkspaceModals';
import PotentialMatch from '../Components/PotentialMatch';

// Mock data based on the image
const teamMembers = [
    { name: 'Victor Samsonov', role: 'Founder | Backend Developer', user_id: 2001 },
    { name: 'Tony Bui', role: 'Founder | Frontend Developer', user_id: 2002 },
    { name: 'Maria Fernandes', role: 'Founder | UX Designer', user_id: 2003 },
];

const planItems = [
    'Company Description',
    'Business Opportunity',
    'Business Plan',
    'Marketing Plan',
];

export default function Workspace() {
  const [isChatModalVisible, setChatModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // Modal states for plan items
  const [modalStates, setModalStates] = useState({
    companyDescription: false,
    businessOpportunity: false,
    businessPlan: false,
    marketingPlan: false,
  });

  // Plan content state - can be updated from API calls
  const [planContent, setPlanContent] = useState({
    'Company Description': '',
    'Business Opportunity': '',
    'Business Plan': '',
    'Marketing Plan': '',
  });

  // PotentialMatch modal state
  const [isPotentialMatchModalVisible, setPotentialMatchModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openModal = (modalName) => {
    setModalStates(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModalStates(prev => ({ ...prev, [modalName]: false }));
  };

  const handleTeamMemberTap = async (member) => {
    console.log("=== TEAM MEMBER TAPPED ===");
    console.log("Member:", member);
    console.log("Member name:", member.name);
    console.log("Member role:", member.role);
    console.log("Member user_id:", member.user_id);
    console.log("==========================");
    
    try {
      // Fetch user data from the API
      const response = await axios.post(`${SERVER_URL}/get_user_by_id`, {
        user_id: member.user_id
      });
      
      console.log("=== API RESPONSE ===");
      console.log("Response:", response.data);
      console.log("Response success:", response.data.success);
      console.log("Response content:", response.data.content);
      console.log("====================");
      
      if (response.data.success && response.data.content) {
        // Use the name from the API response content
        const userData = response.data.content;
        console.log("=== SETTING SELECTED USER ===");
        console.log("User data:", userData);
        console.log("=============================");
        
        // Unnest the user data to extract specific fields
        const unnestedUser = {
          name: userData.name || member.name,
          university: userData.university || "",
          major: userData.major || "",
          education_level: userData.education_level || "",
          about_me: userData.about_me || ""
        };
        
        console.log("=== UNNESTED USER DATA ===");
        console.log("Unnested user:", unnestedUser);
        console.log("==========================");
        
        setSelectedUser(unnestedUser);
        console.log("unnestedUser", unnestedUser)
        setPotentialMatchModalVisible(true);
        console.log("selectedUser", selectedUser)
      }
    } catch (error) {
      console.error('=== ERROR FETCHING USER DATA ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('===============================');
      
      // Fallback: show modal with basic member info
      console.log("=== FALLBACK MODE ===");
      console.log("Using fallback member data:", {
        name: member.name,
        role: member.role,
        user_id: member.user_id
      });
      console.log("=====================");
      
      // Create unnested user data for fallback
      const fallbackUser = {
        name: member.name,
        university: "",
        major: "",
        education_level: "",
        about_me: ""
      };
      
      console.log("=== FALLBACK UNNESTED USER ===");
      console.log("Fallback user:", fallbackUser);
      console.log("==============================");
      
      setSelectedUser(fallbackUser);
      setPotentialMatchModalVisible(true);
    }
  };

  const addMessage = useCallback((newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    // Scroll to the bottom when a new message is added
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      id: Math.random().toString(),
      text: inputText.trim(),
      timestamp: new Date(),
      isUser: true,
    };
    addMessage(userMessage);
    setInputText('');
    
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
      // Call the agent_workspace endpoint
      const response = await axios.post(`${SERVER_URL}/agent_workspace`, {
        question: inputText.trim()
      });
      
      // Remove loading message and add the actual response
      setMessages((prevMessages) => 
        prevMessages.filter(msg => !msg.isLoading)
      );
      
      // Handle different response types and update plan content
      const responseType = response.data.type;
      const responseContent = response.data.content;
      
      if (responseType && responseContent) {
        // Map response types to plan content keys
        const typeToPlanMap = {
          'business_plan': 'Business Plan',
          'marketing_plan': 'Marketing Plan',
          'company_description': 'Company Description',
          'business_opportunity': 'Business Opportunity'
        };
        
        const planKey = typeToPlanMap[responseType];
        if (planKey) {
          // Update the plan content
          setPlanContent(prev => ({
            ...prev,
            [planKey]: responseContent
          }));
          
          // Create a success message indicating the content was updated
          const successMessage = {
            id: Math.random().toString(),
            text: `✅ Updated ${planKey}! You can now view it by tapping the "${planKey}" button.`,
            timestamp: new Date(),
            isUser: false,
            type: 'update_success',
          };
          addMessage(successMessage);
          
          // Also show the actual content in the chat
          const contentMessage = {
            id: Math.random().toString(),
            text: responseContent,
            timestamp: new Date(),
            isUser: false,
            type: responseType,
          };
          addMessage(contentMessage);
        } else {
          // Regular text response
          const botMessage = {
            id: Math.random().toString(),
            text: responseContent,
            timestamp: new Date(),
            isUser: false,
            type: responseType || 'text',
          };
          addMessage(botMessage);
        }
      } else {
        // Fallback for regular text responses
        const botMessage = {
          id: Math.random().toString(),
          text: response.data.content,
          timestamp: new Date(),
          isUser: false,
          type: 'text',
        };
        addMessage(botMessage);
      }
      
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
        ) : (
          <View>
            <Text style={[styles.messageText, item.isError && styles.errorText]}>{item.text}</Text>
            {item.type && item.type !== 'text' && (
              <Text style={styles.messageType}>Type: {item.type}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.headerTitle}>Work Space</Text>

        {/* Startup Info */}
        <View style={styles.startupInfoContainer}>
        <Image source={require('../assets/images/upstarterlogo.png')} style={styles.logo} />
          <View style={styles.startupTextContainer}>
            <Text style={styles.startupName}>upstarter</Text>
            <Text style={styles.startupDetail}>Upstart in 6/21/2025</Text>
            <Text style={styles.startupDetail}>Chicago based</Text>
          </View>
        </View>

        {/* About & Mission Box */}
        <View style={styles.aboutBox}>
          <Text style={styles.aboutTitle}>About us:</Text>
          <Text style={styles.aboutText}>
            UpStart is a startup matchmaking platform designed to connect aspiring entrepreneurs with shared visions, complementary skills, and a drive to build. We focus on early-stage founders — especially those new to the job market — helping them find co-founders, collaborators, and mentors to launch their first venture with confidence.
            By simplifying team formation and offering access to curated startup matches, Upstarted makes entering the startup world more accessible and less isolating. For investors, we're building a pipeline of high-potential early teams and ideas, right from the ground up.
          </Text>
          <Text style={styles.missionTitle}>Our Mission:</Text>
          <Text style={styles.aboutText}>
            Our mission is to make entrepreneurship more accessible by connecting aspiring founders with shared ideas, skills, and goals — empowering them to build together and grow faster.
          </Text>
        </View>

        {/* Team Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Team:</Text>
          {teamMembers.map((member, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.itemBox}
              onPress={() => handleTeamMemberTap(member)}
            >
              <FontAwesome5 name="rocket" size={16} color="#333" style={styles.itemIcon} />
              <Text style={styles.itemText}>{member.role}: <Text style={styles.itemName}>{member.name}</Text></Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>

        {/* Plan Section */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Our Plan:</Text>
            {planItems.map((item, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.planButton}
                    onPress={() => {
                        const modalMap = {
                            'Company Description': 'companyDescription',
                            'Business Opportunity': 'businessOpportunity',
                            'Business Plan': 'businessPlan',
                            'Marketing Plan': 'marketingPlan'
                        };
                        openModal(modalMap[item]);
                    }}
                >
                    <Text style={styles.planButtonText}>{item}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color="#007bff" />
            </TouchableOpacity>
        </View>

        {/* View Toggles */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>User View:</Text>
            <TouchableOpacity style={styles.itemBox}>
                <Text style={styles.itemText}>Modify</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Investor View:</Text>
            <TouchableOpacity style={styles.itemBox}>
                <Text style={styles.itemText}>Modify</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setChatModalVisible(true)}
        >
            <MaterialCommunityIcons name="robot-happy-outline" size={28} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="#007bff" />
        </TouchableOpacity>
      </View>

      {/* Chat Modal */}
      <Modal
        visible={isChatModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setChatModalVisible(false)}
      >
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setChatModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#007bff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Workspace Assistant</Text>
            <View style={styles.placeholder} />
          </View>
          
          <KeyboardAvoidingView 
            style={styles.modalContent}
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
                  <Ionicons name="robot" size={60} color="#ccc" />
                  <Text style={styles.emptyText}>Ask me about your workspace!</Text>
                  <Text style={styles.emptySubText}>
                    I can help with business plans, marketing strategies, and more.
                  </Text>
                </View>
              )}
            />
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor="#888"
                multiline={true}
                maxLength={1000}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={24} 
                  color={inputText.trim() ? "#007bff" : "#ccc"} 
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Plan Item Modals */}
      <CompanyDescriptionModal
        visible={modalStates.companyDescription}
        onClose={() => closeModal('companyDescription')}
        content={planContent['Company Description']}
      />
      
      <BusinessOpportunityModal
        visible={modalStates.businessOpportunity}
        onClose={() => closeModal('businessOpportunity')}
        content={planContent['Business Opportunity']}
      />
      
      <BusinessPlanModal
        visible={modalStates.businessPlan}
        onClose={() => closeModal('businessPlan')}
        content={planContent['Business Plan']}
      />
      
      <MarketingPlanModal
        visible={modalStates.marketingPlan}
        onClose={() => closeModal('marketingPlan')}
        content={planContent['Marketing Plan']}
      />

      {/* PotentialMatch Modal */}
      <Modal
        visible={isPotentialMatchModalVisible}
        // animationType="slide"
        transparent={true}
        onRequestClose={() => setPotentialMatchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: 'transparent' }]}>
            {/* Close Button */}
            <TouchableOpacity 
              onPress={() => setPotentialMatchModalVisible(false)} 
              style={styles.modalCloseButton}
            >
              <Ionicons name="close-circle" size={32} color="white" />
            </TouchableOpacity>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedUser && (
                <PotentialMatch 
                  compact={false}
                  name={selectedUser.name}
                  university={selectedUser.university}
                  major={selectedUser.major}
                  education_level={selectedUser.education_level}
                  about_me={selectedUser.about_me}
                  // create a map for the position if name is in Victor Samsonov, Tony Bui or Maria Fernandes, return Co-founder of upstarter
                  position={selectedUser.name === "Victor Samsonov" || selectedUser.name === "Tony Bui" || selectedUser.name === "Maria Fernandes" ? "Co-founder of Upstarter" : "Co-founder of Kings of Recursion"}
                  seed={Math.floor(Math.random() * 100)}
                  onAccept={() => {
                    // Handle accept action
                    setPotentialMatchModalVisible(false);
                  }}
                  onReject={() => {
                    // Handle reject action
                    setPotentialMatchModalVisible(false);
                  }}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    container: {
        padding: 20,
        paddingBottom: 100, // Make space for FABs at the bottom
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    startupInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 20,
    },
    startupTextContainer: {
        justifyContent: 'center',
    },
    startupName: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    startupDetail: {
        fontSize: 14,
        color: '#6c757d',
    },
    aboutBox: {
        backgroundColor: '#e3e7fc',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    aboutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    missionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    aboutText: {
        fontSize: 15,
        lineHeight: 22,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    itemBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderColor: '#1ecb8b',
        borderWidth: 1,
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
    },
    itemIcon: {
        marginRight: 10,
    },
    itemText: {
        fontSize: 16,
    },
    itemName: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    addButton: {
        alignItems: 'center',
        marginTop: 5,
    },
    planButton: {
        backgroundColor: '#6A8DFF',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 10,
        alignItems: 'center',
    },
    planButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 90, // Adjusted to be above the tab bar
        right: 20,
        alignItems: 'center',
    },
    fab: {
        backgroundColor: '#fff',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userMessageRow: {
        justifyContent: 'flex-end',
    },
    botMessageRow: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 15,
        backgroundColor: '#fff',
    },
    userMessageBubble: {
        backgroundColor: '#007bff',
    },
    botMessageBubble: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#000',
    },
    messageText: {
        fontSize: 16,
        color: '#000',
    },
    errorText: {
        color: 'red',
    },
    messageType: {
        fontSize: 12,
        color: '#6c757d',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: 'bold',
    },
    botIcon: {
        marginRight: 10,
    },
    modalScreen: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#007bff',
    },
    closeButton: {
        padding: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    placeholder: {
        flex: 1,
    },
    modalContent: {
        flex: 1,
    },
    messageList: {
        flexGrow: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    textInput: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 15,
    },
    sendButton: {
        padding: 10,
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptySubText: {
        fontSize: 14,
        color: '#6c757d',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '90%',
        maxHeight: '80%',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalCloseButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        zIndex: 1000,
    },
}); 