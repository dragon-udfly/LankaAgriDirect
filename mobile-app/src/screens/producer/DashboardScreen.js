import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {getMyAnalytics} from '../../api/analyticsApi';
import VerificationBanner from '../../components/VerificationBanner';
import AlertBox from '../../components/AlertBox';
import {COLORS, FONTS, SPACING, RADIUS, SHADOW} from '../../theme/colors';

const DashboardScreen = ({navigation}) => {
  const {user, signOut} = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const res = await getMyAnalytics(user.id);
      setAnalytics(res.data);
    } catch (err) {
      setError(err.message || 'Could not load analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const StatCard = ({label, value, icon}) => (
    <View style={[styles.statCard, SHADOW.sm]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value ?? 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {setRefreshing(true); fetchAnalytics();}}
          colors={[COLORS.primary]}
        />
      }>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Verification Banner */}
      <VerificationBanner status={user?.verificationStatus} />

      {/* Error */}
      {error && (
        <View style={styles.padding}>
          <AlertBox message={error} type="error" />
        </View>
      )}

      {/* Analytics Cards */}
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : (
        <>
          <Text style={styles.sectionTitle}>📊 Lead Analytics</Text>
          <View style={styles.statsRow}>
            <StatCard
              label="Call Clicks"
              value={analytics?.totalCallClicks}
              icon="📞"
            />
            <StatCard
              label="Address Views"
              value={analytics?.totalAddressViews}
              icon="📍"
            />
          </View>
        </>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actions}>
        {[
          {label: 'My Products', icon: '📦', screen: 'MyProducts'},
          {label: 'Add Product', icon: '➕', screen: 'AddProduct'},
          {label: 'My Profile', icon: '👤', screen: 'Profile'},
        ].map(action => (
          <TouchableOpacity
            key={action.screen}
            style={[styles.actionCard, SHADOW.sm]}
            onPress={() => navigation.navigate(action.screen)}
            activeOpacity={0.85}>
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  greeting: {fontSize: 13, color: 'rgba(255,255,255,0.8)'},
  name: {fontSize: 20, ...FONTS.bold, color: COLORS.white},
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  logoutText: {color: COLORS.white, fontSize: 13, ...FONTS.medium},
  padding: {paddingHorizontal: SPACING.md},
  loader: {marginTop: SPACING.xl},
  sectionTitle: {
    fontSize: 15,
    ...FONTS.semiBold,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statIcon: {fontSize: 28},
  statValue: {fontSize: 28, ...FONTS.bold, color: COLORS.primary},
  statLabel: {fontSize: 12, color: COLORS.textSecondary, textAlign: 'center'},
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  actionCard: {
    width: '29%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionIcon: {fontSize: 28},
  actionLabel: {fontSize: 12, ...FONTS.medium, color: COLORS.text, textAlign: 'center'},
});

export default DashboardScreen;
