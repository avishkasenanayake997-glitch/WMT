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
import { itemService } from '../../services/itemService';
import { colors } from '../../utils/colors';
import { formatDate } from '../../utils/validation';
import { API_BASE_URL } from '../../config';
import StatusBadge from '../../components/StatusBadge';
import CustomButton from '../../components/CustomButton';
import LoadingView from '../../components/LoadingView';

const ItemDetailsScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const { user, isAdmin } = useContext(AuthContext);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchItemDetails = useCallback(async () => {
    try {
      const res = await itemService.getItemById(itemId);
      if (res.success && res.data) {
        setItem(res.data);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [itemId, navigation]);

  useEffect(() => {
    fetchItemDetails();
  }, [fetchItemDetails]);

  const handleDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to remove this report? Associated claims will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const res = await itemService.deleteItem(itemId);
              if (res.success) {
                Alert.alert('Success', 'Item removed successfully');
                navigation.goBack();
              }
            } catch (err) {
              Alert.alert('Error', err.message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !item) {
    return <LoadingView message="Loading item details..." />;
  }

  // Determine image source
  let imageUri = null;
  if (item.image) {
    if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
      imageUri = item.image;
    } else if (item.image.startsWith('/uploads/')) {
      imageUri = `${API_BASE_URL}${item.image}`;
    }
  }

  const isOwner =
    item.reportedBy &&
    (item.reportedBy._id === user?._id || item.reportedBy === user?._id);

  const canEditOrDelete = isOwner || isAdmin;

  // RULE: Only show "Claim This Item" if itemType === 'Found' AND status === 'Active' AND not reported by current user
  const canClaim =
    item.itemType === 'Found' &&
    item.status === 'Active' &&
    !isOwner;

  return (
    <ScrollView style={styles.container}>
      {/* High-res Image Banner */}
      <View style={styles.imageBanner}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>
              {item.category === 'Electronics'
                ? '💻'
                : item.category === 'Documents'
                ? '📄'
                : item.category === 'Clothing'
                ? '👕'
                : item.category === 'Accessories'
                ? '🎒'
                : '📦'}
            </Text>
            <Text style={styles.placeholderText}>No photo provided</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Badges Row */}
        <View style={styles.badgeRow}>
          <StatusBadge label={item.itemType} />
          <View style={{ width: 8 }} />
          <StatusBadge label={item.status} />
          <View style={{ flex: 1 }} />
          <Text style={styles.categoryBadge}>{item.category}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{item.title}</Text>

        {/* Location & Date Metadata */}
        <View style={styles.metaCard}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
            <View>
              <Text style={styles.metaLabel}>Location</Text>
              <Text style={styles.metaValue}>{item.location}</Text>
            </View>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📅</Text>
            <View>
              <Text style={styles.metaLabel}>Date Reported</Text>
              <Text style={styles.metaValue}>
                {formatDate(item.dateReported || item.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>

        {/* Reporter Info */}
        {item.reportedBy && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Reported By</Text>
            <View style={styles.reporterCard}>
              <View style={styles.reporterAvatar}>
                <Text style={styles.reporterAvatarText}>
                  {item.reportedBy.name ? item.reportedBy.name.charAt(0) : 'U'}
                </Text>
              </View>
              <View>
                <Text style={styles.reporterName}>
                  {item.reportedBy.name || 'Campus Student'}
                </Text>
                <Text style={styles.reporterEmail}>
                  {item.reportedBy.email || 'SLIIT Student'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {canClaim && (
            <CustomButton
              title="🙋 Claim This Item"
              variant="secondary"
              onPress={() =>
                navigation.navigate('CreateClaim', {
                  item: {
                    _id: item._id,
                    title: item.title,
                    image: item.image,
                    location: item.location,
                  },
                })
              }
              style={styles.claimButton}
            />
          )}

          {item.status === 'Claimed' && (
            <View style={styles.claimedNotice}>
              <Text style={styles.claimedNoticeText}>
                🔒 This item has already been claimed and verified by campus administration.
              </Text>
            </View>
          )}

          {canEditOrDelete && (
            <View style={styles.ownerControls}>
              <CustomButton
                title="✏️ Edit Details"
                variant="outline"
                onPress={() =>
                  navigation.navigate('EditItem', { itemId: item._id })
                }
                style={styles.editBtn}
              />
              <CustomButton
                title="🗑️ Delete"
                variant="danger"
                loading={deleting}
                onPress={handleDelete}
                style={styles.deleteBtn}
              />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageBanner: {
    width: '100%',
    height: 260,
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
  },
  placeholderIcon: {
    fontSize: 64,
  },
  placeholderText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
  content: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    backgroundColor: colors.background,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: 16,
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
    marginHorizontal: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  reporterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  reporterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reporterAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reporterEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionsContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  claimButton: {
    marginVertical: 8,
  },
  claimedNotice: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginVertical: 10,
  },
  claimedNoticeText: {
    fontSize: 13,
    color: '#1E3A8A',
    fontWeight: '600',
    lineHeight: 18,
  },
  ownerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editBtn: {
    flex: 1,
    marginRight: 6,
  },
  deleteBtn: {
    flex: 1,
    marginLeft: 6,
  },
});

export default ItemDetailsScreen;
