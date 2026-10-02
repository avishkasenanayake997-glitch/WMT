import React, { useState, useEffect, useCallback } from 'react';
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
import { API_BASE_URL } from '../../config';
import CustomButton from '../../components/CustomButton';
import LoadingView from '../../components/LoadingView';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Clothing',
  'Accessories',
  'Other',
];

const STATUSES = ['Active', 'Claimed', 'Resolved'];

const EditItemScreen = ({ route, navigation }) => {
  const { itemId } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [itemType, setItemType] = useState('Lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('Active');
  const [dateReported, setDateReported] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadItem = useCallback(async () => {
    try {
      const res = await itemService.getItemById(itemId);
      if (res.success && res.data) {
        const d = res.data;
        setTitle(d.title || '');
        setItemType(d.itemType || 'Lost');
        setCategory(d.category || 'Electronics');
        setDescription(d.description || '');
        setLocation(d.location || '');
        setStatus(d.status || 'Active');
        setExistingImage(d.image || '');
        if (d.dateReported) {
          setDateReported(new Date(d.dateReported).toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      Alert.alert('Error', err.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [itemId, navigation]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewImage(result.assets[0]);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpdate = async () => {
    setErrorMessage('');
    if (!title.trim() || !description.trim() || !location.trim()) {
      setErrorMessage('Please fill in all required fields');
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
      formData.append('status', status);
      if (dateReported) {
        formData.append('dateReported', dateReported);
      }

      if (newImage) {
        const uriParts = (newImage.fileName || newImage.uri).split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';

        if (Platform.OS === 'web') {
          if (newImage.file) {
            formData.append('image', newImage.file);
          } else {
            const blobRes = await fetch(newImage.uri);
            const blob = await blobRes.blob();
            formData.append('image', blob, `updated_${Date.now()}.${fileType}`);
          }
        } else {
          formData.append('image', {
            uri:
              Platform.OS === 'ios'
                ? newImage.uri.replace('file://', '')
                : newImage.uri,
            name: `updated_${Date.now()}.${fileType}`,
            type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
          });
        }
      }

      const res = await itemService.updateItem(itemId, formData);
      if (res.success) {
        Alert.alert('Success', 'Item details updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      setErrorMessage(err.message);
      Alert.alert('Update Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingView message="Loading item details..." />;
  }

  let displayImageUri = null;
  if (newImage) {
    displayImageUri = newImage.uri;
  } else if (existingImage) {
    if (
      existingImage.startsWith('http://') ||
      existingImage.startsWith('https://')
    ) {
      displayImageUri = existingImage;
    } else if (existingImage.startsWith('/uploads/')) {
      displayImageUri = `${API_BASE_URL}${existingImage}`;
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Edit Item Report</Text>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((st) => (
            <TouchableOpacity
              key={st}
              style={[
                styles.statusPill,
                status === st && styles.statusPillActive,
              ]}
              onPress={() => setStatus(st)}
            >
              <Text
                style={[
                  styles.statusPillText,
                  status === st && styles.statusPillTextActive,
                ]}
              >
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                category === cat && styles.categoryPillActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  category === cat && styles.categoryPillTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Date Reported *</Text>
        <TextInput
          style={styles.input}
          value={dateReported}
          onChangeText={setDateReported}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Item Photograph</Text>
        {displayImageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: displayImageUri }}
              style={styles.imagePreview}
            />
            <TouchableOpacity style={styles.changeImageBtn} onPress={pickImage}>
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
            <Text style={styles.pickImageText}>Select Image</Text>
          </TouchableOpacity>
        )}

        <CustomButton
          title={submitting ? 'Saving Changes...' : 'Save Changes'}
          onPress={handleUpdate}
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
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
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
  statusRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusPillTextActive: {
    color: '#FFFFFF',
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
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
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginVertical: 6,
  },
  pickImageText: {
    color: colors.primary,
    fontWeight: '600',
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
  changeImageBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  changeImageText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 20,
  },
});

export default EditItemScreen;
