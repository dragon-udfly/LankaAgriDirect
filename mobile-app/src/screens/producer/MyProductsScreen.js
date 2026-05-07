import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {getProducerProducts} from '../../api/producerApi';
import {toggleSoldOut, deleteProduct} from '../../api/productApi';
import AlertBox from '../../components/AlertBox';
import AppButton from '../../components/AppButton';
import {COLORS, FONTS, SPACING, RADIUS, SHADOW} from '../../theme/colors';

const MyProductsScreen = ({navigation}) => {
  const {user} = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const res = await getProducerProducts(user.id, true);
      setProducts(res.data.data || res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleSoldOut = async (product) => {
    setTogglingId(product.id);
    try {
      await toggleSoldOut(product.id, !product.isSoldOut);
      setProducts(prev =>
        prev.map(p =>
          p.id === product.id ? {...p, isSoldOut: !p.isSoldOut} : p,
        ),
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              setProducts(prev => prev.filter(p => p.id !== product.id));
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete product.');
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item}) => (
    <View style={[styles.card, SHADOW.sm]}>
      {/* Image */}
      <View style={styles.imageWrapper}>
        {item.imageUrls?.[0] ? (
          <Image source={{uri: item.imageUrls[0]}} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderIcon}>🌿</Text>
          </View>
        )}
        <View style={[styles.statusDot, {backgroundColor: item.isSoldOut ? COLORS.soldOut : COLORS.success}]} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.meta}>{item.category} • Rs. {item.unitPrice}/{item.unitType}</Text>

        <View style={styles.row}>
          <Text style={styles.soldOutLabel}>
            {item.isSoldOut ? '🔴 Sold Out' : '🟢 Available'}
          </Text>
          {togglingId === item.id ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Switch
              value={item.isSoldOut}
              onValueChange={() => handleToggleSoldOut(item)}
              trackColor={{false: COLORS.success, true: COLORS.soldOut}}
              thumbColor={COLORS.white}
            />
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProduct', {product: item})}>
            <Text style={styles.editBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}>
            <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorWrapper}>
          <AlertBox message={error} type="error" />
        </View>
      )}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchProducts();}} colors={[COLORS.primary]} />
          }
          ListHeaderComponent={
            <AppButton
              title="+ Add New Product"
              onPress={() => navigation.navigate('AddProduct')}
              style={styles.addBtn}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No Products Yet</Text>
              <Text style={styles.emptySubtitle}>Add your first product to start selling.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl},
  errorWrapper: {padding: SPACING.md},
  addBtn: {marginBottom: SPACING.md},
  list: {padding: SPACING.md},
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  imageWrapper: {width: 100, position: 'relative'},
  image: {width: '100%', height: '100%'},
  imagePlaceholder: {width: '100%', height: '100%', backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center'},
  imagePlaceholderIcon: {fontSize: 28},
  statusDot: {position: 'absolute', top: SPACING.sm, right: SPACING.sm, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: COLORS.white},
  info: {flex: 1, padding: SPACING.sm},
  name: {fontSize: 15, ...FONTS.semiBold, color: COLORS.text, marginBottom: 2},
  meta: {fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.sm},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm},
  soldOutLabel: {fontSize: 13, ...FONTS.medium, color: COLORS.text},
  actionRow: {flexDirection: 'row', gap: SPACING.sm},
  editBtn: {flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.sm, padding: SPACING.xs, alignItems: 'center'},
  editBtnText: {fontSize: 13, color: COLORS.primary, ...FONTS.medium},
  deleteBtn: {flex: 1, backgroundColor: '#FEF2F2', borderRadius: RADIUS.sm, padding: SPACING.xs, alignItems: 'center'},
  deleteBtnText: {fontSize: 13, color: COLORS.error, ...FONTS.medium},
  emptyIcon: {fontSize: 48, marginBottom: SPACING.md},
  emptyTitle: {fontSize: 18, ...FONTS.semiBold, color: COLORS.text},
  emptySubtitle: {fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.xs, textAlign: 'center'},
});

export default MyProductsScreen;
