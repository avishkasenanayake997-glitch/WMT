import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { claimService } from '../../services/claimService';
import { colors } from '../../utils/colors';
import { formatDate } from '../../utils/validation';
import { API_BASE_URL } from '../../config';
import StatusBadge from '../../components/StatusBadge';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';

const AdminClaimsScreen = ({ navigation }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingClaims = useCallback(async () => {
    try {
      const res = await claimService.getClaims({ status: 'Pending' });
      if (res.success && Array.isArray(res.data)) {
        setClaims(res.data);
      }
    } catch (err) {
      console.error('[AdminClaims] Fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingClaims();
  }, [fetchPendingClaims]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPendingClaims();
    });
    return unsubscribe;
  }, [navigation, fetchPendingClaims]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingClaims();
  };

  const handleDecision = (claim, decision) => {
    Alert.alert(
      `Confirm ${decision}`,
      `Are you sure you want to mark this claim as ${decision}?\n\nItem: ${
        claim.itemId?.title || 'Reported Item'
      }\nClaimant: ${claim.userId?.name || 'Student'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Confirm ${decision}`,
          style: decision === 'Approved' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setProcessingId(claim._id);
              const res = await claimService.updateClaimStatus(claim._id, decision);
              if (res.success) {
                Alert.alert('Decision Recorded', res.message);
                fetchPendingClaims();
              }
            } catch (err) {
              Alert.alert('Error', err.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingView message="Loading pending claims for review..." />;
  }

  const renderClaimItem = ({ item }) => {
    const linkedItem = item.itemId || {};
    const claimant = item.userId || {};

    let imageUri = null;
    if (linkedItem.image) {
      if (
        linkedItem.image.startsWith('http://') ||
        linkedItem.image.startsWith('https://')
      ) {
        imageUri = linkedItem.image;
      } else if (linkedItem.image.startsWith('/uploads/')) {
        imageUri = `${API_BASE_URL}${linkedItem.image}`;
      }
    }

    const isProcessing = processingId === item._id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {linkedItem.title || 'Found Item'}
          </Text>
          <StatusBadge label={item.status} />
        </View>

        <View style={styles.itemRow}>
          <View style={styles.thumbnailContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.thumbnail} />
            ) : (
              <View style={styles.placeholderThumbnail}>
                <Text style={styles.placeholderIcon}>📦</Text>
              </View>
            )}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.claimantName}>
              Claimant: {claimant.name || 'Student'}
            </Text>
            <Text style={styles.claimantEmail}>
              Email: {claimant.email || 'N/A'}
            </Text>
            <Text style={styles.claimDate}>
              Date: {formatDate(item.claimDate || item.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.messageLabel}>Verification Proof:</Text>
          <Text style={styles.messageText} numberOfLines={3}>
            "{item.message}"
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.btn, styles.viewDetailsBtn]}
            onPress={() =>
              navigation.navigate('ClaimDetails', { claimId: item._id })
            }
            disabled={isProcessing}
          >
            <Text style={styles.viewDetailsText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn]}
            onPress={() => handleDecision(item, 'Rejected')}
            disabled={isProcessing}
          >
            <Text style={styles.rejectText}>✕ Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.approveBtn]}
            onPress={() => handleDecision(item, 'Approved')}
            disabled={isProcessing}
          >
            <Text style={styles.approveText}>✓ Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Claim Review</Text>
        <Text style={styles.headerSubtitle}>
          Review student ownership proofs and approve or reject claims.
        </Text>
      </View>

      <FlatList
        data={claims}
        keyExtractor={(c) => c._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        renderItem={renderClaimItem}
        ListEmptyComponent={
          <EmptyState
            title="All Claims Reviewed"
            message="There are currently no pending claims requiring administrator attention."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
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
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
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
  claimDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  messageBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  messageLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  viewDetailsBtn: {
    backgroundColor: '#F1F5F9',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  rejectBtn: {
    backgroundColor: colors.dangerBg,
  },
  rejectText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  approveBtn: {
    backgroundColor: colors.primary,
  },
  approveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AdminClaimsScreen;
