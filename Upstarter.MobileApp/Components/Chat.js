import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Chat component for displaying a chat preview.
 * @param {object} props
 * @param {string} props.name - The name of the person.
 * @param {string} props.lastMessage - The last message sent.
 * @param {string} props.profileImage - The source for the profile image (require or uri).
 * @param {number} [props.unreadCount] - Number of unread messages.
 * @param {function} [props.onPress] - Function to call when pressed.
 */
const Chat = ({ name, lastMessage, profileImage, unreadCount, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image source={profileImage} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.lastMessage}>{lastMessage}</Text>
      </View>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0ACF83',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#41b06e',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  lastMessage: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#41b06e',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Chat; 