import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BackHandler, Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { useNavigationContainerRef, useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { ModeProvider } from './context/ModeContext';

// Import auth screens
import Welcome from './Pages/Auth/Welcome';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';

// Import main screens
import Matching from './Pages/Matching';
import Search from './Pages/Search';
import Workspace from './Pages/Workspace';
import Chats from './Pages/Chats';
import UserPage from './Pages/UserPage';
import CurrentChat from './Pages/CurrentChat';
import ChatsStack from './Pages/ChatsStack';
import FoundersChat from './Pages/FoundersChat';
import MatchingStartups from './Pages/MatchingStartups';
import { useMode } from './context/ModeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { mode } = useMode();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Matching') {
            iconName = focused 
              ? (mode === 'founder' ? 'people' : 'business') 
              : (mode === 'founder' ? 'people-outline' : 'business-outline');
          } else {
            // Handle other icons as before
            switch (route.name) {
              case 'Search':
                iconName = focused ? 'star' : 'star-outline';
                break;
              case 'Workspace':
                iconName = focused ? 'briefcase' : 'briefcase-outline';
                break;
              case 'Chats':
                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
            }
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#41b06e',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: 'white',
        },
        headerTintColor: 'black',
        headerTitleStyle: {
          fontWeight: '100',
        },
        headerTitle: () => {
          const navigation = useNavigation();
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 0, padding: 4 }}>
                <Ionicons name="arrow-back" size={28} color="#222" />
              </TouchableOpacity>
              <Image
                source={require('./assets/images/UpstarterTitleSubtitles.png')}
                style={{
                  width: 180,
                  height: 60,
                  resizeMode: 'contain',
                  top: 10
                }}
              />
            </View>
          );
        },
      })}
    >
      {/* Only one Matching screen - conditionally render the component */}
      <Tab.Screen 
        name="Matching" 
        component={mode === 'founder' ? Matching : MatchingStartups}
        options={{
          title: mode === 'founder' ? 'Find Investors' : 'Find Startups'
        }}
      />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Workspace" component={Workspace} />
      <Tab.Screen name="Chats" component={ChatsStack} />
      <Tab.Screen name="Profile" component={UserPage} />
      
      {/* Remove the duplicate MatchingStartups screen */}
    </Tab.Navigator>
  );
}

export default function App() {
  const navigationRef = useNavigationContainerRef();
  
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigationRef.current) {
        // Get the current route name
        const currentRoute = navigationRef.current.getCurrentRoute()?.name;

        // If we're in the MainApp tabs and not in Matching (first tab)
        if (currentRoute && currentRoute !== 'Matching' && currentRoute !== 'Welcome') {
          // Navigate back
          navigationRef.current.goBack();
          return true; // Prevent default behavior
        }
        
        // If we're in Matching or Welcome, let the default back behavior happen
        // This will typically exit the app as it's the root screen
        return false;
      }
      return false;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <ModeProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen name="FoundersChat" component={FoundersChat} />
        </Stack.Navigator>
      </NavigationContainer>
    </ModeProvider>
    
  );


}
