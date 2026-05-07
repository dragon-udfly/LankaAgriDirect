import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, FONTS, SPACING, RADIUS} from '../theme/colors';

/**
 * Inline alert / message box component.
 * type: 'error' | 'success' | 'warning' | 'info'
 */
const AlertBox = ({message, type = 'error', style}) => {
  if (!message) return null;

  const config = {
    error:   {bg: '#FEF2F2', border: COLORS.error,   text: '#B91C1C', icon: '✖'},
    success: {bg: '#F0FDF4', border: COLORS.success,  text: '#15803D', icon: '✔'},
    warning: {bg: '#FFFBEB', border: COLORS.warning,  text: '#B45309', icon: '⚠'},
    info:    {bg: '#EFF6FF', border: '#3B82F6',       text: '#1D4ED8', icon: 'ℹ'},
  };

  const c = config[type] || config.error;

  return (
    <View style={[styles.box, {backgroundColor: c.bg, borderColor: c.border}, style]}>
      <Text style={styles.icon}>{c.icon}</Text>
      <Text style={[styles.text, {color: c.text}]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  icon: {fontSize: 16, marginTop: 1},
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    ...FONTS.regular,
  },
});

export default AlertBox;
