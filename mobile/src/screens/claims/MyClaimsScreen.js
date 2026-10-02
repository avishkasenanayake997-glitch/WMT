import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native';
import { claimService } from '../../services/claimService';
import { colors } from '../../utils/colors';
import ClaimCard from '../../components/ClaimCard';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';

const MyClaimsScreen = ({ navigation }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClaims = useCallback(async () => {
    try {
      const res = await claimService.getClaims();
      if (res.success && Array.isArray(res.data)) {
        setClaims(res.data);
      }
    } catch (err) {
      console.error('[MyClaims] Fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Re-fetch when screen receives focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchClaims();
    });
    return unsubscribe;
  }, [navigation, fetchClaims]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClaims();
  };

  if (loading) {
    return <LoadingView message="Loading your submitted claims..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Claim Submissions</Text>
        <Text style={styles.headerSubtitle}>
          Track verification progress and campus administration decisions.
        </Text>
      </View>

      <FlatList
        data={claims}
        keyExtractor={(claim) => claim._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <ClaimCard
            claim={item}
            onPress={(selectedClaim) =>
              navigation.navigate('ClaimDetails', { claimId: selectedClaim._id })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Claims Submitted"
            message="You have not submitted any claims yet. Browse active found items to submit a claim."
            actionTitle="Browse Found Items"
            onAction={() => navigation.navigate('Items', { initialType: 'Found' })}
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
});

export default MyClaimsScreen;
