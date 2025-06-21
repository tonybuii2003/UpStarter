import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export default function Intro() {
  const uploadImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      // Pick the image
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!pickerResult.canceled) {
        const formData = new FormData();
        formData.append('file', {
          uri: pickerResult.assets[0].uri,
          type: 'image/jpeg',
          name: 'upload.jpg',
        });
        formData.append('username', 'vicsonsam2');
        formData.append('image_type', 'profile');
        formData.append('container', 'images');
        console.log(formData);
        const response = await axios.post('http://10.0.0.61:8080/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Upload successful:', response.data);
        alert('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upstarter</Text>
      <StatusBar style="auto" />
      <Image
        style={styles.placeholderImage}
        source={require('./../assets/images/vicsonsam_user_profile.jpeg')} // Make sure to add a placeholder image in your assets
      />
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={uploadImage}
      >
        <Text style={styles.buttonText}>Upload Image</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#41b06e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 20,
    backgroundColor: '#fff',
  },
  uploadButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#41b06e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});