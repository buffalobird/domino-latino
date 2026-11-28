import React, { Component, ErrorInfo, PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CLUB, FONT } from '@/constants/tokens';
import { reportClientError } from '@/lib/remoteConfig';
import { GlossyButton } from './GlossyButton';

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Global React ErrorBoundary in warm Club parlor styling.
 * Prevents white-screen crashes, reports stack traces to `public.app_error_logs`,
 * and lets the player recover cleanly without losing saved local progress.
 */
export class GlobalErrorBoundary extends Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportClientError(error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.root}>
        <View style={styles.card}>
          <Text style={styles.kicker}>DOMINÓ LATINO</Text>
          <Text style={styles.title}>Algo salió mal en la mesa</Text>
          <Text style={styles.body}>
            Ocurrió un error inesperado y ya enviamos el reporte técnico. Tu
            progreso y fichas guardadas siguen a salvo.
          </Text>
          <GlossyButton
            title="Reintentar"
            variant="emerald"
            onPress={this.handleReset}
            style={{ width: '100%', marginTop: 4 }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CLUB.roomBgTop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F242E',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    padding: 22,
    gap: 12,
    alignItems: 'center',
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.55)',
  },
  kicker: {
    color: CLUB.gold,
    fontFamily: FONT.extraBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  title: {
    color: CLUB.textPrimary,
    fontFamily: FONT.display,
    fontSize: 21,
    textAlign: 'center',
  },
  body: {
    color: CLUB.textSecondary,
    fontFamily: FONT.semi,
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 19,
  },
});
