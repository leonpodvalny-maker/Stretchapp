import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppProvider, useApp } from './src/context/AppContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { colors, spacing, fontSize } from './src/utils/theme';
import { syncBeforeExit, syncOnForeground } from './src/services/syncService';

function AppContent({ isLanguageSelected }: { isLanguageSelected: boolean }) {
  const { settings, customTrainings, trainingHistory } = useApp();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (settings?.keepScreenOn) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }

    return () => {
      deactivateKeepAwake();
    };
  }, [settings?.keepScreenOn]);

  // AppState listener for background/foreground sync
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (!user || !settings) return;

      // App going to background - sync
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        await syncBeforeExit(
          user.uid,
          settings,
          customTrainings,
          trainingHistory,
          currentLanguage
        );
      }

      // App coming to foreground - pull latest
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        try {
          const merged = await syncOnForeground(user.uid, {
            settings,
            customTrainings,
            trainingHistory,
            language: currentLanguage,
          });

          // Update local data if cloud has changes
          // This will be handled by the context
        } catch (error) {
          console.error('Error syncing on foreground:', error);
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [user, settings, customTrainings, trainingHistory, currentLanguage]);

  return (
    <NavigationContainer>
      <AppNavigator initialRoute={isLanguageSelected ? 'Main' : 'LanguageSelection'} />
    </NavigationContainer>
  );
}

export default function App() {
  const [isLanguageSelected, setIsLanguageSelected] = useState<boolean | null>(null);

  useEffect(() => {
    checkLanguageSelection();
  }, []);

  const checkLanguageSelection = async () => {
    try {
      const language = await AsyncStorage.getItem('userLanguage');
      setIsLanguageSelected(language !== null);
    } catch (error) {
      setIsLanguageSelected(false);
    }
  };

  if (isLanguageSelected === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <AppProvider>
            <AppContent isLanguageSelected={isLanguageSelected} />
          </AppProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
});
