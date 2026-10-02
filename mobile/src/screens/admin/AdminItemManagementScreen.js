import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { itemService } from '../../services/itemService';
import { colors } from '../../utils/colors';
import { formatDate } from '../../utils/validation';
import StatusBadge from '../../components/StatusBadge';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';

const AdminItemManagementScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchItems = useCallback(async () => {
    try {
      const params = {};
      if (selectedStatus !== 'All') {
        params.status = selectedStatus;
      }
      const res = await itemService.getItems(params);
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('[AdminItems] Fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleStatusChange = (item, newStatus) => {
    Alert.alert(
      `Change Status to ${newStatus}`,
      `Are you sure you want to mark "${item.title}" as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const res = await itemService.updateItem(item._id, {
                status: newStatus,
              });
              if (res.success) {
                Alert.alert('Status Updated', `Item is now ${newStatus}`);
                fetchItems();
              }
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Delete Item',
      `Permanently delete "${item.title}" and any associated claims?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await itemService.deleteItem(item._id);
              if (res.success) {
                Alert.alert('Deleted', 'Item report removed');
                fetchItems();
              }
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const renderStatusTab = (status) => (
    <TouchableOpacity
      style={[
        styles.tabPill,
        selectedStatus === status && styles.tabPillActive,
      ]}
      onPress={() => setSelectedStatus(status)}
    >
      <Text
        style={[
          styles.tabText,
          selectedStatus === status && styles.tabTextActive,
        ]}
      >
        {status}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingView message="Loading campus item registry..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Item Registry</Text>
        <Text style={styles.headerSubtitle}>
          Audit reports, manage active listings, and resolve recovered items.
        </Text>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabsRow}>
        {renderStatusTab('All')}
        {renderStatusTab('Active')}
        {renderStatusTab('Claimed')}
        {renderStatusTab('Resolved')}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <StatusBadge label={item.itemType} />
              <View style={{ width: 6 }} />
              <StatusBadge label={item.status} />
              <View style={{ flex: 1 }} />
              <Text style={styles.dateText}>
                {formatDate(item.dateReported || item.createdAt)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ItemDetails', { itemId: item._id })
              }
            >
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>

            <Text style={styles.itemLocation}>📍 {item.location}</Text>
            <Text style={styles.reporterInfo}>
              Reporter: {item.reportedBy?.name || 'Student'} (
              {item.reportedBy?.email || 'N/A'})
            </Text>

            {/* Admin Action Controls */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  navigation.navigate('EditItem', { itemId: item._id })
                }
              >
                <Text style={styles.actionBtnText}>✏️ Edit</Text>
              </TouchableOpacity>

              {item.status !== 'Resolved' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.resolveBtn]}
                  onPress={() => handleStatusChange(item, 'Resolved')}
                >
                  <Text style={styles.resolveBtnText}>✓ Resolve</Text>
                </TouchableOpacity>
              )}

              {item.status === 'Resolved' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.activeBtn]}
                  onPress={() => handleStatusChange(item, 'Active')}
                >
                  <Text style={styles.activeBtnText}>Reopen</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDeleteItem(item)}
              >
                <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Items"
            message={`No items found matching status "${selectedStatus}".`}
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  reporterInfo: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginLeft: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  resolveBtn: {
    backgroundColor: '#ECFDF5',
  },
  resolveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  activeBtn: {
    backgroundColor: '#EFF6FF',
  },
  activeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  deleteBtn: {
    backgroundColor: colors.dangerBg,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
});

export default AdminItemManagementScreen;
