import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome } from '@expo/vector-icons';

const upstarterLogo = { uri: 'https://i.imgur.com/0y8Ftya.png' }; // Placeholder
const mitLogo = { uri: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.png' }; // Placeholder

/**
 * Renders a card with potential match information.
 * @returns {JSX.Element} The PotentialMatch component.
 */
const PotentialMatch = () => {
  return (
    <LinearGradient style={styles.card} colors={["#6A8DFF", "#1E4D91"]}>
      {/* Top Section */}
      
      <View style={styles.topSection}>
        {/* Profile Image with Ribbon */}
        <View style={styles.profileImageWrapper}>
          <View style={styles.profileCircle}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.avatar}
            />
            
          </View>
        </View>
        {/* Name and Logos */}
        <View style={styles.topRight}>
          {/* <View style={styles.logoRow}>
            <Image source={upstarterLogo} style={styles.upstarterLogo} />
            <View style={{ flex: 1 }} />
            <Image source={mitLogo} style={styles.mitLogo} />
          </View> */}
          <Text style={styles.name}>Julen</Text>
        </View>
      </View>
      {/* Info Bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoPill}>
          <MaterialIcons name="cake" size={16} color="#41b06e" style={{ marginRight: 4 }} />
          <Text style={styles.infoText}>23</Text>
        </View>
        <View style={styles.infoPill}>
          <Ionicons name="location-sharp" size={16} color="#41b06e" style={{ marginRight: 4 }} />
          <Text style={styles.infoText}>Boston</Text>
        </View>
        <View style={styles.infoPill}>
          <FontAwesome5 name="graduation-cap" size={16} color="#41b06e" style={{ marginRight: 4 }} />
          <Text style={styles.infoText}>Massachusetts Institute of Technology</Text>
        </View>
      </View>
      {/* Badges Box */}
      <View style={styles.badgesBox}>
        <View style={styles.badgeRow}><MaterialIcons name="school" size={16} color="#41b06e" style={styles.badgeIcon} /><Text style={styles.badgeText}>M.S. in Computer Science at the Massachusetts Institute of Technology</Text></View>
        <View style={styles.badgeRow}><FontAwesome name="star" size={16} color="#41b06e" style={styles.badgeIcon} /><Text style={styles.badgeText}>Proved Data Scientist and expert in NLP</Text></View>
        <View style={styles.badgeRow}><FontAwesome5 name="crown" size={16} color="#41b06e" style={styles.badgeIcon} /><Text style={styles.badgeText}>Co-founder of Kings of Recursion</Text></View>
        <View style={styles.badgeRow}><Ionicons name="search" size={16} color="#41b06e" style={styles.badgeIcon} /><Text style={styles.badgeText}>Looking to found a startup</Text></View>
      </View>
      {/* About Me */}
      <LinearGradient
        colors={["#6A8DFF", "#1E4D91"]}
        style={styles.aboutMeGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <Text style={styles.aboutMeTitle}>About me:</Text>
        <Text style={styles.aboutMeText}>
          I'm a curious and motivated learner with a passion for startups and problem-solving. I've built small projects on my own and love working in fast-paced, creative environments. I'm excited to grow with a team where I can contribute, learn, and make real impact.
        </Text>
      </LinearGradient>
      {/* Resume Button */}
      <TouchableOpacity style={styles.resumeButton}>
        <Text style={styles.resumeButtonText}>resume</Text>
      </TouchableOpacity>
      {/* Startup Fit */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Startup Fit</Text>
        <View style={styles.fitBox}>
          <Text style={styles.fitTitle}>Favorite Tools / Tech I'm Learning</Text>
          <Text style={styles.fitText}>Figma, React, Python, Notion, Firebase</Text>
          <Text style={styles.fitTitle}>Fun Fact</Text>
          <Text style={styles.fitText}>I once built a website to track my coffee intake. Then forgot to update it!</Text>
          <Text style={styles.fitTitle}>Availability / Commitment</Text>
          <Text style={styles.fitText}>Full time ready</Text>
          <Text style={styles.fitTitle}>Languages I Speak</Text>
          <Text style={styles.fitText}>English, Spanish, Portuguese</Text>
        </View>
      </View>
      {/* Experiences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experiences</Text>
        <View style={styles.experienceBox}>
          <Text style={styles.expRole}>Software Engineer | Data Science</Text>
          <Text style={styles.expCompany}>RedMane</Text>
          <Text style={styles.expDate}>Jan 2024 - Present</Text>
        </View>
        <View style={styles.experienceBox}>
          <Text style={styles.expRole}>Internship | Data Science</Text>
          <Text style={styles.expCompany}>CCC Intelligent Solutions</Text>
          <Text style={styles.expDate}>Jan 2023 - Dec 2023</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    padding: 0,
    marginBottom: 24,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    overflow: 'visible',

  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    paddingBottom: 0,
    overflow: 'visible',
    borderRadius: 24,
    
  },
  profileImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
     borderRadius: 24,

    // allow overflow
    overflow: 'visible',
    border: '1px solid yellow',
  },
  profileCircle: {
    width: '100%',
    height: 210,
    borderRadius: 120,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#41b06e',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    // left:  Dimensions.get('window').width * 0.1,
    // bottom: Dimensions.get('window').width * 0.2

  },
  avatar: {
    minHeight: 200,
    minWidth: 200,
    borderRadius: 100,
  },
  ribbon: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    backgroundColor: '#41b06e',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    transform: [{ rotate: '-20deg' }],
    zIndex: 2,
  },
  ribbonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  topRight: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  upstarterLogo: {
    width: 60,
    height: 24,
    resizeMode: 'contain',
  },
  mitLogo: {
    width: 40,
    height: 24,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 28,
    fontWeight: '300',
    color: '#fff',
    marginTop: 8,
    marginBottom: 0,
    alignSelf: 'flex-end',
    letterSpacing: 1,
    marginRight: 16,
    right: Dimensions.get('window').width * 0.1,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    marginTop: 8,
    marginLeft: 24,
    marginRight: 24,
    marginBottom: 8,
    gap: 8,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#41b06e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  infoText: {
    color: '#1E4D91',
    fontSize: 14,
    fontWeight: '500',
  },
  badgesBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#41b06e',
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 12,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeIcon: {
    marginRight: 8,
  },
  badgeText: {
    color: '#1E4D91',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
  aboutMeGradient: {
    borderRadius: 24,
    padding: 18,
    marginTop: 18,
    marginBottom: 8,
  },
  aboutMeTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  aboutMeText: {
    color: '#fff',
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'left',
    fontWeight: '400',
  },
  resumeButton: {
    backgroundColor: '#fff',
    borderColor: '#41b06e',
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 8,
    marginVertical: 10,
  },
  resumeButtonText: {
    color: '#41b06e',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'lowercase',
  },
  fitBox: {
    backgroundColor: '#e6f2ff',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
  },
  fitTitle: {
    fontWeight: 'bold',
    color: '#1E4D91',
    fontSize: 13,
    marginTop: 6,
  },
  fitText: {
    color: '#333',
    fontSize: 13,
    marginLeft: 4,
  },
  experienceBox: {
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    padding: 8,
    marginBottom: 6,
  },
  expRole: {
    fontWeight: 'bold',
    color: '#1E4D91',
    fontSize: 14,
  },
  expCompany: {
    color: '#41b06e',
    fontSize: 13,
    fontWeight: '600',
  },
  expDate: {
    color: '#888',
    fontSize: 12,
  },
  section: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1E4D91',
    fontSize: 16,
    marginBottom: 4,
  },
  logoImageMatch: {
    width: "25%",
    height: 100,
    resizeMode: 'contain',

  },
  // cant get the image to be on the right side of the screen fix it
  logoImageContainer: {
   
  }
});

export default PotentialMatch; 