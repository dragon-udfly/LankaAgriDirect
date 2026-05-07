import { Platform } from 'react-native';

// App color palette
export const COLORS = {
  primary: '#2E7D32',       // Deep forest green — brand color
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  accent: '#FF8F00',        // Warm amber — call-to-action
  accentLight: '#FFC107',
  background: '#F9FAF7',    // Off-white with green tint
  surface: '#FFFFFF',
  surfaceAlt: '#F1F8E9',
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  soldOut: '#9E9E9E',
  verified: '#2E7D32',
  pending: '#F59E0B',
  blocked: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

export const FONTS = {
  regular: {fontFamily: 'System', fontWeight: '400'},
  medium: {fontFamily: 'System', fontWeight: '500'},
  semiBold: {fontFamily: 'System', fontWeight: '600'},
  bold: {fontFamily: 'System', fontWeight: '700'},
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOW = {
  sm: Platform.select({
    web: { boxShadow: '0px 1px 4px rgba(0,0,0,0.08)' },
    default: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    }
  }),
  md: Platform.select({
    web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.12)' },
    default: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    }
  }),
};
