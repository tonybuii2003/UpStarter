import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Chats from './Chats';
import CurrentChat from './CurrentChat';

const Stack = createNativeStackNavigator();

export default function ChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chats" component={Chats} />
      <Stack.Screen name="CurrentChat" component={CurrentChat} />
    </Stack.Navigator>
  );
} 