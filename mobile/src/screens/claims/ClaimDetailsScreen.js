import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { claimService } from '../../services/claimService';
import { colors } from '../../utils/colors';
import { formatDate } from '../../utils/validation';
import { API_BASE_URL } from '../../config';
import StatusBadge from '../../components/StatusBadge';
import CustomButton from '../../components/CustomButton';
import LoadingView from '../../components/LoadingView';

const ClaimDetailsScreen = ({ route, navigation }) => {
  const { claimId } = route.params;
  const { user, isAdmin } = useContext(AuthContext);

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaimDetails = useCallback(async () => {
    try {
      const res = await claimService.getClaimById(claimId);
      if (res.success && res.data) {
        setClaim(res.data);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [claimId, navigation]);

  useEffect(() => {
    fetchClaimDetails();
  }, [fetchClaimDetails]);

  const handleCancelClaim = () => {
    Alert.alert(
      'Cancel Claim',
      'Are you sure you want to cancel this pending claim?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await claimService.cancelClaim(claimId);
              if (res.success) {
                Alert.alert('Success', 'Claim has been cancelled.');
                setClaim(res.data);
              }
            } catch (err) {
              Alert.alert('Error', err.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAdminDecision = (status) => {
    Alert.alert(
      `Confirm ${status}`,
      `Are you sure you want to mark this claim as ${status}?${
        status === 'Approved'
          ? ' The item will automatically be updated to Claimed.'
          : ' The item will remain Active for other claims.'
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Confirm ${status}`,
          style: status === 'Approved' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await claimService.updateClaimStatus(claimId, status);
              if (res.success) {
                Alert.alert('Status Updated', res.message);
                setClaim(res.data);
              }
            } catch (err) {
              Alert.alert('Update Failed', err.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !claim) {
    return <LoadingView message="Loading claim details..." />;
  }

  const item = claim.itemId || {};
  let imageUri = null;
  if (item.image) {
    if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
      imageUri = item.image;
    } else if (item.image.startsWith('/uploads/')) {
      imageUri = `${API_BASE_URL}${item.image}`;
    }
  }

  const isOwner =
    claim.userId &&
    (claim.userId._id === user?._id || claim.userId === user?._id);

  const canCancel = isOwner && claim.status === 'Pending';
  const canAdminReview = isAdmin && claim.status === 'Pending';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Status Header */}
        <View style={styles.statusHeaderRow}>
          <Text style={styles.sectionHeader}>Claim Status</Text>
          <StatusBadge label={claim.status} />
        </View>

        {/* Linked Item Card */}
        <View style={styles.itemCard}>
          <View style={styles.thumbnailContainer}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderThumbnail}>
                <Text style={styles.placeholderIcon}>📦</Text>
              </View>
            )}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMeta}>📍 {item.location}</Text>
            <Text style={styles.itemMeta}>
              Reported: {formatDate(item.dateReported || item.createdAt)}
            </Text>
            <View style={{ marginTop: 4 }}>
              <StatusBadge label={item.status || 'Active'} />
            </View>
          </View>
        </View>

        {/* Claimant Info (if Admin viewing) */}
        {isAdmin && claim.userId && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Claimant Information</Text>
            <View style={styles.claimantCard}>
              <Text style={styles.claimantName}>{claim.userId.name}</Text>
              <Text style={styles.claimantEmail}>{claim.userId.email}</Text>
            </View>
          </View>
        )}

        {/* Submitted Proof Message */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Verification Proof Message</Text>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{claim.message}</Text>
          </View>
          <Text style={styles.dateSubmitted}>
            Submitted on {formatDate(claim.claimDate || claim.createdAt)}
          </Text>
        </View>

        {/* Decision / Status Explanation Banner */}
        {claim.status === 'Approved' && (
          <View style={styles.approvedBanner}>
            <Text style={styles.bannerTitle}>✅ Claim Approved</Text>
            <Text style={styles.bannerText}>
              Ownership was verified by campus administration. The item is marked as Claimed.
            </Text>
          </View>
        )}

        {claim.status === 'Rejected' && (
          <View style={styles.rejectedBanner}>
            <Text style={styles.bannerTitle}>❌ Claim Rejected</Text>
            <Text style={styles.bannerText}>
              The provided proof did not match the item specifications. The item remains active.
            </Text>
          </View>
        )}

        {claim.status === 'Cancelled' && (
          <View style={styles.cancelledBanner}>
            <Text style={styles.bannerTitle}>⚪ Claim Cancelled</Text>
            <Text style={styles.bannerText}>
              This claim was cancelled by the student.
            </Text>
          </View>
        )}

        {/* Actions */}
        {canCancel && (
          <CustomButton
            title="Cancel This Claim"
            variant="danger"
            loading={actionLoading}
            onPress={handleCancelClaim}
            style={styles.cancelBtn}
          />
        )}

        {canAdminReview && (
          <View style={styles.adminActionRow}>
            <CustomButton
              title="✓ Approve Claim"
              variant="primary"
              loading={actionLoading}
              onPress={() => handleAdminDecision('Approved')}
              style={styles.approveBtn}
            />
            <CustomButton
              title="✕ Reject Claim"
              variant="danger"
              loading={actionLoading}
              onPress={() => handleAdminDecision('Rejected')}
              style={styles.rejectBtn}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  thumbnailContainer: {
    width: 76,
    height: 76,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  claimantCard: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  claimantName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  claimantEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  messageBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  messageText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  dateSubmitted: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  approvedBanner: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  rejectedBanner: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  cancelledBanner: {
    backgroundColor: '#F1F5F9',
    borderLeftWidth: 4,
    borderLeftColor: '#94A3B8',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    color: colors.textPrimary,
  },
  bannerText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cancelBtn: {
    marginTop: 10,
  },
  adminActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  approveBtn: {
    flex: 1,
    marginRight: 6,
  },
  rejectBtn: {
    flex: 1,
    marginLeft: 6,
  },
});

export default ClaimDetailsScreen;
