import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertBox from '../../components/AlertBox';
import {COLORS, FONTS, SPACING, RADIUS, SHADOW} from '../../theme/colors';

const BOOKMARKS_KEY = 'buyer_bookmarks';

const BookmarksScreen = ({navigation}) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const data = raw ? JSON.parse(raw) : [];
      setBookmarks(data);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (producerId) => {
    const updated = bookmarks.filter(b => b.producerId !== producerId);
    setBookmarks(updated);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarks}
        keyExtractor={item => item.producerId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
            <Text style={styles.emptySubtitle}>
              Star your favourite producers from their profile page. They'll appear here for quick access.
            </Text>
          </View>
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={[styles.card, SHADOW.sm]}
            onPress={() => navigation.navigate('ProducerDetail', {producerId: item.producerId})}
            activeOpacity={0.85}>
            <View style={styles.avatar}>
              {item.profilePictureUrl ? (
                <Image source={{uri: item.profilePictureUrl}} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>🏪</Text>
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.storeName}>{item.storeTitle}</Text>
              <Text style={styles.addedDate}>
                Saved {new Date(item.timestampAdded).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity onPress={() => removeBookmark(item.producerId)} style={styles.removeBtn}>
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {padding: SPACING.md},
  emptyContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {fontSize: 48, marginBottom: SPACING.md},
  emptyTitle: {fontSize: 20, ...FONTS.semiBold, color: COLORS.text, marginBottom: SPACING.sm},
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {width: '100%', height: '100%'},
  avatarText: {fontSize: 24},
  info: {flex: 1},
  storeName: {fontSize: 15, ...FONTS.semiBold, color: COLORS.text},
  addedDate: {fontSize: 12, color: COLORS.textSecondary, marginTop: 2},
  removeBtn: {padding: SPACING.sm},
  removeIcon: {fontSize: 16, color: COLORS.textSecondary},
});

export default BookmarksScreen;
