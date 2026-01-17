import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings, TrainingHistory, CustomTraining } from '../types';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

interface AppContextType {
  settings: UserSettings | null;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  trainingHistory: TrainingHistory[];
  addTrainingHistory: (history: TrainingHistory) => Promise<void>;
  customTrainings: CustomTraining[];
  addCustomTraining: (training: CustomTraining) => Promise<void>;
  deleteCustomTraining: (id: string) => Promise<void>;
  isLoading: boolean;
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
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<TrainingHistory[]>([]);
  const [customTrainings, setCustomTrainings] = useState<CustomTraining[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
    } catch (error) {
      logger.error('Error deleting custom training:', error);
      throw error;
    }
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
