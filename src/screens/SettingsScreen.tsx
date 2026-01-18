import React, { useState, useEffect } from 'react';
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
import { colors, spacing, fontSize, borderRadius, shadows } from '../utils/theme';
import { validation } from '../utils/validation';

export default function SettingsScreen() {
  const { translate, language, setLanguage } = useLanguage();
  const { settings, updateSettings, isSyncing, lastSyncedAt, syncFromCloud, syncError } = useApp();
  const { user, loginWithGoogle, logout, loading: authLoading, error: authError } = useAuth();
  const { isConnected } = useNetworkStatus();
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(settings);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!localSettings) {
    return null;
  }

  const handleSave = async () => {
    if (localSettings) {
      // Validate inputs
      const nameValidation = validation.validateUserName(localSettings.userName);
      if (!nameValidation.isValid && localSettings.userName) {
        Alert.alert(translate('error'), nameValidation.error);
        return;
      }

      const heightValidation = validation.validateHeight(
        localSettings.height,
        localSettings.unitSystem
      );
      if (!heightValidation.isValid) {
        Alert.alert(translate('error'), heightValidation.error);
        return;
      }

      const weightValidation = validation.validateWeight(
        localSettings.weight,
        localSettings.unitSystem
      );
      if (!weightValidation.isValid) {
        Alert.alert(translate('error'), weightValidation.error);
        return;
      }

      const pauseValidation = validation.validatePause(localSettings.pauseBetweenExercises);
      if (!pauseValidation.isValid) {
        Alert.alert(translate('error'), pauseValidation.error);
        return;
      }

      await updateSettings(localSettings);
      Alert.alert(translate('success'), translate('settingsSaved'));
    }
  };

  const updateLocalSetting = (key: keyof UserSettings, value: any) => {
    if (localSettings) {
      setLocalSettings({ ...localSettings, [key]: value });
    }
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
                updateLocalSetting('userName', sanitized);
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
                if (!isNaN(num)) updateLocalSetting('height', num);
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
                if (!isNaN(num)) updateLocalSetting('weight', num);
              }}
              keyboardType="numeric"
              placeholder={localSettings.unitSystem === 'metric' ? 'kg' : 'lb'}
              accessibilityLabel={translate('weight')}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('dateOfBirth')}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              accessibilityLabel={translate('dateOfBirth')}
              accessibilityRole="button"
            >
              <Text style={styles.dateText}>
                {localSettings.dateOfBirth || 'Select date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={localSettings.dateOfBirth ? new Date(localSettings.dateOfBirth) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) {
                    updateLocalSetting('dateOfBirth', date.toISOString().split('T')[0]);
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
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.switchGroup}>
            <Text style={styles.label}>{translate('keepScreenOn')}</Text>
            <Switch
              value={localSettings.keepScreenOn}
              onValueChange={(value) => updateLocalSetting('keepScreenOn', value)}
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
                    updateLocalSetting('language', lang.code);
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
                onPress={() => updateLocalSetting('unitSystem', 'metric')}
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
                onPress={() => updateLocalSetting('unitSystem', 'imperial')}
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
              onValueChange={(value) => updateLocalSetting('reminderEnabled', value)}
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
                  onChange={(days) => updateLocalSetting('reminderDays', days)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{translate('selectTime')}</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowTimePicker(true)}
                  accessibilityLabel={translate('selectTime')}
                  accessibilityRole="button"
                >
                  <Text style={styles.dateText}>{localSettings.reminderTime}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={new Date(`2000-01-01T${localSettings.reminderTime}`)}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      setShowTimePicker(Platform.OS === 'ios');
                      if (date) {
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        updateLocalSetting('reminderTime', `${hours}:${minutes}`);
                      }
                      if (event.type === 'dismissed') {
                        setShowTimePicker(false);
                      }
                    }}
                  />
                )}
                {showTimePicker && Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate('ttsOptions')}</Text>
          <View style={styles.switchGroup}>
            <Text style={styles.label}>{translate('ttsEnabled')}</Text>
            <Switch
              value={localSettings.ttsEnabled}
              onValueChange={(value) => updateLocalSetting('ttsEnabled', value)}
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
                if (!isNaN(num)) updateLocalSetting('pauseBetweenExercises', num);
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

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          accessibilityLabel={translate('save')}
          accessibilityRole="button"
        >
          <Text style={styles.saveButtonText}>{translate('save')}</Text>
        </TouchableOpacity>
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
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
});
