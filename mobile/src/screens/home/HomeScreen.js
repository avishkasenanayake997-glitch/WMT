import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { itemService } from '../../services/itemService';
import { colors } from '../../utils/colors';
import ItemCard from '../../components/ItemCard';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHomeItems = useCallback(async () => {
    try {
      setError(null);
      const res = await itemService.getItems({ status: 'Active' });
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeItems();
  }, [fetchHomeItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeItems();
  };

  const lostCount = items.filter((i) => i.itemType === 'Lost').length;
  const foundCount = items.filter((i) => i.itemType === 'Found').length;
  const recentItems = items.slice(0, 5);

  if (loading) {
    return <LoadingView message="Loading campus lost & found records..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      {/* Hero Welcome Header */}
      <View style={styles.heroSection}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.name ? user.name.split(' ')[0] : 'Student'} 👋
          </Text>
          <Text style={styles.heroTitle}>CampusConnect</Text>
          <Text style={styles.heroDescription}>
            SLIIT Lost & Found Management Portal
          </Text>
        </View>

        {/* Quick Statistics Counter */}
        <View style={styles.statsCardRow}>
          <TouchableOpacity
            style={[styles.statCard, styles.lostStatCard]}
            onPress={() => navigation.navigate('Items', { initialType: 'Lost' })}
          >
            <Text style={styles.statNumber}>{lostCount}</Text>
            <Text style={styles.statLabel}>🔴 Active Lost</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.foundStatCard]}
            onPress={() => navigation.navigate('Items', { initialType: 'Found' })}
          >
            <Text style={styles.statNumber}>{foundCount}</Text>
            <Text style={styles.statLabel}>🟢 Active Found</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.reportLostBtn]}
          onPress={() =>
            navigation.navigate('CreateItem', { defaultType: 'Lost' })
          }
        >
          <Text style={styles.actionIcon}>📢</Text>
          <Text style={styles.actionBtnText}>Report Lost Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.reportFoundBtn]}
          onPress={() =>
            navigation.navigate('CreateItem', { defaultType: 'Found' })
          }
        >
          <Text style={styles.actionIcon}>🎁</Text>
          <Text style={styles.actionBtnText}>Report Found Item</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Items Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Campus Reports</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Items')}>
          <Text style={styles.viewAllText}>View All ({items.length})</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {recentItems.length > 0 ? (
          recentItems.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onPress={(selectedItem) =>
                navigation.navigate('ItemDetails', { itemId: selectedItem._id })
              }
            />
          ))
        ) : (
          <EmptyState
            title="No Items Reported Yet"
            message="No lost or found items currently active on campus. Tap below to submit the first report."
            actionTitle="Report an Item"
            onAction={() => navigation.navigate('CreateItem')}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.secondaryLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  statsCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  lostStatCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#F87171',
  },
  foundStatCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#34D399',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F1F5F9',
    marginTop: 4,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  reportLostBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  reportFoundBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
});

export default HomeScreen;
