import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

const SplashScreen = ({ navigation }) => {
  const { isLoading, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigation.replace('App');
      } else {
        navigation.replace('Login');
      }
    }
  }, [isLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>🎓</Text>
      </View>
      <Text style={styles.brandTitle}>CampusConnect</Text>
      <Text style={styles.tagline}>Lost & Found Management System</Text>
      <Text style={styles.subtext}>SLIIT SE2020 Academic Project</Text>
      <ActivityIndicator size="small" color="#FFFFFF" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 44,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: colors.secondaryLight,
    marginTop: 6,
    fontWeight: '500',
  },
  subtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loader: {
    marginTop: 40,
  },
});

export default SplashScreen;
