import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import {COLORS, FONTS, SPACING, RADIUS} from '../theme/colors';

/**
 * Primary button component with loading state.
 * variant: 'primary' | 'secondary' | 'danger' | 'outline'
 */
const AppButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  fullWidth = true,
  style,
}) => {
  const isDisabled = disabled || loading;

  const getBackground = () => {
    if (isDisabled) return COLORS.border;
    switch (variant) {
      case 'secondary': return COLORS.surfaceAlt;
      case 'danger':    return COLORS.error;
      case 'outline':   return 'transparent';
      default:          return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return COLORS.textSecondary;
    switch (variant) {
      case 'secondary': return COLORS.primary;
      case 'outline':   return COLORS.primary;
      default:          return COLORS.white;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        {backgroundColor: getBackground()},
        variant === 'outline' && styles.outline,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, {color: getTextColor()}]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: {width: '100%'},
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: 16,
    ...FONTS.semiBold,
    letterSpacing: 0.3,
  },
});

export default AppButton;
