import React, { Component, ErrorInfo, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CLUB } from '@/constants/tokens';
import { reportClientError } from '@/lib/remoteConfig';
import { GlossyButton } from './GlossyButton';

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Global React ErrorBoundary in Club Caribe styling.
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
    backgroundColor: 'rgba(14, 28, 52, 0.96)',
    borderRadius: 24,
    borderWidth: 1.25,
    borderColor: 'rgba(148, 190, 255, 0.26)',
    padding: 22,
    gap: 12,
    alignItems: 'center',
  },
  kicker: {
    color: CLUB.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: CLUB.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  body: {
    color: CLUB.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
  },
  btn: {
    width: '100%',
    marginTop: 4,
    backgroundColor: CLUB.emerald,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: CLUB.emeraldDark,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: CLUB.textInk,
    fontSize: 16,
    fontWeight: '900',
  },
});
