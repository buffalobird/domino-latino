import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';

export type GlossyVariant = 'emerald' | 'cobalt' | 'violet' | 'gold' | 'coral' | 'glass';

interface GlossyButtonProps {
  title: string;
  subtitle?: string;
  variant?: GlossyVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
}

interface VariantStyle {
  colors: [string, string, string];
  lip: string;
  border: string;
  topBevel: string;
  shadow: string;
  text: string;
  sub: string;
}

const DARK_VARIANTS: Record<GlossyVariant, VariantStyle> = {
  emerald: {
    colors: ['#5BF0AE', '#24C981', '#139E60'],
    lip: '#0A693E',
    border: 'rgba(167, 243, 208, 0.45)',
    topBevel: 'rgba(255, 255, 255, 0.48)',
    shadow: '0px 6px 18px rgba(36, 201, 129, 0.30)',
    text: '#052E1A',
    sub: '#094B2B',
  },
  cobalt: {
    colors: ['#4BA3FF', '#2570E8', '#174EB5'],
    lip: '#0E337D',
    border: 'rgba(186, 230, 253, 0.38)',
    topBevel: 'rgba(255, 255, 255, 0.38)',
    shadow: '0px 5px 15px rgba(37, 112, 232, 0.28)',
    text: '#FFFFFF',
    sub: 'rgba(255, 255, 255, 0.86)',
  },
  violet: {
    colors: ['#A78BFA', '#7C3AED', '#5B21B6'],
    lip: '#3B0F87',
    border: 'rgba(233, 213, 255, 0.36)',
    topBevel: 'rgba(255, 255, 255, 0.32)',
    shadow: '0px 5px 15px rgba(124, 58, 237, 0.28)',
    text: '#FFFFFF',
    sub: 'rgba(255, 255, 255, 0.86)',
  },
  gold: {
    colors: ['#FFE694', '#F5C451', '#D9961A'],
    lip: '#946008',
    border: 'rgba(255, 249, 219, 0.72)',
    topBevel: 'rgba(255, 255, 255, 0.62)',
    shadow: '0px 5px 16px rgba(245, 196, 81, 0.32)',
    text: '#231703',
    sub: '#543807',
  },
  coral: {
    colors: ['#FF7E8E', '#F43F5E', '#C81E3E'],
    lip: '#881329',
    border: 'rgba(254, 205, 211, 0.42)',
    topBevel: 'rgba(255, 255, 255, 0.36)',
    shadow: '0px 5px 15px rgba(244, 63, 94, 0.30)',
    text: '#FFFFFF',
    sub: 'rgba(255, 255, 255, 0.88)',
  },
  glass: {
    colors: ['#1C3D4E', '#15303E', '#102530'],
    lip: '#08141B',
    border: 'rgba(255, 248, 230, 0.18)',
    topBevel: 'rgba(255, 255, 255, 0.14)',
    shadow: '0px 4px 10px rgba(0, 0, 0, 0.28)',
    text: '#FFFDF7',
    sub: '#B8CFD9',
  },
};

/**
 * Tactile 3D Button with clean top rim bevel (zero Web-2.0 plastic white strip)
 * and rounded Fredoka/Nunito typography across both Noche de Club and Día Brisa.
 */
export function GlossyButton({
  title,
  subtitle,
  variant = 'emerald',
  icon,
  disabled = false,
  loading = false,
  compact = false,
  style,
  onPress,
}: GlossyButtonProps) {
  const { palette } = usePalette();
  const baseCfg = DARK_VARIANTS[variant];

  const cfg: VariantStyle =
    variant === 'emerald'
      ? {
          ...baseCfg,
          colors: [palette.primaryTop, palette.primaryMid, palette.primaryBottom],
          lip: palette.primaryShadow,
          border: palette.isDark
            ? 'rgba(167, 243, 208, 0.48)'
            : 'rgba(255, 255, 255, 0.42)',
          topBevel: palette.isDark
            ? 'rgba(255, 255, 255, 0.48)'
            : 'rgba(255, 255, 255, 0.42)',
          shadow: palette.isDark
            ? baseCfg.shadow
            : '0px 6px 18px rgba(240, 90, 67, 0.28)',
          text: palette.textOnPrimary,
          sub: palette.isDark ? '#084729' : 'rgba(255, 255, 255, 0.90)',
        }
      : variant === 'cobalt' && !palette.isDark
      ? {
          ...baseCfg,
          colors: ['#32C5BD', palette.accent, '#148781'],
          lip: '#0D615D',
          border: 'rgba(255, 255, 255, 0.46)',
          topBevel: 'rgba(255, 255, 255, 0.45)',
          shadow: '0px 5px 14px rgba(27, 168, 160, 0.25)',
          text: palette.textOnAccent,
          sub: 'rgba(255, 255, 255, 0.90)',
        }
      : variant === 'glass' && !palette.isDark
      ? {
          colors: ['#FFFFFF', '#FAF5EC', '#F1E9DC'],
          lip: palette.modalCardLip,
          border: palette.modalCardBorder,
          topBevel: '#FFFFFF',
          shadow: '0px 3px 9px rgba(21, 43, 50, 0.08)',
          text: palette.textPrimary,
          sub: palette.textSecondary,
        }
      : baseCfg;

  const radius = compact ? 14 : 18;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.outer,
        {
          borderRadius: radius,
          borderBottomColor: cfg.lip,
          boxShadow: disabled ? 'none' : cfg.shadow,
        },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <LinearGradient
        colors={cfg.colors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.grad,
          compact ? styles.gradCompact : styles.gradRegular,
          {
            borderRadius: radius - 1,
            borderColor: cfg.border,
            borderTopColor: cfg.topBevel,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={cfg.text} />
        ) : (
          <View style={styles.contentWrap}>
            <View style={styles.titleRow}>
              {icon}
              <Text
                style={[
                  compact ? styles.titleCompact : styles.titleRegular,
                  { color: cfg.text },
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>
            {subtitle && (
              <Text style={[styles.sub, { color: cfg.sub }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderBottomWidth: 4,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.95,
  },
  grad: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderTopWidth: 1.5,
  },
  gradRegular: {
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  gradCompact: {
    minHeight: 42,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  contentWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  titleRegular: {
    fontFamily: FONT.display,
    fontSize: 17,
    letterSpacing: 0.2,
    fontVariant: ['tabular-nums'],
  },
  titleCompact: {
    fontFamily: FONT.extraBold,
    fontSize: 13.5,
    fontVariant: ['tabular-nums'],
  },
  sub: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    marginTop: 1,
  },
});
