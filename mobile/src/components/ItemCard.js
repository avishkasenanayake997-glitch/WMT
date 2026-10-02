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

const ItemCard = ({ item, onPress }) => {
  // Determine image source
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
      onPress={() => onPress && onPress(item)}
    >
      <View style={styles.imageContainer}>
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
          </View>
        )}
        <View style={styles.typeBadgeWrapper}>
          <StatusBadge label={item.itemType} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.category}>{item.category}</Text>
          <StatusBadge label={item.status} />
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>
            {formatDate(item.dateReported || item.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    backgroundColor: '#F1F5F9',
    position: 'relative',
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
    backgroundColor: '#F1F5F9',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  typeBadgeWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
});

export default ItemCard;
