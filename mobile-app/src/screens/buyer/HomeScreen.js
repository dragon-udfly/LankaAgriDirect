import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import {getAllProducts} from '../../api/productApi';
import {Ionicons} from '@expo/vector-icons';
import ProductCard from '../../components/ProductCard';
import AlertBox from '../../components/AlertBox';
import {COLORS, FONTS, SPACING, RADIUS} from '../../theme/colors';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Herbal Products', 'Rice', 'Fish', 'Meat'];

const HomeScreen = ({navigation}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(
    async (reset = false) => {
      try {
        setError(null);
        const currentPage = reset ? 1 : page;
        const params = {
          page: currentPage,
          limit: 20,
        };
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await getAllProducts(params);
        const data = res.data.data || [];
        const pagination = res.data.pagination;

        if (reset) {
          setProducts(data);
          setPage(2);
        } else {
          setProducts(prev => [...prev, ...data]);
          setPage(prev => prev + 1);
        }
        setHasMore(pagination ? currentPage < pagination.pages : false);
      } catch (err) {
        setError(err.message || 'Failed to load products. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, searchQuery, page],
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      setPage(1);
      fetchProducts(true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) fetchProducts();
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchInput,
            Platform.OS === 'web' && {outlineStyle: 'none'}
          ]}
          placeholder="Search fresh produce..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={styles.categoriesContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.chip,
              selectedCategory === cat && styles.chipActive,
            ]}>
            <Text
              style={[
                styles.chipText,
                selectedCategory === cat && styles.chipTextActive,
              ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Error State */}
      {error && (
        <View style={styles.errorWrapper}>
          <AlertBox message={error} type="error" />
        </View>
      )}

      {/* Product List */}
      {loading && products.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading fresh produce...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetail', {productId: item.id})
              }
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            hasMore ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={styles.footer}
              />
            ) : null
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.centered}>
                <Ionicons name="leaf-outline" size={48} color={COLORS.textSecondary} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptySubtitle}>
                  Try a different category or search term
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    height: Platform.OS === 'web' ? '100vh' : '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
  },
  searchIcon: {marginRight: SPACING.sm},
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    ...FONTS.regular,
  },
  categories: {maxHeight: 52},
  categoriesContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {fontSize: 13, color: COLORS.textSecondary, ...FONTS.medium},
  chipTextActive: {color: COLORS.white},
  list: {padding: SPACING.md, paddingTop: SPACING.sm},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl},
  loadingText: {marginTop: SPACING.md, color: COLORS.textSecondary},
  emptyIcon: {marginBottom: SPACING.md},
  emptyTitle: {fontSize: 18, ...FONTS.semiBold, color: COLORS.text},
  emptySubtitle: {fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.xs},
  errorWrapper: {paddingHorizontal: SPACING.md},
  footer: {paddingVertical: SPACING.lg},
});

export default HomeScreen;
