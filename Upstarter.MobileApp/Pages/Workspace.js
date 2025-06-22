import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Mock data based on the image
const teamMembers = [
    { name: 'Victor Samsonov', role: 'Founder | Backend Developer' },
    { name: 'Tony Bui', role: 'Founder | Frontend Developer' },
    { name: 'Maria Fernandes', role: 'Founder | UX designer' },
];

const planItems = [
    'Company Description',
    'Business Opportunity',
    'Execution Plan',
    'Marketing Plan',
];

export default function Workspace() {
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
            <TouchableOpacity key={index} style={styles.itemBox}>
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
                <TouchableOpacity key={index} style={styles.planButton}>
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
        <TouchableOpacity style={styles.fab}>
            <MaterialCommunityIcons name="robot-happy-outline" size={28} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="#007bff" />
        </TouchableOpacity>
      </View>
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
}); 