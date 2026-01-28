import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { UserSettings } from '../types';
import DaySelector from '../components/DaySelector';
import TimeInput from '../components/TimeInput';
import { colors, spacing, fontSize, borderRadius, shadows } from '../utils/theme';
import { validation } from '../utils/validation';

export default function SettingsScreen() {
  const { translate, language, setLanguage } = useLanguage();
  const { settings, updateSettings, isSyncing, lastSyncedAt, syncFromCloud, syncError } = useApp();
  const { user, loginWithGoogle, logout, loading: authLoading, error: authError } = useAuth();
  const { isConnected } = useNetworkStatus();
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(settings);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateInputValue, setDateInputValue] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (settings) {
      // Ensure new fields are initialized for backward compatibility
      const migratedSettings = {
        ...settings,
        differentTimePerDay: settings.differentTimePerDay ?? false,
        reminderTimesPerDay: settings.reminderTimesPerDay ?? {},
      };
      setLocalSettings(migratedSettings);

      // Initialize date input value from settings
      if (settings.dateOfBirth) {
        setDateInputValue(formatDateDisplay(settings.dateOfBirth));
      }
    }
  }, [settings]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!localSettings) {
    return null;
  }

  // Auto-save settings with validation
  const updateAndSaveSetting = async (key: keyof UserSettings, value: any) => {
    if (!localSettings) return;

    const updatedSettings = { ...localSettings, [key]: value };
    setLocalSettings(updatedSettings);

    // Validate before saving
    if (key === 'userName') {
      const validation_result = validation.validateUserName(value);
      if (!validation_result.isValid && value) {
        return; // Don't save invalid data
      }
    } else if (key === 'height') {
      const validation_result = validation.validateHeight(value, updatedSettings.unitSystem);
      if (!validation_result.isValid) {
        return;
      }
    } else if (key === 'weight') {
      const validation_result = validation.validateWeight(value, updatedSettings.unitSystem);
      if (!validation_result.isValid) {
        return;
      }
    } else if (key === 'pauseBetweenExercises') {
      const validation_result = validation.validatePause(value);
      if (!validation_result.isValid) {
        return;
      }
    }

    await updateSettings(updatedSettings);
  };

  // Debounced auto-save for text inputs (saves after 1 second of no typing)
  const updateAndSaveSettingDebounced = (key: keyof UserSettings, value: any) => {
    if (!localSettings) return;

    const updatedSettings = { ...localSettings, [key]: value };
    setLocalSettings(updatedSettings);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second
    saveTimeoutRef.current = setTimeout(async () => {
      await updateAndSaveSetting(key, value);
    }, 1000);
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      Alert.alert(translate('error'), error.message || 'Failed to sign in');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      translate('signOut'),
      'Are you sure you want to sign out?',
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert(translate('error'), error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleSyncNow = async () => {
    try {
      await syncFromCloud();
      Alert.alert(translate('success'), translate('dataSynced'));
    } catch (error: any) {
      Alert.alert(translate('error'), error.message || translate('syncFailed'));
    }
  };

  // Format date input as user types (adds slashes automatically)
  const formatDateInput = (input: string): string => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, '');

    // Format as DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Parse DD/MM/YYYY to YYYY-MM-DD for storage
  const parseDateInput = (input: string): string | null => {
    const parts = input.split('/');
    if (parts.length !== 3) return null;

    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];

    if (year.length !== 4) return null;

    // Basic validation
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (dayNum < 1 || dayNum > 31) return null;
    if (monthNum < 1 || monthNum > 12) return null;
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return null;

    return `${year}-${month}-${day}`;
  };

  // Handle date input change
  const handleDateInputChange = (text: string) => {
    const formatted = formatDateInput(text);
    setDateInputValue(formatted);

    // If date is complete, validate and save
    if (formatted.length === 10) {
      const parsed = parseDateInput(formatted);
      if (parsed) {
        updateAndSaveSetting('dateOfBirth', parsed);
      }
    }
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDateDisplay = (dateString: string | null): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatTimeSinceSync = (lastSyncedAt: string | null): string => {
    if (!lastSyncedAt) return translate('notSignedIn');

    const now = new Date();
    const synced = new Date(lastSyncedAt);
    const diffMs = now.getTime() - synced.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 10) return translate('justNow');
    if (diffSeconds < 60) return `${diffSeconds} ${translate('secondsAgo')}`;
    if (diffMinutes < 60) return `${diffMinutes} ${translate('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${translate('hoursAgo')}`;
    return `${diffDays} ${translate('daysAgo')}`;
  };

  // Get time for a specific day (fallback to default reminderTime)
  const getTimeForDay = (day: number): string => {
    if (!localSettings) return '09:00';
    if (!localSettings.reminderTimesPerDay) return localSettings.reminderTime;
    return localSettings.reminderTimesPerDay[day] || localSettings.reminderTime;
  };

  // Update time for a specific day
  const updateTimeForDay = (day: number, time: string) => {
    if (!localSettings) return;
    const currentTimes = localSettings.reminderTimesPerDay || {};
    const updatedTimes = { ...currentTimes, [day]: time };
    updateAndSaveSetting('reminderTimesPerDay', updatedTimes);
  };

  // Get day name from day number
  const getDayName = (dayNum: number): string => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return translate(dayNames[dayNum]);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('userName')}</Text>
            <TextInput
              style={styles.input}
              value={localSettings.userName}
              onChangeText={(text) => {
                const sanitized = validation.sanitizeText(text, 50);
                updateAndSaveSettingDebounced('userName', sanitized);
              }}
              placeholder="Enter your name"
              accessibilityLabel={translate('userName')}
              accessibilityHint="Enter your name"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('height')}</Text>
            <TextInput
              style={styles.input}
              value={localSettings.height.toString()}
              onChangeText={(text) => {
                const num = parseFloat(text);
                if (!isNaN(num)) updateAndSaveSettingDebounced('height', num);
              }}
              keyboardType="numeric"
              placeholder={localSettings.unitSystem === 'metric' ? 'cm' : 'in'}
              accessibilityLabel={translate('height')}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('weight')}</Text>
            <TextInput
              style={styles.input}
              value={localSettings.weight.toString()}
              onChangeText={(text) => {
                const num = parseFloat(text);
                if (!isNaN(num)) updateAndSaveSettingDebounced('weight', num);
              }}
              keyboardType="numeric"
              placeholder={localSettings.unitSystem === 'metric' ? 'kg' : 'lb'}
              accessibilityLabel={translate('weight')}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('dateOfBirth')}</Text>
            <View style={styles.dateInputRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={dateInputValue}
                onChangeText={handleDateInputChange}
                keyboardType="numeric"
                placeholder="DD/MM/YYYY"
                maxLength={10}
                accessibilityLabel={translate('dateOfBirth')}
                accessibilityHint="Enter date as DD/MM/YYYY"
              />
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => setShowDatePicker(true)}
                accessibilityLabel="Open calendar picker"
                accessibilityRole="button"
              >
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
            {Platform.OS === 'web' ? (
              showDatePicker && (
                <View style={styles.webDatePickerContainer}>
                  <input
                    type="date"
                    value={localSettings.dateOfBirth || ''}
                    onChange={(e: any) => {
                      const newDate = e.target.value;
                      updateAndSaveSetting('dateOfBirth', newDate);
                      setDateInputValue(formatDateDisplay(newDate));
                      setShowDatePicker(false);
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    min="1900-01-01"
                    onBlur={() => setShowDatePicker(false)}
                    autoFocus
                    style={{
                      backgroundColor: colors.inputBackground,
                      borderRadius: borderRadius.sm,
                      padding: spacing.md,
                      fontSize: fontSize.md,
                      color: colors.text.primary,
                      border: 'none',
                      width: '100%',
                      marginTop: spacing.sm,
                    }}
                  />
                </View>
              )
            ) : (
              <>
                {showDatePicker && (
                  <DateTimePicker
                    value={localSettings.dateOfBirth ? new Date(localSettings.dateOfBirth) : new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    onChange={(event, date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (date) {
                        const dateString = date.toISOString().split('T')[0];
                        updateAndSaveSetting('dateOfBirth', dateString);
                        setDateInputValue(formatDateDisplay(dateString));
                      }
                      if (event.type === 'dismissed') {
                        setShowDatePicker(false);
                      }
                    }}
                  />
                )}
                {showDatePicker && Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.switchGroup}>
            <Text style={styles.label}>{translate('keepScreenOn')}</Text>
            <Switch
              value={localSettings.keepScreenOn}
              onValueChange={(value) => updateAndSaveSetting('keepScreenOn', value)}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              accessibilityLabel={translate('keepScreenOn')}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('language')}</Text>
            <View style={styles.languageButtons}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageButton,
                    language === lang.code && styles.languageButtonActive,
                  ]}
                  onPress={() => {
                    setLanguage(lang.code);
                    updateAndSaveSetting('language', lang.code);
                  }}
                  accessibilityLabel={lang.name}
                  accessibilityRole="button"
                  accessibilityState={{ selected: language === lang.code }}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      language === lang.code && styles.languageButtonTextActive,
                    ]}
                  >
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('unitSystem')}</Text>
            <View style={styles.unitButtons}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  localSettings.unitSystem === 'metric' && styles.unitButtonActive,
                ]}
                onPress={() => updateAndSaveSetting('unitSystem', 'metric')}
                accessibilityLabel={translate('metric')}
                accessibilityRole="button"
                accessibilityState={{ selected: localSettings.unitSystem === 'metric' }}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    localSettings.unitSystem === 'metric' && styles.unitButtonTextActive,
                  ]}
                >
                  {translate('metric')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  localSettings.unitSystem === 'imperial' && styles.unitButtonActive,
                ]}
                onPress={() => updateAndSaveSetting('unitSystem', 'imperial')}
                accessibilityLabel={translate('imperial')}
                accessibilityRole="button"
                accessibilityState={{ selected: localSettings.unitSystem === 'imperial' }}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    localSettings.unitSystem === 'imperial' && styles.unitButtonTextActive,
                  ]}
                >
                  {translate('imperial')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate('reminder')}</Text>
          <View style={styles.switchGroup}>
            <Text style={styles.label}>{translate('reminderEnabled')}</Text>
            <Switch
              value={localSettings.reminderEnabled}
              onValueChange={(value) => updateAndSaveSetting('reminderEnabled', value)}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              accessibilityLabel={translate('reminderEnabled')}
            />
          </View>
          {localSettings.reminderEnabled && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{translate('selectDays')}</Text>
                <DaySelector
                  selectedDays={localSettings.reminderDays}
                  onChange={(days) => updateAndSaveSetting('reminderDays', days)}
                />
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.label}>{translate('differentTimePerDay')}</Text>
                <Switch
                  value={localSettings.differentTimePerDay}
                  onValueChange={(value) => updateAndSaveSetting('differentTimePerDay', value)}
                  trackColor={{ false: colors.disabled, true: colors.primary }}
                  accessibilityLabel={translate('differentTimePerDay')}
                />
              </View>

              {!localSettings.differentTimePerDay ? (
                // Single time for all days
                <View style={styles.inputGroup}>
                  <TimeInput
                    value={localSettings.reminderTime}
                    onChange={(time) => updateAndSaveSetting('reminderTime', time)}
                    label={translate('selectTime')}
                  />
                </View>
              ) : (
                // Different time for each selected day
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{translate('timePerDay')}</Text>
                  {localSettings.reminderDays.sort((a, b) => {
                    // Sort to start from Monday
                    const order = [1, 2, 3, 4, 5, 6, 0];
                    return order.indexOf(a) - order.indexOf(b);
                  }).map((day) => (
                    <View key={day} style={styles.dayTimeContainer}>
                      <TimeInput
                        value={getTimeForDay(day)}
                        onChange={(time) => updateTimeForDay(day, time)}
                        label={getDayName(day)}
                      />
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate('ttsOptions')}</Text>
          <View style={styles.switchGroup}>
            <Text style={styles.label}>{translate('ttsEnabled')}</Text>
            <Switch
              value={localSettings.ttsEnabled}
              onValueChange={(value) => updateAndSaveSetting('ttsEnabled', value)}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              accessibilityLabel={translate('ttsEnabled')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate('trainingOptions')}</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('pauseBetweenExercises')}</Text>
            <TextInput
              style={styles.input}
              value={localSettings.pauseBetweenExercises.toString()}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                if (!isNaN(num)) updateAndSaveSettingDebounced('pauseBetweenExercises', num);
              }}
              keyboardType="numeric"
              placeholder="10"
              accessibilityLabel={translate('pauseBetweenExercises')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate('sync')}</Text>

          {/* Network Status */}
          {isConnected === false && (
            <View style={styles.statusBanner}>
              <Text style={styles.offlineText}>{translate('offline')}</Text>
            </View>
          )}

          {!user ? (
            // Not signed in - show sign in button
            <>
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={authLoading}
                accessibilityLabel={translate('signInWithGoogle')}
                accessibilityRole="button"
              >
                {authLoading ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Text style={styles.googleButtonText}>{translate('signInWithGoogle')}</Text>
                )}
              </TouchableOpacity>
              {authError && <Text style={styles.errorText}>{authError}</Text>}
            </>
          ) : (
            // Signed in - show user info and sync controls
            <>
              <View style={styles.userInfoContainer}>
                <Text style={styles.userEmail}>
                  {translate('signedInAs')}: {user.email}
                </Text>
              </View>

              {/* Sync Status */}
              <View style={styles.syncStatusContainer}>
                {isSyncing ? (
                  <View style={styles.syncingRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.syncingText}>{translate('syncInProgress')}</Text>
                  </View>
                ) : syncError ? (
                  <Text style={styles.errorText}>
                    {translate('syncFailed')}: {syncError}
                  </Text>
                ) : (
                  <Text style={styles.syncedText}>
                    {translate('lastSynced')}: {formatTimeSinceSync(lastSyncedAt)}
                  </Text>
                )}
              </View>

              {/* Sync Now Button */}
              <TouchableOpacity
                style={styles.syncNowButton}
                onPress={handleSyncNow}
                disabled={isSyncing || !isConnected}
                accessibilityLabel={translate('syncNow')}
                accessibilityRole="button"
              >
                <Text style={styles.syncNowButtonText}>{translate('syncNow')}</Text>
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={authLoading}
                accessibilityLabel={translate('signOut')}
                accessibilityRole="button"
              >
                {authLoading ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Text style={styles.logoutButtonText}>{translate('signOut')}</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  calendarButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
    height: 48,
  },
  calendarIcon: {
    fontSize: fontSize.xl,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dateButton: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
  },
  dateText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  webDatePickerContainer: {
    marginTop: spacing.sm,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  languageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.inputBackground,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  languageButtonActive: {
    backgroundColor: colors.primary,
  },
  languageButtonText: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },
  languageButtonTextActive: {
    color: colors.text.inverse,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  unitButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
  },
  unitButtonText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  unitButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    alignItems: 'center',
  },
  syncButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  statusBanner: {
    backgroundColor: colors.warning || '#FFA500',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  offlineText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  googleButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  userEmail: {
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  syncStatusContainer: {
    marginBottom: spacing.md,
  },
  syncingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  syncingText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  syncedText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
  },
  syncNowButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  syncNowButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  dayTimeContainer: {
    marginBottom: spacing.lg,
  },
});
