import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GlobalErrorBoundary } from '@/components/domino/GlobalErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';
import { PaletteProvider, usePalette } from '@/context/PaletteContext';

function ThemedRootStack() {
  const { palette } = usePalette();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bgTop }}>
      <SafeAreaProvider>
        <GlobalErrorBoundary>
          <AuthProvider>
            <StatusBar style={palette.isDark ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: palette.bgTop },
              }}
            />
          </AuthProvider>
        </GlobalErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <PaletteProvider>
      <ThemedRootStack />
    </PaletteProvider>
  );
}
