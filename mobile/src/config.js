import { Platform } from 'react-native';

/**
 * CampusConnect API Configuration
 *
 * Automatically detects whether running in a Web Browser or Mobile Device:
 * - On Web: uses 'http://localhost:5000' (or current host)
 * - On Android Emulator: uses 'http://10.0.2.2:5000'
 * - On Physical Devices / Deployed: set your hosted Render URL or Wi-Fi IP
 */

const getBaseUrl = () => {
  // If deployed production URL is needed, uncomment below:
  // return 'https://campusconnect-api.onrender.com';

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      return `http://${hostname}:5000`;
    }
    return 'http://localhost:5000';
  }

  if (Platform.OS === 'android') {
    // 10.0.2.2 is Android emulator loopback to host localhost
    // Change to machine Wi-Fi IP (e.g. 'http://192.168.1.100:5000') for physical phones
    return 'http://10.0.2.2:5000';
  }

  // iOS simulator or default
  return 'http://localhost:5000';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  ME: `${API_BASE_URL}/api/auth/me`,
  ITEMS: `${API_BASE_URL}/api/items`,
  CLAIMS: `${API_BASE_URL}/api/claims`,
};
