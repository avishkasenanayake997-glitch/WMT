import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { itemService } from '../../services/itemService';
import { colors } from '../../utils/colors';
import ItemCard from '../../components/ItemCard';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';

const ItemListScreen = ({ navigation, route }) => {
  const initialType = route.params?.initialType || 'All';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const params = {};
      if (selectedFilter === 'Lost' || selectedFilter === 'Found') {
        params.type = selectedFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await itemService.getItems(params);
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('[ItemList] Fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter, searchQuery]);

  useEffect(() => {
    if (route.params?.initialType) {
      setSelectedFilter(route.params.initialType);
    }
  }, [route.params?.initialType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const renderFilterButton = (filterName, label) => {
    const isSelected = selectedFilter === filterName;
    return (
      <TouchableOpacity
        style={[
          styles.filterPill,
          isSelected && styles.filterPillActive,
        ]}
        onPress={() => setSelectedFilter(filterName)}
      >
        <Text
          style={[
            styles.filterText,
            isSelected && styles.filterTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, location, description..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={fetchItems}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
            }}
          >
            <Text style={styles.clearSearchIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Segmented Filter Pills */}
      <View style={styles.filtersRow}>
        {renderFilterButton('All', 'All Items')}
        {renderFilterButton('Lost', '🔴 Lost Items')}
        {renderFilterButton('Found', '🟢 Found Items')}
      </View>

      {/* Item List Feed */}
      {loading ? (
        <LoadingView message="Fetching items..." />
      ) : (
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
            <ItemCard
              item={item}
              onPress={(selected) =>
                navigation.navigate('ItemDetails', { itemId: selected._id })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title={`No ${selectedFilter === 'All' ? '' : selectedFilter} Items`}
              message="No reported items match your current criteria. Check back later or create a new report."
              actionTitle="Report Item"
              onAction={() => navigation.navigate('CreateItem')}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 46,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  clearSearchIcon: {
    fontSize: 14,
    color: colors.textMuted,
    padding: 4,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'flex-start',
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
});

export default ItemListScreen;
