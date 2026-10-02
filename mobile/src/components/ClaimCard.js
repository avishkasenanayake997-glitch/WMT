import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../utils/colors';
import { formatDate } from '../utils/validation';
import { API_BASE_URL } from '../config';
import StatusBadge from './StatusBadge';

const ClaimCard = ({ claim, onPress }) => {
  const item = claim.itemId || {};

  let imageUri = null;
  if (item.image) {
    if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
      imageUri = item.image;
    } else if (item.image.startsWith('/uploads/')) {
      imageUri = `${API_BASE_URL}${item.image}`;
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => onPress && onPress(claim)}
    >
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

      <View style={styles.details}>
        <View style={styles.topRow}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title || 'Reported Item'}
          </Text>
          <StatusBadge label={claim.status} />
        </View>

        <Text style={styles.messageSnippet} numberOfLines={2}>
          "{claim.message}"
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.dateText}>
            Claimed: {formatDate(claim.claimDate || claim.createdAt)}
          </Text>
          {claim.userId && claim.userId.name && (
            <Text style={styles.claimantText} numberOfLines={1}>
              By: {claim.userId.name}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    width: 72,
    height: 72,
    borderRadius: 10,
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
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  messageSnippet: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  claimantText: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '600',
  },
});

export default ClaimCard;
