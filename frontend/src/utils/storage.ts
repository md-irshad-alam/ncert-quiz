import { Platform } from 'react-native';

// Web fallback using localStorage since expo-secure-store doesn't work on web
const isWeb = Platform.OS === 'web';

let SecureStore: any = null;
if (!isWeb) {
  SecureStore = require('expo-secure-store');
}

export const setToken = async (key: string, value: string) => {
  try {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error('Error saving token', error);
  }
};

export const getToken = async (key: string): Promise<string | null> => {
  try {
    if (isWeb) {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error('Error reading token', error);
    return null;
  }
};

export const removeToken = async (key: string) => {
  try {
    if (isWeb) {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error('Error removing token', error);
  }
};
