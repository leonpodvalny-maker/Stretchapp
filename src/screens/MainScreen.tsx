import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { defaultTrainings } from '../data/trainings';
import TrainingCard from '../components/TrainingCard';
import SettingsDropdown from '../components/SettingsDropdown';
import { colors, spacing, fontSize, shadows } from '../utils/theme';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export default function MainScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { translate } = useLanguage();
  const { customTrainings } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);

  const allTrainings = useMemo(
    () => [...defaultTrainings, ...customTrainings],
    [customTrainings]
  );

  const handleNavigate = (screen: keyof RootStackParamList) => {
    setShowDropdown(false);
    navigation.navigate(screen as any); // Type assertion needed due to varying param types
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{translate('appName')}</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowDropdown(!showDropdown)}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
        {showDropdown && (
          <SettingsDropdown
            onClose={() => setShowDropdown(false)}
            onNavigate={handleNavigate}
          />
        )}
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {allTrainings.map((training) => (
          <TrainingCard
            key={training.id}
            training={training}
            onPress={() => navigation.navigate('TrainingList', { trainingId: training.id })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  settingsIcon: {
    fontSize: fontSize.xxl,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
});
