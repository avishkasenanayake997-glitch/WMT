import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <View style={styles.rootWrapper}>
          <View style={styles.webContainer}>
            <RootNavigator />
          </View>
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate dark backdrop for desktop web browser viewing
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...Platform.select({
      web: {
        maxWidth: 580,
        width: '100%',
        alignSelf: 'center',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
});
