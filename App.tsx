import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppProvider, useApp } from './src/context/AppContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { colors, spacing, fontSize } from './src/utils/theme';

function AppContent({ isLanguageSelected }: { isLanguageSelected: boolean }) {
  const { settings } = useApp();

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
      <LanguageProvider>
        <AppProvider>
          <AppContent isLanguageSelected={isLanguageSelected} />
        </AppProvider>
      </LanguageProvider>
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
