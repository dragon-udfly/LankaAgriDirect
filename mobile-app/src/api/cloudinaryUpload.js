import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8080/api/v1'
  : 'http://10.0.2.2:8080/api/v1';

/**
 * Upload an image to the backend's Cloudinary upload endpoint.
 * Works on both web (File object) and native (uri string).
 *
 * @param {string|File} imageSource - On native: file URI string. On web: File object.
 * @returns {Promise<string>} - The Cloudinary secure URL.
 */
export const uploadImage = async (imageSource) => {
  const token = await AsyncStorage.getItem('auth_token');
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // On web, imageSource is a File object from <input type="file">
    formData.append('file', imageSource);
  } else {
    // On native, imageSource is an object from image picker: { uri, type, fileName }
    formData.append('file', {
      uri: imageSource.uri,
      type: imageSource.type || 'image/jpeg',
      name: imageSource.fileName || 'photo.jpg',
    });
  }

  const headers = {
    'Content-Type': 'multipart/form-data',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/upload/image`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Image upload failed');
  }

  const data = await response.json();
  return data.url;
};
