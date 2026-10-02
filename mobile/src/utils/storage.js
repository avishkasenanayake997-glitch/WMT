import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@campusconnect_jwt_token';
const USER_KEY = '@campusconnect_user_profile';

export const storage = {
  // Token handlers
  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error getting token from AsyncStorage', e);
      return null;
    }
  },

  async setToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Error saving token to AsyncStorage', e);
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error removing token from AsyncStorage', e);
    }
  },

  // User profile handlers
  async getUser() {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error getting user from AsyncStorage', e);
      return null;
    }
  },

  async setUser(user) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user to AsyncStorage', e);
    }
  },

  async removeUser() {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error removing user from AsyncStorage', e);
    }
  },

  // Clear all session storage
  async clearSession() {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.error('Error clearing session from AsyncStorage', e);
    }
  },
};
