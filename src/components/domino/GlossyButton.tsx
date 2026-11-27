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

const VARIANT_CONFIG: Record<
  GlossyVariant,
  {
    colors: [string, string, string];
    lip: string;
    border: string;
    shadow: string;
    text: string;
    sub: string;
    glossOpacity: number;
  }
> = {
  emerald: {
    colors: ['#7DF6B6', '#33D982', '#17A459'],
    lip: '#0E733E',
    border: 'rgba(187, 247, 208, 0.65)',
    shadow: '0px 5px 20px rgba(41, 214, 127, 0.38)',
    text: '#06311B',
    sub: '#0B4D2B',
    glossOpacity: 0.28,
  },
  cobalt: {
    colors: ['#4393FF', '#2264DF', '#1646A8'],
    lip: '#10317A',
    border: 'rgba(186, 226, 255, 0.45)',
    shadow: '0px 4px 16px rgba(37, 99, 235, 0.35)',
    text: '#FFFFFF',
    sub: 'rgba(255, 255, 255, 0.82)',
    glossOpacity: 0.2,
  },
  violet: {
    colors: ['#B35CFF', '#8A2EE5', '#6418B5'],
    lip: '#480E87',
    border: 'rgba(233, 213, 255, 0.4)',
    shadow: '0px 4px 16px rgba(139, 92, 246, 0.35)',
    text: '#FFFFFF',
    sub: 'rgba(255, 255, 255, 0.82)',
    glossOpacity: 0.2,
  },
  gold: {
    colors: ['#FFF2A6', '#F7C948', '#E39D1E'],
    lip: '#A1680A',
    border: 'rgba(255, 247, 204, 0.8)',
    shadow: '0px 4px 18px rgba(245, 196, 81, 0.42)',
    text: '#1A1405',
    sub: '#4D3604',
    glossOpacity: 0.3,
  },
  coral: {
    colors: ['#FB7185', '#F43F5E', '#BE123C'],
    lip: '#881337',
    border: 'rgba(254, 205, 211, 0.45)',
    shadow: '0px 4px 16px rgba(244, 63, 94, 0.35)',
    text: '#FFFFFF',
    sub: 'rgba(255, 255, 255, 0.85)',
    glossOpacity: 0.2,
  },
  glass: {
    colors: ['rgba(38, 64, 102, 0.72)', 'rgba(24, 44, 74, 0.82)', 'rgba(17, 33, 58, 0.9)'],
    lip: 'rgba(8, 16, 30, 0.9)',
    border: 'rgba(148, 190, 255, 0.26)',
    shadow: '0px 3px 10px rgba(0, 0, 0, 0.28)',
    text: '#F8FAFC',
    sub: '#B9C8D9',
    glossOpacity: 0.1,
  },
};

/**
 * Shared Glossy Arcade Candy-Glass Button matching the Dominó Latino mockup across all screens.
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
  const baseCfg = VARIANT_CONFIG[variant];
  const cfg =
    variant === 'emerald'
      ? {
          ...baseCfg,
          colors: [palette.primaryTop, palette.primaryMid, palette.primaryBottom] as [
            string,
            string,
            string,
          ],
          lip: palette.primaryShadow,
          border: palette.isDark
            ? 'rgba(187, 247, 208, 0.55)'
            : 'rgba(255, 255, 255, 0.45)',
          shadow: palette.isDark
            ? baseCfg.shadow
            : '0px 6px 18px rgba(237, 106, 90, 0.28)',
          text: palette.textOnPrimary,
          sub: palette.isDark ? '#0B4D2B' : 'rgba(255, 255, 255, 0.90)',
        }
      : variant === 'cobalt' && !palette.isDark
      ? {
          ...baseCfg,
          colors: ['#54DBD8', palette.accent, '#21ABA8'] as [string, string, string],
          lip: '#177E7C',
          border: 'rgba(255, 255, 255, 0.55)',
          shadow: '0px 4px 14px rgba(54, 201, 198, 0.28)',
          text: palette.textOnAccent,
          sub: '#124648',
        }
      : variant === 'glass' && !palette.isDark
      ? {
          ...baseCfg,
          colors: ['#FFFFFF', '#F5F7F1', '#E9EFE6'] as [string, string, string],
          lip: palette.secondaryAccent,
          border: palette.borderSubtle,
          shadow: '0px 3px 10px rgba(26, 49, 54, 0.08)',
          text: palette.textPrimary,
          sub: palette.textSecondary,
          glossOpacity: 0.25,
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
          { borderRadius: radius - 1, borderColor: cfg.border },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.gloss,
            { opacity: cfg.glossOpacity, borderRadius: radius },
          ]}
        />
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
    borderBottomWidth: 3.5,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.94,
  },
  grad: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  gradRegular: {
    minHeight: 50,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  gradCompact: {
    minHeight: 42,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  gloss: {
    position: 'absolute',
    top: 1.5,
    left: 8,
    right: 8,
    height: '44%',
    backgroundColor: '#FFFFFF',
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
    fontSize: 16,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  titleCompact: {
    fontSize: 13.5,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  sub: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },
});
