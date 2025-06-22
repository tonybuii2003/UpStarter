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
  MaterialCommunityIcons
} from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');

export default function PotentialStartup({ 
  compact = false, 
  name = "Startup Name", 
  industry = "", 
  description = "", 
  logo = "", 
  cofounders = [],
  businessPlan = ""
}) {
  const defaultLogo = "https://cdn-icons-png.flaticon.com/512/3069/3069172.png";
  
  return (
    <LinearGradient style={styles.card} colors={['#6A8DFF', '#1E4D91']}>
      {/* --- Top Section --- */}
      <View style={styles.topSection}>
        <View style={styles.logoCircle}>
          <Image
            source={{ uri: logo || defaultLogo }}
            style={styles.logo}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.industry}>{industry}</Text>
        </View>
      </View>

      {/* --- Info Pills --- */}
      <View style={styles.infoBar}>
        <View style={styles.infoPill}>
          <MaterialCommunityIcons name="lightbulb-on" size={14} color="#41b06e" />
          <Text style={styles.infoText}>Seed Stage</Text>
        </View>
        <View style={styles.infoPill}>
          <Ionicons name="people" size={14} color="#41b06e" />
          <Text style={styles.infoText}>{cofounders.length} Founders</Text>
        </View>
        <View style={styles.infoPill}>
          <FontAwesome5 name="industry" size={14} color="#41b06e" />
          <Text style={styles.infoText}>{industry}</Text>
        </View>
      </View>

      {/* --- About Startup --- */}
      <View style={styles.aboutBox}>
        <Text style={styles.aboutTitle}>Our Mission:</Text>
        <Text style={styles.aboutText}>
          {description || "No description available"}
        </Text>
      </View>

      {/* --- Cofounders --- */}
      <View style={styles.cofoundersBox}>
        <Text style={styles.sectionHeader}>Cofounders</Text>
        {cofounders.map((cofounder, index) => (
          <View key={index} style={styles.cofounderRow}>
            <Image
              source={{ uri: cofounder.profile_pic || "https://randomuser.me/api/portraits/men/" + Math.floor(Math.random() * 100) + ".jpg" }}
              style={styles.cofounderAvatar}
            />
            <View style={styles.cofounderInfo}>
              <Text style={styles.cofounderName}>{cofounder.name}</Text>
              <Text style={styles.cofounderDetails}>
                {[cofounder.university, cofounder.major].filter(Boolean).join(' • ')}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* if compact, stop here */}
      {compact && null}

      {/* --- Full Details (compact=false) --- */}
      {!compact && (
        <>
          {/* Business Plan */}
          <TouchableOpacity style={styles.resumeBar} activeOpacity={0.8}>
            <FontAwesome5 name="file-alt" size={18} color="#e63946" />
            <Text style={styles.resumeBarText}>Business Plan</Text>
          </TouchableOpacity>

          {/* Business Plan Preview */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionHeader}>Business Plan Preview</Text>
            <Text style={styles.businessPlanText} numberOfLines={6}>
              {businessPlan || "No business plan available"}
            </Text>
          </View>

          {/* Startup Details */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionHeader}>Startup Details</Text>
            <View style={styles.detailRow}>
              <MaterialIcons name="date-range" size={14} color="#41b06e" />
              <Text style={styles.detailText}>Founded: 2023</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome5 name="money-bill-wave" size={14} color="#41b06e" />
              <Text style={styles.detailText}>Funding: Bootstrapped</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="md-location-sharp" size={14} color="#41b06e" />
              <Text style={styles.detailText}>Location: San Francisco, CA</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="target" size={14} color="#41b06e" />
              <Text style={styles.detailText}>Target Market: Small businesses</Text>
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
  logoCircle: {
    width: SCREEN_W * 0.25,
    height: SCREEN_W * 0.25,
    borderRadius: (SCREEN_W * 0.25) / 2,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#41b06e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '300',
    color: '#fff',
    fontFamily: 'Comfortaa_400Regular',
  },
  industry: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Comfortaa_400Regular',
    marginTop: 4,
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

  /* Cofounders */
  cofoundersBox: {
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
  cofounderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cofounderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  cofounderInfo: {
    flex: 1,
  },
  cofounderName: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 14,
    color: '#1E4D91',
  },
  cofounderDetails: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 12,
    color: '#666',
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

  /* Shared section box */
  sectionBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  
  /* Business Plan */
  businessPlanText: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },

  /* Details */
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 13,
    color: '#333',
  },
});