import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  FontAwesome,
} from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');

export default function SimplifiedPotentialMatch({ 
  compact = false, 
  name="john doe", 
  university="", 
  major="", 
  education_level="", 
  about_me="", 
  seed=1 
}) {
  const avatar_url = "https://randomuser.me/api/portraits/men/" + seed + ".jpg"
  return (
    <LinearGradient style={styles.card} colors={['#6A8DFF', '#1E4D91']}>
      {/* --- Top Section --- */}
      <View style={styles.topSection}>
        <View style={styles.profileCircle}>
          <Image
            source={{ uri: avatar_url }}
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

      {/* --- About Me (only show when not compact) --- */}
      {!compact && (
        <View style={styles.aboutBox}>
          <Text style={styles.aboutTitle}>About me:</Text>
          <Text style={styles.aboutText}>
          {about_me}
          </Text>
        </View>
      )}

      <View style={styles.badgesBox}>
        <View style={styles.badgeRow}>
          <MaterialIcons name="school" size={14} color="#41b06e" />
          <Text style={styles.badgeText}>
            M.S. in Computer Science at the Massachusetts Institute of Technology
          </Text>
        </View>
        <View style={styles.badgeRow}>
          <FontAwesome name="star" size={14} color="#41b06e" />
          <Text style={styles.badgeText}>
            Proven Data Scientist and NLP expert
          </Text>
        </View>
        <View style={styles.badgeRow}>
          <FontAwesome5 name="crown" size={14} color="#41b06e" />
          <Text style={styles.badgeText}>
            Co-founder of Kings of Recursion
          </Text>
        </View>
        <View style={styles.badgeRow}>
          <Ionicons name="search" size={14} color="#41b06e" />
          <Text style={styles.badgeText}>
            Looking to found a startup
          </Text>
        </View>
      </View>
      
      {/* if compact, stop here */}
      {compact && null}

      {/* --- Full Details (compact=false) --- */}
      {!compact && (
        <>
          {/* Resume bar */}
          <TouchableOpacity style={styles.resumeBar} activeOpacity={0.8}>
            <FontAwesome5 name="file-pdf" size={18} color="#e63946" />
            <Text style={styles.resumeBarText}>Resume</Text>
          </TouchableOpacity>

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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },

  /* About me */
  aboutBox: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  aboutText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },

  /* Badges */
  badgesBox: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 6,
    flex: 1,
  },

  /* Resume bar */
  resumeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  resumeBarText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },

  /* Section boxes */
  sectionBox: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },

  /* Fit rows */
  fitRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  fitLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    width: 100,
  },
  fitValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },

  /* Experience rows */
  expRow: {
    marginBottom: 12,
  },
  expRole: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  expCompany: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
  },
  expDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
}); 