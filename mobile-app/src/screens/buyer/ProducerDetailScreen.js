import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getProducerDetails, getProducerProducts} from '../../api/producerApi';
import ProductCard from '../../components/ProductCard';
import AlertBox from '../../components/AlertBox';
import {COLORS, FONTS, SPACING, RADIUS, SHADOW} from '../../theme/colors';

const BOOKMARKS_KEY = 'buyer_bookmarks';

const ProducerDetailScreen = ({route, navigation}) => {
  const {producerId} = route.params;
  const [producer, setProducer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [producerRes, productsRes] = await Promise.all([
          getProducerDetails(producerId),
          getProducerProducts(producerId, false),
        ]);
        setProducer(producerRes.data);
        setProducts(productsRes.data.content || productsRes.data || []);
        await checkIfBookmarked(producerId);
      } catch (err) {
        setError(err.message || 'Failed to load producer details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [producerId]);

  const checkIfBookmarked = async (pid) => {
    try {
      const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const bookmarks = raw ? JSON.parse(raw) : [];
      const found = bookmarks.some(b => b.producerId === pid);
      setIsBookmarked(found);
    } catch {
      setIsBookmarked(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!producer) return;
    setSaving(true);
    try {
      const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
      let bookmarks = raw ? JSON.parse(raw) : [];

      if (isBookmarked) {
        bookmarks = bookmarks.filter(b => b.producerId !== producer.id);
        setIsBookmarked(false);
        Alert.alert('Removed', `${producer.storeTitle} removed from bookmarks.`);
      } else {
        const newBookmark = {
          producerId: producer.id,
          storeTitle: producer.storeTitle,
          profilePictureUrl: producer.profilePictureUrl || null,
          timestampAdded: new Date().toISOString(),
        };
        bookmarks.push(newBookmark);
        setIsBookmarked(true);
        Alert.alert('Saved!', `${producer.storeTitle} added to bookmarks.`);
      }
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (err) {
      Alert.alert('Error', 'Failed to save bookmark. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCall = async () => {
    if (!producer?.businessPhone) return;
    const url = `tel:${producer.businessPhone}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Cannot Open Dialer', 'Your device cannot make calls.');
    });
  };

  const handleViewAddress = () => {
    if (producer?.latitude && producer?.longitude) {
      const url = `geo:${producer.latitude},${producer.longitude}`;
      Linking.openURL(url).catch(() =>
        Alert.alert('Cannot Open Maps', 'Please install a maps app.'),
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !producer) {
    return (
      <View style={styles.errorContainer}>
        <AlertBox message={error || 'Producer not found.'} type="error" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Producer Header */}
      <View style={styles.headerCard}>
        {producer.profilePictureUrl ? (
          <Image
            source={{uri: producer.profilePictureUrl}}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profilePlaceholderText}>🏪</Text>
          </View>
        )}

        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text style={styles.storeName}>{producer.storeTitle}</Text>
              <Text style={styles.producerType}>
                {producer.firstName} {producer.lastName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleBookmark}
              disabled={saving}
              style={[styles.bookmarkBtn, isBookmarked && styles.bookmarkBtnActive]}>
              <Text style={styles.bookmarkIcon}>{isBookmarked ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.location}>
            📍 {producer.district}, {producer.province}
          </Text>
          {producer.address && (
            <Text style={styles.address}>🏠 {producer.address}</Text>
          )}
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Contact Information</Text>
        <View style={styles.contactGrid}>
          <TouchableOpacity
            onPress={handleCall}
            style={[styles.contactCard, SHADOW.sm]}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactLabel}>Call</Text>
            <Text style={styles.contactValue}>{producer.businessPhone}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewAddress}
            style={[styles.contactCard, SHADOW.sm]}>
            <Text style={styles.contactIcon}>📍</Text>
            <Text style={styles.contactLabel}>Location</Text>
            <Text style={styles.contactValue}>View on Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      {producer.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 About</Text>
          <View style={[styles.aboutCard, SHADOW.sm]}>
            <Text style={styles.aboutText}>{producer.description}</Text>
          </View>
        </View>
      )}

      {/* Products Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛒 Products</Text>
        {products.length === 0 ? (
          <View style={styles.emptyProducts}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({item}) => (
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.navigate('ProductDetail', {productId: item.id})
                }
              />
            )}
          />
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  errorContainer: {padding: SPACING.lg},
  headerCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  profilePlaceholderText: {fontSize: 48},
  headerContent: {},
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleCol: {flex: 1},
  storeName: {fontSize: 22, ...FONTS.bold, color: COLORS.text, marginBottom: 4},
  producerType: {fontSize: 14, color: COLORS.textSecondary, ...FONTS.medium},
  bookmarkBtn: {
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: 'transparent',
  },
  bookmarkBtnActive: {
    backgroundColor: COLORS.primary + '20',
  },
  bookmarkIcon: {fontSize: 24},
  location: {fontSize: 14, color: COLORS.textSecondary, marginBottom: 4},
  address: {fontSize: 14, color: COLORS.textSecondary},
  section: {paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg},
  sectionTitle: {fontSize: 16, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.md},
  contactGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactIcon: {fontSize: 28, marginBottom: SPACING.sm},
  contactLabel: {fontSize: 12, color: COLORS.textSecondary, ...FONTS.medium, marginBottom: 2},
  contactValue: {fontSize: 13, ...FONTS.semiBold, color: COLORS.primary, textAlign: 'center'},
  aboutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  aboutText: {fontSize: 14, color: COLORS.text, lineHeight: 20},
  emptyProducts: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {fontSize: 14, color: COLORS.textSecondary},
  bottomSpacer: {height: SPACING.xl},
});

export default ProducerDetailScreen;
