import {
  DarkTheme,
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Bungee_400Regular } from '@expo-google-fonts/bungee';

import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { NAV_THEME } from '@/lib/constants';
import { useColorScheme } from '@/lib/use-color-scheme';
import { queryClient } from '@/utils/trpc';
import { initI18n } from '@/lib/i18n';
import { AuthProvider } from '@/contexts/AuthContext';
import { GameDataProvider } from '@/contexts/GameDataContext';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export const unstable_settings = {
  initialRouteName: 'game/start-screen',
};

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined'
    ? React.useEffect
    : React.useLayoutEffect;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  const hasMounted = useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [isI18nLoaded, setIsI18nLoaded] = useState(false);
  const [fontsLoaded] = useFonts({
    Bungee_400Regular,
  });

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }
    setAndroidNavigationBar(colorScheme);
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  useEffect(() => {
    initI18n().then(() => {
      setIsI18nLoaded(true);
    });
  }, []);

  if (!isColorSchemeLoaded || !isI18nLoaded || !fontsLoaded) {
    return null;
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GameDataProvider>
            <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
              <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
              <GestureHandlerRootView style={styles.container}>
                <Stack>
                  <Stack.Screen
                    name='game/start-screen'
                    options={{ headerShown: false, orientation: 'portrait' }}
                  />
                  <Stack.Screen
                    name='game/character-selection'
                    options={{ headerShown: false, orientation: 'portrait' }}
                  />
                  <Stack.Screen
                    name='game/username-selection'
                    options={{ headerShown: false, orientation: 'portrait' }}
                  />
                  <Stack.Screen
                    name='game/home-screen'
                    options={{
                      headerShown: false,
                      orientation: 'portrait',
                      animation: 'none',
                    }}
                  />
                  <Stack.Screen
                    name='game/battle-selection-screen'
                    options={{
                      headerShown: false,
                      orientation: 'portrait',
                    }}
                  />
                  <Stack.Screen
                    name='game/battle-screen'
                    options={{
                      headerShown: false,
                      orientation: 'portrait',
                    }}
                  />
                  <Stack.Screen
                    name='game/tabs/incubation'
                    options={{
                      headerShown: false,
                      orientation: 'portrait',
                      animation: 'none',
                    }}
                  />
                  <Stack.Screen
                    name='game/tabs/collections'
                    options={{
                      headerShown: false,
                      orientation: 'portrait',
                      animation: 'none',
                    }}
                  />
                  <Stack.Screen
                    name='game/tabs/inventory'
                    options={{
                      headerShown: false,
                      orientation: 'portrait',
                      animation: 'none',
                    }}
                  />
                  <Stack.Screen
                    name='game/tabs/shop'
                    options={{
                      headerShown: false,
                      orientation: 'portrait',
                      animation: 'none',
                    }}
                  />
                  <Stack.Screen
                    name='game/settings-screen'
                    options={{
                      headerShown: false,
                      orientation: 'portrait',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name='modal'
                    options={{ title: 'Modal', presentation: 'modal' }}
                  />
                </Stack>
              </GestureHandlerRootView>
            </ThemeProvider>
          </GameDataProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}
