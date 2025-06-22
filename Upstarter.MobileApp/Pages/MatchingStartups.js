import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, Modal, Pressable, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PotentialStartup from '../Components/PotentialStartups'; // You'll need to create this component
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const { width: SCREEN_W } = Dimensions.get('window');
import { useNavigation } from '@react-navigation/native';

export default function StartupMatching() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [potentialStartups, setPotentialStartups] = useState([]);
  const [currentStartupIndex, setCurrentStartupIndex] = useState(0);
  const [rejectedStartupIds, setRejectedStartupIds] = useState([]);
  const navigation = useNavigation();

  const loadStartupsFromBackend = async (append = false) => {
    setIsLoading(true);
    
    try {
      const response = await axios.get('http://10.56.121.148:8000/load_startups_swipe');
      let newStartups = response.data.content;
      
      // Filter out already rejected startups
      newStartups = newStartups.filter(startup => 
        !rejectedStartupIds.includes(startup.startup_id)
      );
      
      if (append) {
        // Append new startups to existing list
        setPotentialStartups(prev => [...prev, ...newStartups]);
      } else {
        // Replace all startups
        setPotentialStartups(newStartups);
        setCurrentStartupIndex(0);
      }
      
    } catch (error) {
      console.error('Backend connection error:', error);
      Alert.alert('Error', 'Failed to load startups: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load startups when component mounts
  useEffect(() => {
    loadStartupsFromBackend(false);
  }, []);

  // Check if we need to load more startups
  useEffect(() => {
    const remainingStartups = potentialStartups.length - currentStartupIndex;
    if (remainingStartups <= 3 && !isLoading) {
      loadStartupsFromBackend(true);
    }
  }, [currentStartupIndex, potentialStartups.length]);

  const handleAccept = () => {
  const currentStartup = getCurrentStartup();
  console.log('Accepted startup:', currentStartup);
  
  // Navigate to ChatScreen with the startup data
  navigation.navigate('ChatScreen', { 
    startup: currentStartup 
  });
  
  // Move to next startup (if you want to keep this behavior)
  if (currentStartupIndex < potentialStartups.length - 1) {
    setCurrentStartupIndex(currentStartupIndex + 1);
  } else {
    loadStartupsFromBackend(true);
  }
};

  const handleReject = () => {
    const currentStartup = getCurrentStartup();
    console.log('Rejected startup:', currentStartup);
    
    // Add to rejected list
    if (currentStartup) {
      setRejectedStartupIds(prev => [...prev, currentStartup.startup_id]);
    }
    
    // Move to next startup
    if (currentStartupIndex < potentialStartups.length - 1) {
      setCurrentStartupIndex(currentStartupIndex + 1);
    } else {
      // No more matches, reload
      loadStartupsFromBackend(true);
    }
  };
  
  const getCurrentStartup = () => {
    if (potentialStartups.length === 0 || currentStartupIndex >= potentialStartups.length) {
      return null;
    }
    return potentialStartups[currentStartupIndex];
  };

  const currentStartup = getCurrentStartup();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1ecb8b" />
          </View>
        ) : currentStartup ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setModalVisible(true)}
            style={styles.touchableWrapper}
          >
            <PotentialStartup 
              compact={true}
              name={currentStartup.name}
              industry={currentStartup.industry}
              description={currentStartup.about_content}
              logo={currentStartup.logo_path}
              cofounders={currentStartup.cofounders || []}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.noMatchesContainer}>
            <Text style={styles.noMatchesText}>No startups available</Text>
            <TouchableOpacity style={styles.reloadButton} onPress={() => loadStartupsFromBackend(false)}>
              <Text style={styles.reloadButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* FABs */}
      {currentStartup && (
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
              {currentStartup && (
                <PotentialStartup 
                  compact={false}
                  name={currentStartup.name}
                  industry={currentStartup.industry}
                  description={currentStartup.about_content}
                  logo={currentStartup.logo_path}
                  businessPlan={currentStartup.business_plan_content}
                  cofounders={currentStartup.cofounders || []}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Reuse the same styles as your original Matching component
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