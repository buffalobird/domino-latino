import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GlobalErrorBoundary } from '@/components/domino/GlobalErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';
import { PaletteProvider, usePalette } from '@/context/PaletteContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

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
                animation: 'fade',
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
  const [fontsLoaded, fontError] = useFonts({
    'Fredoka-SemiBold': require('../../assets/fonts/Fredoka-SemiBold.ttf'),
    'Fredoka-Bold': require('../../assets/fonts/Fredoka-Bold.ttf'),
    'Nunito-SemiBold': require('../../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../../assets/fonts/Nunito-ExtraBold.ttf'),
    'Nunito-Black': require('../../assets/fonts/Nunito-Black.ttf'),
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const ready = fontsLoaded || Boolean(fontError) || timedOut;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <PaletteProvider>
      <ThemedRootStack />
    </PaletteProvider>
  );
}
