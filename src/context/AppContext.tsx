import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings, TrainingHistory, CustomTraining } from '../types';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';
import { useAuth } from './AuthContext';
import { syncImmediately, syncAfterLogin } from '../services/syncService';
import { useLanguage } from './LanguageContext';

interface AppContextType {
  settings: UserSettings | null;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  trainingHistory: TrainingHistory[];
  addTrainingHistory: (history: TrainingHistory) => Promise<void>;
  customTrainings: CustomTraining[];
  addCustomTraining: (training: CustomTraining) => Promise<void>;
  deleteCustomTraining: (id: string) => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncFromCloud: () => Promise<void>;
  syncError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: UserSettings = {
  userName: '',
  height: 170,
  weight: 70,
  dateOfBirth: '',
  keepScreenOn: false,
  language: 'en',
  unitSystem: 'metric',
  reminderEnabled: false,
  reminderDays: [],
  reminderTime: '09:00',
  ttsEnabled: false,
  pauseBetweenExercises: 10,
  isSynced: false,
  cloudSyncEnabled: false,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<TrainingHistory[]>([]);
  const [customTrainings, setCustomTrainings] = useState<CustomTraining[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { user } = useAuth();
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  // Sync after user login
  useEffect(() => {
    if (user && settings && !isLoading) {
      performInitialSync();
    }
  }, [user, isLoading]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [loadedSettings, history, custom] = await Promise.all([
        storage.getSettings(),
        storage.getTrainingHistory(),
        storage.getCustomTrainings(),
      ]);

      setSettings(loadedSettings || defaultSettings);
      setTrainingHistory(history);
      setCustomTrainings(custom);
    } catch (error) {
      logger.error('Error loading data:', error);
      setSettings(defaultSettings);
      setTrainingHistory([]);
      setCustomTrainings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      if (!settings) {
        throw new Error('Settings not initialized');
      }
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await storage.saveSettings(updated);
      await triggerSync();
    } catch (error) {
      logger.error('Error updating settings:', error);
      throw error;
    }
  };

  const addTrainingHistory = async (history: TrainingHistory) => {
    try {
      const updated = [...trainingHistory, history];
      setTrainingHistory(updated);
      await storage.saveTrainingHistory(updated);
      await triggerSync();
    } catch (error) {
      logger.error('Error adding training history:', error);
      throw error;
    }
  };

  const addCustomTraining = async (training: CustomTraining) => {
    try {
      const updated = [...customTrainings, training];
      setCustomTrainings(updated);
      await storage.saveCustomTrainings(updated);
      await triggerSync();
    } catch (error) {
      logger.error('Error adding custom training:', error);
      throw error;
    }
  };

  const deleteCustomTraining = async (id: string) => {
    try {
      const updated = customTrainings.filter(t => t.id !== id);
      setCustomTrainings(updated);
      await storage.saveCustomTrainings(updated);
      await triggerSync();
    } catch (error) {
      logger.error('Error deleting custom training:', error);
      throw error;
    }
  };

  const performInitialSync = async () => {
    if (!user || !settings) return;

    try {
      setIsSyncing(true);
      setSyncError(null);

      const merged = await syncAfterLogin(user.uid, {
        settings,
        customTrainings,
        trainingHistory,
        language: currentLanguage,
      });

      if (merged.shouldUpdate) {
        setSettings(merged.settings);
        setCustomTrainings(merged.customTrainings);
        setTrainingHistory(merged.trainingHistory);

        await Promise.all([
          storage.saveSettings(merged.settings),
          storage.saveCustomTrainings(merged.customTrainings),
          storage.saveTrainingHistory(merged.trainingHistory),
        ]);
      }

      const now = new Date().toISOString();
      setLastSyncedAt(now);
      await updateSettings({
        cloudSyncEnabled: true,
        lastSyncedAt: now,
      });
    } catch (error: any) {
      logger.error('Error performing initial sync:', error);
      setSyncError(error.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const triggerSync = async () => {
    if (!user || !settings) return;

    try {
      setIsSyncing(true);
      setSyncError(null);

      await syncImmediately(
        user.uid,
        settings,
        customTrainings,
        trainingHistory,
        currentLanguage
      );

      const now = new Date().toISOString();
      setLastSyncedAt(now);
      await storage.saveSettings({
        ...settings,
        lastSyncedAt: now,
      });
    } catch (error: any) {
      logger.error('Error syncing:', error);
      setSyncError(error.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFromCloud = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    await performInitialSync();
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        trainingHistory,
        addTrainingHistory,
        customTrainings,
        addCustomTraining,
        deleteCustomTraining,
        isLoading,
        isSyncing,
        lastSyncedAt,
        syncFromCloud,
        syncError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
