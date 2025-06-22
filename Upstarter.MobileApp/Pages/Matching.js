import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView, Modal, Pressable, Alert, ActivityIndicator} from 'react-native';
import  {LinearGradient}  from 'expo-linear-gradient'; // Changed import
import PotentialMatch from '../Components/PotentialMatch';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const { width: SCREEN_W } = Dimensions.get('window');

export default function Matching() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const loadUsersFromBackend = async (append = false) => {
    setIsLoading(true);
    
    try {
      const response = await axios.get('http://10.40.252.128:8000/load_users_swipe');
      const newUsers = response.data.content;
      
      if (append) {
        // Append new users to existing list
        setPotentialMatches(prevMatches => [...prevMatches, ...newUsers]);
        console.log('Appended', newUsers.length, 'new users. Total:', potentialMatches.length + newUsers.length);
      } else {
        // Replace all users
        setPotentialMatches(newUsers);
        setCurrentMatchIndex(0);
        console.log('Loaded', newUsers.length, 'users');
      }
      
      setTestResponse(response.data.content);
    } catch (error) {
      console.error('Backend connection error:', error);
      Alert.alert('Error', 'Failed to load users: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load users when component mounts
  useEffect(() => {
    loadUsersFromBackend(false);
  }, []);

  // Check if we need to load more users
  useEffect(() => {
    const remainingUsers = potentialMatches.length - currentMatchIndex;
    if (remainingUsers <= 5 && !isLoading) {
      console.log('Low on users, loading more...');
      loadUsersFromBackend(true);
    }
  }, [currentMatchIndex, potentialMatches.length]);

  const handleAccept = () => {
    // Handle accept logic here
    console.log('Accepted:', potentialMatches[currentMatchIndex]);
    if (currentMatchIndex < potentialMatches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      // No more matches, reload or show message
      Alert.alert('No more matches', 'You\'ve seen all available matches!');
    }
  };

  const handleReject = () => {
    // Handle reject logic here
    console.log('Rejected:', potentialMatches[currentMatchIndex]);
    if (currentMatchIndex < potentialMatches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      // No more matches, reload or show message
      Alert.alert('No more matches', 'You\'ve seen all available matches!');
    }
  };

  const getCurrentMatch = () => {
    if (potentialMatches.length === 0 || currentMatchIndex >= potentialMatches.length) {
      return null;
    }
    return potentialMatches[currentMatchIndex];
  };

  const currentMatch = getCurrentMatch();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1ecb8b" />
          </View>
        ) : currentMatch ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setModalVisible(true)}
            style={styles.touchableWrapper}
          >
            <PotentialMatch 
              compact={true}
              name={currentMatch.name}
              university={currentMatch.university}
              major={currentMatch.major}
              education_level={currentMatch.education_level}
              about_me={currentMatch.about_me}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.noMatchesContainer}>
            <Text style={styles.noMatchesText}>No matches available</Text>
            <TouchableOpacity style={styles.reloadButton} onPress={() => loadUsersFromBackend(false)}>
              <Text style={styles.reloadButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* FABs */}
      {currentMatch && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fabAccept} onPress={handleAccept}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabReject} onPress={handleReject}>
            <Ionicons name="close" size={32} color="#1ecb8b" />
          </TouchableOpacity>
        </View>
      )}

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
              {currentMatch && (
                <PotentialMatch 
                  compact={false}
                  name={currentMatch.name}
                  university={currentMatch.university}
                  major={currentMatch.major}
                  education_level={currentMatch.education_level}
                  about_me={currentMatch.about_me}
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
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  // Constrain Touchable to same width as card (85% of screen)
  touchableWrapper: {
    width: SCREEN_W * 0.85,
    alignSelf: 'center',
  },

  fabContainer: {
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMatchesText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reloadButton: {
    padding: 16,
    backgroundColor: '#1ecb8b',
    borderRadius: 8,
  },
  reloadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});