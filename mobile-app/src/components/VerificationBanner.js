import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, FONTS, SPACING, RADIUS} from '../theme/colors';

/**
 * Verification status banner shown on Producer dashboard.
 * status: 'pending' | 'verified' | 'blocked'
 */
const VerificationBanner = ({status}) => {
  if (status === 'verified') return null;

  const config = {
    pending: {
      bg: '#FFFBEB',
      border: COLORS.warning,
      icon: '⏳',
      title: 'Account Pending Verification',
      body: 'Your NIC and profile are under review. You will be able to list products once an Admin verifies your account.',
      textColor: '#B45309',
    },
    blocked: {
      bg: '#FEF2F2',
      border: COLORS.error,
      icon: '🚫',
      title: 'Account Blocked',
      body: 'Your account has been blocked. Please contact support for assistance.',
      textColor: '#B91C1C',
    },
  };

  const c = config[status] || config.pending;

  return (
    <View style={[styles.banner, {backgroundColor: c.bg, borderColor: c.border}]}>
      <Text style={styles.icon}>{c.icon}</Text>
      <View style={styles.textBlock}>
        <Text style={[styles.title, {color: c.textColor}]}>{c.title}</Text>
        <Text style={[styles.body, {color: c.textColor}]}>{c.body}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    margin: SPACING.md,
    gap: SPACING.sm,
  },
  icon: {fontSize: 22, marginTop: 2},
  textBlock: {flex: 1},
  title: {fontSize: 14, ...FONTS.semiBold, marginBottom: 4},
  body: {fontSize: 13, lineHeight: 18, ...FONTS.regular},
});

export default VerificationBanner;
