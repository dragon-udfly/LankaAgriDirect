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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getProductById} from '../../api/productApi';
import {trackCall, trackAddressView} from '../../api/analyticsApi';
import AppButton from '../../components/AppButton';
import AlertBox from '../../components/AlertBox';
import {COLORS, FONTS, SPACING, RADIUS, SHADOW} from '../../theme/colors';

const BOOKMARKS_KEY = 'buyer_bookmarks';

const ProductDetailScreen = ({route, navigation}) => {
  const {productId} = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(productId);
        setProduct(res.data);
        // Check if producer is bookmarked
        await checkIfBookmarked(res.data.producerId);
      } catch (err) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const checkIfBookmarked = async (producerId) => {
    try {
      const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const bookmarks = raw ? JSON.parse(raw) : [];
      const found = bookmarks.some(b => b.producerId === producerId);
      setIsBookmarked(found);
    } catch {
      setIsBookmarked(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
      let bookmarks = raw ? JSON.parse(raw) : [];

      if (isBookmarked) {
        // Remove bookmark
        bookmarks = bookmarks.filter(b => b.producerId !== product.producerId);
        setIsBookmarked(false);
        Alert.alert('Removed', `${product.producerStoreTitle} removed from bookmarks.`);
      } else {
        // Add bookmark
        const newBookmark = {
          producerId: product.producerId,
          storeTitle: product.producerStoreTitle,
          profilePictureUrl: product.producerProfilePicture || null,
          timestampAdded: new Date().toISOString(),
        };
        bookmarks.push(newBookmark);
        setIsBookmarked(true);
        Alert.alert('Saved!', `${product.producerStoreTitle} added to bookmarks.`);
      }
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (err) {
      Alert.alert('Error', 'Failed to save bookmark. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleViewProducerProfile = () => {
    if (product?.producerId) {
      navigation.navigate('ProducerDetail', {producerId: product.producerId});
    }
  };

  const handleCallFarmer = async () => {
    if (!product?.producerPhone) return;
    await trackCall(product.producerId, 'anonymous').catch(() => {});
    const url = `tel:${product.producerPhone}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) Linking.openURL(url);
        else Alert.alert('Cannot Open Dialer', 'Your device cannot make calls.');
      });
  };

  const handleViewAddress = async () => {
    await trackAddressView(product.producerId, 'anonymous').catch(() => {});
    if (product?.producerLatitude && product?.producerLongitude) {
      const url = `geo:${product.producerLatitude},${product.producerLongitude}`;
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

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <AlertBox message={error || 'Product not found.'} type="error" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Product Image */}
      {product.imageUrls?.[0] ? (
        <Image
          source={{uri: product.imageUrls[0]}}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderIcon}>🌿</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
          {product.isSoldOut && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>SOLD OUT</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>
          Rs. {product.unitPrice?.toFixed(2)}{' '}
          <Text style={styles.unit}>/ {product.unitType}</Text>
        </Text>

        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}

        {/* Producer Info Card */}
        <View style={[styles.producerCard, SHADOW.sm]}>
          <View style={styles.producerHeader}>
            <Text style={styles.sectionTitle}>🏪 Producer</Text>
            <TouchableOpacity
              onPress={handleToggleBookmark}
              disabled={saving}
              style={[styles.bookmarkBtn, isBookmarked && styles.bookmarkBtnActive]}>
              <Text style={styles.bookmarkIcon}>{isBookmarked ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.storeName}>{product.producerStoreTitle}</Text>
          <Text style={styles.producerMeta}>
            📍 {product.producerDistrict}, {product.producerProvince}
          </Text>
          {product.producerAddress ? (
            <Text style={styles.producerMeta}>🏠 {product.producerAddress}</Text>
          ) : null}
          <TouchableOpacity
            onPress={handleViewProducerProfile}
            style={styles.viewProfileBtn}>
            <Text style={styles.viewProfileText}>👤 View Producer Profile →</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        {!product.isSoldOut && (
          <View style={styles.actions}>
            <AppButton
              title="📞  Call Farmer"
              onPress={handleCallFarmer}
              style={styles.callBtn}
            />
            <AppButton
              title="📍  View Address"
              onPress={handleViewAddress}
              variant="outline"
              style={styles.addressBtn}
            />
          </View>
        )}

        {product.isSoldOut && (
          <AlertBox
            message="This product is currently sold out. Check back later or contact the farmer directly."
            type="warning"
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  errorContainer: {padding: SPACING.lg},
  image: {width: '100%', height: 280},
  imagePlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderIcon: {fontSize: 64},
  content: {padding: SPACING.lg},
  headerRow: {flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm},
  categoryBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {color: COLORS.white, fontSize: 12, ...FONTS.semiBold},
  soldOutBadge: {
    backgroundColor: COLORS.soldOut,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  soldOutText: {color: COLORS.white, fontSize: 12, ...FONTS.semiBold},
  name: {fontSize: 24, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm},
  price: {fontSize: 22, ...FONTS.bold, color: COLORS.primary, marginBottom: SPACING.md},
  unit: {fontSize: 14, color: COLORS.textSecondary, ...FONTS.regular},
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  producerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  producerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {fontSize: 13, ...FONTS.semiBold, color: COLORS.textSecondary},
  storeName: {fontSize: 17, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.xs},
  producerMeta: {fontSize: 14, color: COLORS.textSecondary, marginBottom: 4},
  bookmarkBtn: {
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: 'transparent',
  },
  bookmarkBtnActive: {
    backgroundColor: COLORS.primary + '20',
  },
  bookmarkIcon: {fontSize: 20},
  viewProfileBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewProfileText: {
    color: COLORS.primary,
    fontSize: 14,
    ...FONTS.semiBold,
    textAlign: 'center',
  },
  actions: {gap: SPACING.sm},
  callBtn: {marginBottom: 0},
  addressBtn: {marginBottom: 0},
});

export default ProductDetailScreen;
