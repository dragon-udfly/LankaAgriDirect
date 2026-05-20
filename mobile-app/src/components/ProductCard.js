import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {COLORS, FONTS, SPACING, RADIUS, SHADOW} from '../theme/colors';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.md * 2;
const IMAGE_HEIGHT = Math.min(280, width * 0.7); // Responsive height based on screen width

/**
 * Product card used in the buyer home feed.
 */
const ProductCard = ({product, onPress}) => {
  const isSoldOut = product.isSoldOut;

  return (
    <TouchableOpacity
      style={[styles.card, SHADOW.sm]}
      onPress={onPress}
      activeOpacity={0.9}>
      {/* Product Image */}
      <View style={styles.imageWrapper}>
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <Image
            source={{uri: product.imageUrls[0]}}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🌿</Text>
          </View>
        )}
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
        {/* Sold Out Overlay */}
        {isSoldOut && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>SOLD OUT</Text>
          </View>
        )}
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.store} numberOfLines={1}>
          {product.producerStoreTitle || product.producerName}
        </Text>

        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>
              Rs. {product.unitPrice?.toFixed(2)}
            </Text>
            <Text style={styles.unit}>per {product.unitType}</Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.district}>{product.producerDistrict}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {width: '100%', height: '100%'},
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {fontSize: 48},
  categoryBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  categoryText: {color: COLORS.white, fontSize: 11, ...FONTS.semiBold},
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    color: COLORS.white,
    fontSize: 18,
    ...FONTS.bold,
    letterSpacing: 2,
  },
  content: {padding: SPACING.md},
  name: {fontSize: 18, ...FONTS.semiBold, color: COLORS.text, marginBottom: 4},
  store: {fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.sm, fontWeight: '500'},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: SPACING.xs,
  },
  price: {fontSize: 20, ...FONTS.bold, color: COLORS.primary},
  unit: {fontSize: 13, color: COLORS.textSecondary, marginTop: 2},
  locationRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  locationIcon: {fontSize: 14},
  district: {fontSize: 13, color: COLORS.textSecondary, ...FONTS.medium},
});

export default ProductCard;
