// Components/PotentialMatchStartup.js
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

const LOGOS = [
    'https://logo.clearbit.com/stripe.com',
    'https://logo.clearbit.com/vercel.com',
    'https://logo.clearbit.com/supabase.io',
    'https://logo.clearbit.com/linear.app',
    'https://logo.clearbit.com/retool.com',
    'https://logo.clearbit.com/posthog.com',
    'https://logo.clearbit.com/sentry.io',
    'https://logo.clearbit.com/gitlab.com',
    'https://logo.clearbit.com/plaid.com',
    'https://logo.clearbit.com/rippling.com',
    'https://logo.clearbit.com/airtable.com',
    'https://logo.clearbit.com/zapier.com',
    'https://logo.clearbit.com/segment.com',
    'https://logo.clearbit.com/algolia.com',
    'https://logo.clearbit.com/hasura.io'
];

export default function PotentialMatchStartup({ 
  compact = false, 
  name = "Startup Name", 
  logo_path = "", 
  business_plan_content = "", 
  about_content = "", 
  industry = "", 
  cofounders = [] 
}) {
    // Select a random logo from the hardcoded list if no logo_path is provided
    const randomLogo = React.useMemo(() => LOGOS[Math.floor(Math.random() * LOGOS.length)], [name]);
    const logoUrl = logo_path || randomLogo;

  return (
    <LinearGradient style={styles.card} colors={['#6A8DFF', '#1E4D91']}>
      {/* --- Top Section --- */}
      <View style={styles.topSection}>
        <View style={styles.profileCircle}>
          <Image
            source={{ uri: logoUrl }}
            style={styles.avatar}
            key={logoUrl} // Add key to force re-render on URL change
          />
        </View>
        <Text style={styles.name}>{name}</Text>
      </View>

      {/* --- Info Pills --- */}
      <View style={styles.infoBar}>
        <View style={styles.infoPill}>
          <FontAwesome5 name="industry" size={14} color="#41b06e" />
          <Text style={styles.infoText}>{industry}</Text>
        </View>
        <View style={styles.infoPill}>
          <FontAwesome5 name="users" size={14} color="#41b06e" />
          <Text style={styles.infoText}>{cofounders.length} Co-founders</Text>
        </View>
      </View>

      {/* --- About Section --- */}
      <View style={styles.aboutBox}>
        <Text style={styles.aboutTitle}>About us:</Text>
        <Text style={styles.aboutText}>
          {about_content}
        </Text>
      </View>

      {/* --- Business Plan Section --- */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionHeader}>Business Plan</Text>
        <Text style={styles.sectionText}>
          {business_plan_content}
        </Text>
      </View>

      {/* if compact, stop here */}
      {compact && null}

      {/* --- Full Details (compact=false) --- */}
      {!compact && (
        <>
          {/* Co-founders Section */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionHeader}>Co-founders</Text>
            {cofounders.map((cofounder, index) => (
              <View key={index} style={styles.fitRow}>
                <Text style={styles.fitValue}>{cofounder}</Text>
              </View>
            ))}
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
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Comfortaa_400Regular',
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
});
