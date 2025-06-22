import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, Dimensions, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { SERVER_URL } from '../../constants/constants';

export default function Welcome({ navigation }) {
  const [testResponse, setTestResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testBackendConnection = async () => {
    setIsLoading(true);
    try {
      // Use your computer's IP address instead of localhost
      // You can find your IP by running 'ipconfig' on Windows or 'ifconfig' on Mac/Linux
      const response = await axios.get(`${SERVER_URL}/load_users_swipe`);
      setTestResponse(response.data.content);
      Alert.alert('Success', 'Backend connection successful!');
    } catch (error) {
      console.error('Backend connection error:', error);
      Alert.alert('Error', 'Failed to connect to backend: ' + error.message);
      setTestResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserList = () => {
    if (!testResponse || !Array.isArray(testResponse)) {
      return null;
    }

    return (
      <ScrollView style={styles.userListContainer}>
        {testResponse.map((user, index) => (
          <View key={index} style={styles.userCard}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userInfo}>University: {user.university}</Text>
            <Text style={styles.userInfo}>Major: {user.major}</Text>
            <Text style={styles.userInfo}>Education: {user.education_level}</Text>
            <Text style={styles.userInfo}>About: {user.about_me}</Text>
            <Text style={styles.userInfo}>Co-founder: {user.is_cofounder ? 'Yes' : 'No'}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconsContainer}>
        <Image source={require('./../../assets/images/business-model.png')} style={[styles.icon, styles.topRight]}/>
        <Image source={require('./../../assets/images/prototype.png')} style={[styles.icon, styles.bottomLeft]}/>
        <Image source={require('./../../assets/images/phoneBox.png')} style={[styles.iconLong, styles.centerIcon]}/>
        <Image source={require('./../../assets/images/connectedChart.png')} style={[styles.icon2, styles.bottomCenter]}/>
        <Image source={require('./../../assets/images/expandingBox.png')} style={[styles.icon, styles.bottomRight]}/>
        <Image source={require('./../../assets/images/bar-chart.png')} style={[styles.icon, styles.topLeft]}/>
      </View>

        <View style={styles.titleContainer}>
          <View style={styles.box}>
          <Image source={require('./../../assets/images/UpstarterTitleSubtitles.png')} style={styles.logoImage}/>
         </View>
         </View >
        
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>LOG IN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerButtonText}>REGISTER</Text>
        </TouchableOpacity>
      </View>

      {/* Test Backend Connection Section */}
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  iconsContainer: {
    flex: 1,
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    width:52,
    height:52,
  },
  icon2: {
    position: 'absolute',
    width:52,
    height:60,
  },
  iconLong: {
    position: 'absolute',
    width:52,
    height:80,
  },
  topLeft: {
    top: '10%',
    left: '20%',
  },
  topRight: {
    top: '10%',
    right: '10%',
  },
  centerIcon: {
    top: '30%',
    alignSelf: 'center',
  },
  bottomLeft: {
    bottom: '20%',
    left: '10%',
  },
  bottomCenter: {
    bottom: '10%',
    alignSelf: 'center',
  },
  bottomRight: {
    bottom: '20%',
    right: '10%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  upText: {
    color: '#00BFA6',
  },
  starterText: {
    color: '#333',
  },
  subtitle: {
    color: 'black',
    fontSize: 32,
    fontWeight: 400,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  loginButton: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '45%',
  },
  loginButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#0ACF83',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '45%',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // logi image, best advice to make it scale for smalla nd larger decides
  titleContainer: {
    flex: 1,
 //   borderWidth: 1,
    borderColor: 'red',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '100%', // Percentage-based width
    aspectRatio: 1, // Maintains square shape
   // borderWidth: 1,
  //  borderColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',

    maxWidth: 600
  },
  logoImage: {

    width: Dimensions.get('window').width * 0.8, // 75% of screen width
    height: Dimensions.get('window').width * 0.3 ,
   // width:  '75%',
    maxHeight: 300,
    alignSelf: 'center'
  },
  testSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#0ACF83',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '80%',
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    width: '80%',
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userListContainer: {
    maxHeight: 200,
  },
  userCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 14,
  },
}); 