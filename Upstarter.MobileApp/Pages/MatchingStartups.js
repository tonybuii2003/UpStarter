import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');

const startupData = [
  {
    id: '1',
    name: 'EcoVision AI',
    industry: 'Climate Tech',
    description: 'AI-powered carbon footprint reduction platform',
    founders: [
      { id: 'f1', name: 'Dr. Sarah Chen', role: 'CEO' },
      { id: 'f2', name: 'Jamal Williams', role: 'CTO' }
    ],
    fundingStage: 'Series A',
    milestones: ['Won Green Tech Award', 'Raised $15M']
  },
  {
    id: '2',
    name: 'AgriTech Solutions',
    industry: 'Agriculture',
    description: 'Precision farming with AI and IoT',
    founders: [
      { id: 'f3', name: 'Raj Patel', role: 'CEO' }
    ],
    fundingStage: 'Seed',
    milestones: ['40% water reduction', '500+ farms']
  }
];

const FounderItem = ({ name, role }) => (
  <View style={styles.founderItem}>
    <Ionicons name="person-circle-outline" size={16} color="#666" />
    <Text style={styles.founderText}>{name} ({role})</Text>
  </View>
);

const StartupCard = ({ startup }) => (
  <LinearGradient
    colors={['#FFFFFF', '#F5F5F5']}
    style={styles.card}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <Text style={styles.name}>{startup.name}</Text>
    <Text style={styles.industry}>{startup.industry} • {startup.fundingStage}</Text>
    
    <Text style={styles.description}>{startup.description}</Text>
    
    <View style={styles.foundersContainer}>
      <Text style={styles.sectionTitle}>Founders:</Text>
      {startup.founders.map(founder => (
        <FounderItem key={founder.id} name={founder.name} role={founder.role} />
      ))}
    </View>
    
    <View style={styles.milestonesContainer}>
      <Text style={styles.sectionTitle}>Milestones:</Text>
      {startup.milestones.map((milestone, index) => (
        <View key={index} style={styles.milestoneItem}>
          <Ionicons name="checkmark-circle" size={16} color="#1ecb8b" />
          <Text style={styles.milestoneText}>{milestone}</Text>
        </View>
      ))}
    </View>
  </LinearGradient>
);

export default function MatchingStartups({ navigation }) {
  const [selectedStartup, setSelectedStartup] = useState(null);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Investor Mode</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <FlatList
        data={startupData}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => setSelectedStartup(item)}
          >
            <StartupCard startup={item} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  listContent: {
    padding: 16,
    paddingBottom: 100
  },
  card: {
    width: SCREEN_W * 0.9,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  industry: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    lineHeight: 22
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  foundersContainer: {
    marginBottom: 16
  },
  founderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  founderText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8
  },
  milestonesContainer: {
    marginTop: 8
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  milestoneText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 16
  },
  fabMessage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1ecb8b',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6
  },
  fabInvest: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0ACF83',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6
  }
});