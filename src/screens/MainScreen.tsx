import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { defaultTrainings } from '../data/trainings';
import { Training } from '../types';
import TrainingCard from '../components/TrainingCard';
import SettingsDropdown from '../components/SettingsDropdown';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

interface MainScreenProps {
  navigation: MainScreenNavigationProp;
}

/**
 * MainScreen component displays all available trainings (default + custom)
 * and provides access to settings, calendar, and custom trainings through a dropdown menu.
 */
const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { customTrainings } = useApp();
  const { translate } = useLanguage();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Combine default trainings with custom trainings
  const allTrainings = useMemo<Training[]>(() => {
    return [...defaultTrainings, ...customTrainings];
  }, [customTrainings]);

  /**
   * Handles navigation when a training card is pressed
   */
  const handleTrainingPress = (trainingId: string) => {
    navigation.navigate('TrainingList', { trainingId });
  };

  /**
   * Toggles the settings dropdown menu
   */
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  /**
   * Handles navigation from the dropdown menu
   */
  const handleNavigate = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };

  /**
   * Closes the dropdown menu when clicking outside
   */
  const closeDropdown = () => {
    setIsDropdownVisible(false);
  };

  /**
   * Renders each training card
   */
  const renderTrainingItem = ({ item }: { item: Training }) => (
    <TrainingCard
      training={item}
      onPress={() => handleTrainingPress(item.id)}
    />
  );

  /**
   * Renders the header with app title and settings button
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{translate('appName')}</Text>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={toggleDropdown}
        accessibilityLabel={translate('settings')}
        accessibilityHint="Open settings menu"
        accessibilityRole="button"
      >
        <View style={styles.settingsIcon}>
          <View style={styles.settingsDot} />
          <View style={styles.settingsDot} />
          <View style={styles.settingsDot} />
        </View>
      </TouchableOpacity>
    </View>
  );

  /**
   * Renders empty state when no trainings are available
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{translate('noCustomTrainings')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {renderHeader()}

      <View style={styles.content}>
        <FlatList
          data={allTrainings}
          renderItem={renderTrainingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View>
                <SettingsDropdown
                  onClose={closeDropdown}
                  onNavigate={handleNavigate}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  settingsButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  settingsIcon: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  settingsDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginVertical: 2,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default MainScreen;
