import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { itemService } from '../../services/itemService';
import { claimService } from '../../services/claimService';
import { colors } from '../../utils/colors';
import { API_BASE_URL } from '../../config';
import CustomButton from '../../components/CustomButton';

const ProfileScreen = ({ navigation }) => {
  const { user, isAdmin, logout } = useContext(AuthContext);

  const [apiStatus, setApiStatus] = useState('Checking...');
  const [reportCount, setReportCount] = useState(0);
  const [claimCount, setClaimCount] = useState(0);
  const [testingApi, setTestingApi] = useState(false);

  useEffect(() => {
    checkHealth();
    loadUserStats();
  }, []);

  const checkHealth = async () => {
    try {
      setTestingApi(true);
      const res = await authService.checkHealth();
      if (res.success) {
        setApiStatus('🟢 Online (Hosted)');
      } else {
        setApiStatus('🟡 Degraded');
      }
    } catch (err) {
      setApiStatus('🔴 Offline');
    } finally {
      setTestingApi(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const itemsRes = await itemService.getItems();
      if (itemsRes.success && Array.isArray(itemsRes.data)) {
        const myReports = itemsRes.data.filter(
          (i) => i.reportedBy?._id === user?._id || i.reportedBy === user?._id
        );
        setReportCount(myReports.length);
      }

      const claimsRes = await claimService.getClaims();
      if (claimsRes.success && Array.isArray(claimsRes.data)) {
        setClaimCount(claimsRes.data.length);
      }
    } catch (err) {
      console.log('Error loading stats:', err.message);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Student User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'student@sliit.lk'}</Text>
        <View style={[styles.roleBadge, isAdmin && styles.adminRoleBadge]}>
          <Text style={[styles.roleText, isAdmin && styles.adminRoleText]}>
            {isAdmin ? '🛡️ Campus Administrator' : '🎓 SLIIT Student'}
          </Text>
        </View>
      </View>

      {/* Activity Counters */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{reportCount}</Text>
          <Text style={styles.statLabel}>My Reports</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{claimCount}</Text>
          <Text style={styles.statLabel}>My Claims</Text>
        </View>
      </View>

      {/* Admin Quick Menu (if Admin) */}
      {isAdmin && (
        <View style={styles.menuSection}>
          <Text style={styles.menuHeading}>Administrator Management</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminClaims')}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Review Pending Claims</Text>
              <Text style={styles.menuSubtitle}>
                Approve or reject ownership proofs
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminItemManagement')}
          >
            <Text style={styles.menuIcon}>🗄️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Item Registry Audit</Text>
              <Text style={styles.menuSubtitle}>
                Audit active, claimed, and resolved records
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Academic / Backend Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>System & Deployment Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Module:</Text>
          <Text style={styles.infoValue}>SE2020 - Web & Mobile Tech</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Academic Year:</Text>
          <Text style={styles.infoValue}>Year 2 Semester 2 — 2026</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>API Base URL:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {API_BASE_URL}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>API Status:</Text>
          <TouchableOpacity onPress={checkHealth}>
            <Text style={styles.apiStatusText}>{apiStatus}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <CustomButton
        title="Sign Out"
        variant="danger"
        onPress={handleLogout}
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
  },
  adminRoleBadge: {
    backgroundColor: '#FEF3C7',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  adminRoleText: {
    color: '#B45309',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 22,
    color: colors.textMuted,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '65%',
  },
  apiStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  logoutBtn: {
    marginBottom: 40,
  },
});

export default ProfileScreen;
