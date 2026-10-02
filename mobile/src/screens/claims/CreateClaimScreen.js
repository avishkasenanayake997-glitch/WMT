import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { claimService } from '../../services/claimService';
import { colors } from '../../utils/colors';
import { API_BASE_URL } from '../../config';
import CustomButton from '../../components/CustomButton';

const CreateClaimScreen = ({ route, navigation }) => {
  const { item } = route.params;

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitClaim = async () => {
    setErrorMessage('');

    if (!message || !message.trim()) {
      setErrorMessage('Please provide a message proving your ownership.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await claimService.createClaim({
        itemId: item._id,
        message: message.trim(),
      });

      if (res.success) {
        Alert.alert(
          'Claim Submitted',
          'Your claim has been submitted to campus administration for review. You can track its status in the My Claims tab.',
          [
            {
              text: 'View My Claims',
              onPress: () => {
                navigation.navigate('MyClaims');
              },
            },
          ]
        );
      }
    } catch (err) {
      setErrorMessage(err.message);
      Alert.alert('Claim Submission Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  let imageUri = null;
  if (item.image) {
    if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
      imageUri = item.image;
    } else if (item.image.startsWith('/uploads/')) {
      imageUri = `${API_BASE_URL}${item.image}`;
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>Claim Found Belonging</Text>
        <Text style={styles.subtitle}>
          Campus authorities will review your submission before releasing this item.
        </Text>

        {/* Item Summary Card */}
        <View style={styles.itemSummary}>
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
          <View style={styles.itemSummaryDetails}>
            <Text style={styles.itemSummaryTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.itemSummaryLocation} numberOfLines={1}>
              📍 {item.location}
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Proof Message Prompt */}
        <Text style={styles.label}>
          Proof of Ownership *
        </Text>
        <Text style={styles.hint}>
          Please describe distinguishing features not obvious in photos (e.g. lockscreen wallpaper, serial number, contents of wallet/bag, stickers, unique scratches).
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="Type your verification details here..."
          placeholderTextColor={colors.textMuted}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <CustomButton
          title={submitting ? 'Submitting Claim...' : 'Submit Claim'}
          onPress={handleSubmitClaim}
          loading={submitting}
          style={styles.submitBtn}
        />
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  itemSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
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
    fontSize: 24,
  },
  itemSummaryDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemSummaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemSummaryLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: '#FAFAFA',
    minHeight: 120,
    marginBottom: 20,
  },
  submitBtn: {
    marginTop: 6,
  },
});

export default CreateClaimScreen;
