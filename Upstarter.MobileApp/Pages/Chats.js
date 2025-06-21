import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Chat from '../Components/Chat';
import { useNavigation } from '@react-navigation/native';

// Example chat data
const chatData = [
  {
    id: 1,
    name: 'Julen',
    lastMessage: 'Hey, lets talk',
    profileImage: { uri: 'https://randomuser.me/api/portraits/men/33.jpg' },  
    unreadCount: 2,
  },
  {
    id: 2,
    name: 'Julen',
    lastMessage: 'Hey, lets talk',
    profileImage: { uri: 'https://randomuser.me/api/portraits/men/34.jpg' },  
    unreadCount: 0,
  },
  {
    id: 3,
    name: 'Julen',
    lastMessage: 'Hey, lets talk',
   profileImage: { uri: 'https://randomuser.me/api/portraits/men/35.jpg' },  
    unreadCount: 1,
  },
  {
    id: 4,
    name: 'Julen',
    lastMessage: 'Hey, lets talk',
    profileImage: { uri: 'https://randomuser.me/api/portraits/men/36.jpg' },  
    unreadCount: 0,
  },
  {
    id: 5,
    name: 'Julen',
    lastMessage: 'Hey, lets talk',
    profileImage: { uri: 'https://randomuser.me/api/portraits/men/37.jpg' },  
    unreadCount: 3,
  },
];

export default function Chats() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {chatData.map(chat => (
          <Chat
            key={chat.id}
            name={chat.name}
            lastMessage={chat.lastMessage}
            profileImage={chat.profileImage}
            unreadCount={chat.unreadCount}
            onPress={() => navigation.navigate('CurrentChat', {
              name: chat.name,
              profileImage: chat.profileImage,
            })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 24,
  },
  header: {
    fontSize: 40,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
    color: '#111',
    fontFamily: 'sans-serif',
  },
  scrollContent: {
    paddingBottom: 16,
  },
}); 