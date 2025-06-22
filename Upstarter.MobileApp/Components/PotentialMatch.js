// Components/PotentialMatch.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  FontAwesome,
} from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width: SCREEN_W } = Dimensions.get('window');

export default function PotentialMatch({ compact = false, name="john doe", university="", major="", education_level="", about_me="", position="", seed=1 }) {
  const [isResumeModalVisible, setResumeModalVisible] = useState(false);
  
  console.log("=== POTENTIAL MATCH ===");
  console.log("Name:", name);
  console.log("University:", university);
  console.log("Major:", major);
  console.log("Education Level:", education_level);
  console.log("About Me:", about_me);
  console.log("Seed:", seed);
  console.log("=========================");
  
  // Map the profile picture url based on the name
  const profile_picture_map = {
    "Victor Samsonov": require('../assets/images/vicsonsam_user_profile.jpeg'),
    "Tony Bui": require('../assets/images/tony_user_profile.jpeg'),
    "Maria Fernandes": require('../assets/images/maria_user_profile.jpg')
  };
  
  // Map the resume path based on the name
  const resume_path_map = {
    "Victor Samsonov": require('../assets/resumes/victor_resume.pdf'),
    "Tony Bui": require('../assets/resumes/tony_resume.pdf'),
    "Maria Fernandes": require('../assets/resumes/maria_resume.pdf')
  };
  
  // Map the LinkedIn URL based on the name
  const linkedin_url_map = {
    "Victor Samsonov": "https://www.linkedin.com/in/victor-samsonov-56948a1a3/",
    "Tony Bui": "https://www.linkedin.com/in/tonybui2003/",
    "Maria Fernandes": "https://www.linkedin.com/in/maria-fernandes-a42597370/"
  };
  
  // Get profile picture from map only if name is in the map, otherwise use default
  const profile_picture = profile_picture_map.hasOwnProperty(name) 
    ? profile_picture_map[name] 
    : { uri: "https://randomuser.me/api/portraits/men/" + seed + ".jpg" };
    
  // Get resume path from map only if name is in the map, otherwise use default
  const resume_path = resume_path_map.hasOwnProperty(name) 
    ? resume_path_map[name] 
    : null;
    
  // Get LinkedIn URL from map only if name is in the map, otherwise use default
  const linkedin_url = linkedin_url_map.hasOwnProperty(name) 
    ? linkedin_url_map[name] 
    : null;
  
  const handleResumeClick = async () => {
    if (!resume_path) {
      Alert.alert('No Resume', 'No resume available for this user.');
      return;
    }
    
    try {
      // Open the resume modal
      setResumeModalVisible(true);
      console.log('Opening resume for:', name);
    } catch (error) {
      console.error('Error handling resume:', error);
      Alert.alert('Error', 'Could not open resume.');
    }
  };
  
  const handleLinkedInClick = async () => {
    if (!linkedin_url) {
      Alert.alert('No LinkedIn', 'No LinkedIn profile available for this user.');
      return;
    }
    
    try {
      // Open LinkedIn URL
      const supported = await Linking.canOpenURL(linkedin_url);
      if (supported) {
        await Linking.openURL(linkedin_url);
        console.log('Opening LinkedIn for:', name);
      } else {
        Alert.alert('Error', 'Cannot open LinkedIn URL');
      }
    } catch (error) {
      console.error('Error opening LinkedIn:', error);
      Alert.alert('Error', 'Could not open LinkedIn profile.');
    }
  };
  
  const handleModalClose = () => {
    console.log('Closing modal for:', name);
    setResumeModalVisible(false);
  };
  
  const handleOverlayPress = () => {
    console.log('Overlay pressed, closing modal for:', name);
    setResumeModalVisible(false);
  };
  
  return (
    <View style={styles.cardContainer}>
      <LinearGradient style={styles.card} colors={['#6A8DFF', '#1E4D91']}>
        {/* --- Top Section --- */}
        <View style={styles.topSection}>
          <View style={styles.profileCircle}>
            <Image
              source={profile_picture}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>{name}</Text>
        </View>

        {/* --- Info Pills --- */}
        <View style={styles.infoBar}>
          <View style={styles.infoPill}>
            <MaterialIcons name="cake" size={14} color="#41b06e" />
            <Text style={styles.infoText}>23</Text>
          </View>
          <View style={styles.infoPill}>
            <Ionicons name="location-sharp" size={14} color="#41b06e" />
            <Text style={styles.infoText}>Boston</Text>
          </View>
          <View style={styles.infoPill}>
            <FontAwesome5 name="graduation-cap" size={14} color="#41b06e" />
            <Text style={styles.infoText}>{university}</Text>
          </View>

          <View style={styles.infoPill}>
            <FontAwesome5 name="graduation-cap" size={14} color="#41b06e" />
            <Text style={styles.infoText}>{major}</Text>
          </View>

          <View style={styles.infoPill}>
            <FontAwesome5 name="graduation-cap" size={14} color="#41b06e" />
            <Text style={styles.infoText}>{education_level}</Text>
          </View>
        </View>

        {/* --- About Me --- */}
        <View style={styles.aboutBox}>
          <Text style={styles.aboutTitle}>About me:</Text>
          <Text style={styles.aboutText}>
          {about_me}
          </Text>
        </View>


        <View style={styles.badgesBox}>
          <View style={styles.badgeRow}>
            <MaterialIcons name="school" size={14} color="#41b06e" />
            <Text style={styles.badgeText}>
             {education_level} in {major} at the {university}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <FontAwesome name="star" size={14} color="#41b06e" />
            <Text style={styles.badgeText}>
              Proven {major} and {position} expert
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <FontAwesome5 name="crown" size={14} color="#41b06e" />
            <Text style={styles.badgeText}>
              {name === "Victor Samsonov" || name === "Tony Bui" || name === "Maria Fernandes" ? "Co-founder of Upstarter" : "Co-founder of Kings of Recursion"}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <Ionicons name="search" size={14} color="#41b06e" />
            <Text style={styles.badgeText}>
              {name === "Victor Samsonov" || name === "Tony Bui" || name === "Maria Fernandes" ? "Looking for interns" : "Looking to found a startup"}
            </Text>
          </View>
        </View>
        {/* if compact, stop here */}
        {compact && null}

        {/* --- Full Details (compact=false) --- */}
        {!compact && (
          <>
            {/* Resume bar - only show if resume path is available */}
            {resume_path && (
              <TouchableOpacity 
                style={styles.resumeBar} 
                activeOpacity={0.8}
                onPress={handleResumeClick}
              >
                <FontAwesome5 name="file-pdf" size={18} color="#e63946" />
                <Text style={styles.resumeBarText}>Resume</Text>
              </TouchableOpacity>
            )}

            {/* LinkedIn bar - only show if LinkedIn URL is available */}
            {linkedin_url && (
              <TouchableOpacity 
                style={styles.linkedinBar} 
                activeOpacity={0.8}
                onPress={handleLinkedInClick}
              >
                <FontAwesome5 name="linkedin" size={18} color="#0077b5" />
                <Text style={styles.linkedinBarText}>LinkedIn Profile</Text>
              </TouchableOpacity>
            )}

            {/* Startup Fit */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeader}>Startup Fit</Text>
              <View style={styles.fitRow}>
                <Text style={styles.fitLabel}>Tools / Tech:</Text>
                <Text style={styles.fitValue}>
                  Figma, React, Python, Notion, Firebase
                </Text>
              </View>
              <View style={styles.fitRow}>
                <Text style={styles.fitLabel}>Fun Fact:</Text>
                <Text style={styles.fitValue}>
                  I once built a coffee-tracker website… then forgot to update it!
                </Text>
              </View>
              <View style={styles.fitRow}>
                <Text style={styles.fitLabel}>Availability:</Text>
                <Text style={styles.fitValue}>Full-time ready</Text>
              </View>
              <View style={styles.fitRow}>
                <Text style={styles.fitLabel}>Languages:</Text>
                <Text style={styles.fitValue}>
                  English, Spanish, Portuguese
                </Text>
              </View>
            </View>

            {/* Experiences */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeader}>Experiences</Text>
              <View style={styles.expRow}>
                <Text style={styles.expRole}>
                  Software Engineer | Data Science
                </Text>
                <Text style={styles.expCompany}>RedMane</Text>
                <Text style={styles.expDate}>Jan 2024 – Present</Text>
              </View>
              <View style={styles.expRow}>
                <Text style={styles.expRole}>
                  Internship | Data Science
                </Text>
                <Text style={styles.expCompany}>CCC Intelligent Solutions</Text>
                <Text style={styles.expDate}>Jan 2023 – Dec 2023</Text>
              </View>
            </View>
          </>
        )}
        
        {/* Resume Modal */}
        <Modal
          visible={isResumeModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleModalClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.headerContent}>
                  <FontAwesome5 name="file-pdf" size={28} color="white" />
                  <Text style={styles.modalTitle}>{name}'s Resume</Text>
                </View>
                <TouchableOpacity 
                  onPress={handleModalClose} 
                  style={styles.closeButton}
                >
                  <Ionicons name="close-circle" size={32} color="white" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                {resume_path ? (
                  <View style={styles.resumeInfoContainer}>
                    <Ionicons name="document-outline" size={64} color="#007bff" />
                    <Text style={styles.resumeInfoTitle}>{name}'s Resume</Text>
                    <Text style={styles.resumeInfoText}>
                      Resume is available for {name}
                    </Text>
                    
                    <View style={styles.resumeActions}>
                      <TouchableOpacity 
                        style={styles.resumeActionButton}
                        onPress={() => {
                          Alert.alert('Resume', `${name}'s resume would be downloaded here.`);
                        }}
                      >
                        <Ionicons name="download-outline" size={24} color="#007bff" />
                        <Text style={styles.resumeActionText}>Download</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.resumeActionButton}
                        onPress={() => {
                          Alert.alert('Resume', `${name}'s resume would be shared here.`);
                        }}
                      >
                        <Ionicons name="share-outline" size={24} color="#007bff" />
                        <Text style={styles.resumeActionText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.resumeInfoNote}>
                      Note: Full PDF viewing is available in the mobile app.
                    </Text>
                    
                    {/* Close button at bottom */}
                    <TouchableOpacity 
                      style={styles.bottomCloseButton}
                      onPress={handleModalClose}
                    >
                      <Text style={styles.bottomCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noResumeContainer}>
                    <Ionicons name="document-outline" size={64} color="#ccc" />
                    <Text style={styles.noResumeText}>No resume available</Text>
                    
                    {/* Close button at bottom */}
                    <TouchableOpacity 
                      style={styles.bottomCloseButton}
                      onPress={handleModalClose}
                    >
                      <Text style={styles.bottomCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            
            {/* Floating close button outside modal */}
            <TouchableOpacity 
              style={styles.floatingCloseButton}
              onPress={handleModalClose}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
  },
  card: {
    width: SCREEN_W * 0.85,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    paddingBottom: 16,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  profileCircle: {
    width: SCREEN_W * 0.25,
    height: SCREEN_W * 0.25,
    borderRadius: (SCREEN_W * 0.25) / 2,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#41b06e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: SCREEN_W * 0.22,
    height: SCREEN_W * 0.22,
    borderRadius: (SCREEN_W * 0.22) / 2,
  },
  name: {
    flex: 1,
    fontSize: 26,
    fontWeight: '300',
    color: '#fff',
    marginLeft: 16,
    fontFamily: 'Comfortaa_400Regular',
  },

  /* Info pills */
  infoBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 6,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#41b06e',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  infoText: {
    marginLeft: 4,
    color: '#1E4D91',
    fontSize: 12,
    fontFamily: 'Comfortaa_400Regular',
  },

  /* About me block */
  aboutBox: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  aboutTitle: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 4,
    fontFamily: 'Comfortaa_700Bold',
  },
  aboutText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Comfortaa_400Regular',
  },

  /* Resume bar */
  resumeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e63946',
  },
  resumeBarText: {
    marginLeft: 8,
    color: '#e63946',
    fontSize: 16,
    fontFamily: 'Comfortaa_600SemiBold',
  },

  /* LinkedIn bar */
  linkedinBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0077b5',
  },
  linkedinBarText: {
    marginLeft: 8,
    color: '#0077b5',
    fontSize: 16,
    fontFamily: 'Comfortaa_600SemiBold',
  },

  /* Shared section box */
  sectionBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: 'Comfortaa_700Bold',
    color: '#1E4D91',
    marginBottom: 8,
  },

  /* Startup Fit */
  fitRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  fitLabel: {
    width: 100,
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 13,
    color: '#1E4D91',
  },
  fitValue: {
    flex: 1,
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 13,
    color: '#333',
  },

  /* Experiences */
  expRow: {
    marginBottom: 8,
  },
  expRole: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 14,
    color: '#1E4D91',
  },
  expCompany: {
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 13,
    color: '#41b06e',
  },
  expDate: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 12,
    color: '#666',
  },
  badgesBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#41b06e',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeText: {
    marginLeft: 6,
    flex: 1,
    fontSize: 12,
    color: '#1E4D91',
    fontFamily: 'Comfortaa_400Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  closeButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  noResumeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResumeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ccc',
    marginTop: 10,
  },
  resumeInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  resumeInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  resumeInfoText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  resumeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  resumeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 12,
  },
  resumeActionText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  resumeInfoNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  floatingCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomCloseButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#007bff',
    alignSelf: 'center',
  },
  bottomCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

