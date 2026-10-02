import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { itemService } from '../../services/itemService';
import { colors } from '../../utils/colors';
import { validateRequired } from '../../utils/validation';
import CustomButton from '../../components/CustomButton';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Clothing',
  'Accessories',
  'Other',
];

const CreateItemScreen = ({ navigation, route }) => {
  const defaultType = route.params?.defaultType || 'Lost';

  const [itemType, setItemType] = useState(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateReported, setDateReported] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Photo Selection via Expo ImagePicker
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Media library permission is needed to attach an item photograph.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (e) {
      console.error('Image picker error:', e);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    const titleErr = validateRequired(title, 'Title');
    const descErr = validateRequired(description, 'Description');
    const locErr = validateRequired(location, 'Location');

    if (titleErr || descErr || locErr) {
      setErrorMessage(titleErr || descErr || locErr);
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('location', location.trim());
      formData.append('itemType', itemType);
      formData.append('dateReported', dateReported);

      if (image) {
        const uriParts = (image.fileName || image.uri).split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';

        if (Platform.OS === 'web') {
          if (image.file) {
            formData.append('image', image.file);
          } else {
            const blobRes = await fetch(image.uri);
            const blob = await blobRes.blob();
            formData.append('image', blob, `photo_${Date.now()}.${fileType}`);
          }
        } else {
          formData.append('image', {
            uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
            name: `photo_${Date.now()}.${fileType}`,
            type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
          });
        }
      }

      const res = await itemService.createItem(formData);
      if (res.success) {
        Alert.alert(
          'Report Submitted',
          `Your ${itemType.toLowerCase()} item report has been saved to the campus database.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (err) {
      setErrorMessage(err.message);
      Alert.alert('Submission Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Report Lost or Found Item</Text>
        <Text style={styles.formSubtitle}>
          Provide accurate details to assist campus recovery.
        </Text>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Item Type Selector */}
        <Text style={styles.label}>Item Report Type *</Text>
        <View style={styles.typeToggleRow}>
          <TouchableOpacity
            style={[
              styles.typeToggleBtn,
              itemType === 'Lost' && styles.typeToggleLostActive,
            ]}
            onPress={() => setItemType('Lost')}
          >
            <Text
              style={[
                styles.typeToggleText,
                itemType === 'Lost' && styles.typeToggleTextActive,
              ]}
            >
              🔴 Lost Item
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeToggleBtn,
              itemType === 'Found' && styles.typeToggleFoundActive,
            ]}
            onPress={() => setItemType('Found')}
          >
            <Text
              style={[
                styles.typeToggleText,
                itemType === 'Found' && styles.typeToggleTextActive,
              ]}
            >
              🟢 Found Item
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Black Samsung Galaxy S23"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        {/* Category Picker */}
        <Text style={styles.label}>Category *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Location Input */}
        <Text style={styles.label}>Location Lost / Found *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Main Library 2nd Floor Silent Area"
          placeholderTextColor={colors.textMuted}
          value={location}
          onChangeText={setLocation}
        />

        {/* Date Input */}
        <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          value={dateReported}
          onChangeText={setDateReported}
        />

        {/* Detailed Description */}
        <Text style={styles.label}>Detailed Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe color, brand, stickers, unique scratches, or accessories..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Image Attachment */}
        <Text style={styles.label}>Item Photograph (Optional)</Text>
        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => setImage(null)}
            >
              <Text style={styles.removeImageText}>✕ Remove Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
            <Text style={styles.pickImageIcon}>📷</Text>
            <Text style={styles.pickImageText}>Select Image from Gallery</Text>
            <Text style={styles.pickImageHint}>
              Max 5MB (JPEG, PNG, or WebP)
            </Text>
          </TouchableOpacity>
        )}

        {/* Submit Button */}
        <CustomButton
          title={submitting ? 'Submitting Report...' : 'Publish Item Report'}
          onPress={handleSubmit}
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
  formCard: {
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
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  formSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
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
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  typeToggleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeToggleLostActive: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.danger,
  },
  typeToggleFoundActive: {
    backgroundColor: '#D1FAE5',
    borderColor: colors.success,
  },
  typeToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeToggleTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 90,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  pickImageBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primaryLight,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    marginVertical: 6,
  },
  pickImageIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  pickImageText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  pickImageHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removeImageBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  removeImageText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 24,
  },
});

export default CreateItemScreen;
