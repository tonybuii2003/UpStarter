import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView, Modal, Pressable} from 'react-native';
import  {LinearGradient}  from 'expo-linear-gradient'; // Changed import
import PotentialMatch from '../Components/PotentialMatch';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
const { width: SCREEN_W } = Dimensions.get('window');

export default function Matching() {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setModalVisible(true)}
          style={styles.touchableWrapper}
        >
          <PotentialMatch compact={true}/>
        </TouchableOpacity>
      </ScrollView>

      {/* FABs */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabAccept}>
          <Ionicons name="checkmark" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabReject}>
          <Ionicons name="close" size={32} color="#1ecb8b" />
        </TouchableOpacity>
      </View>

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
              <PotentialMatch />
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
});