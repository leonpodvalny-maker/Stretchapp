import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, TrainingHistory, CustomTraining } from '../types';
import { logger } from './logger';

const STORAGE_KEYS = {
  USER_SETTINGS: 'userSettings',
  TRAINING_HISTORY: 'trainingHistory',
  CUSTOM_TRAININGS: 'customTrainings',
  USER_LANGUAGE: 'userLanguage',
};

export const storage = {
  async getSettings(): Promise<UserSettings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Error getting settings:', error);
      return null;
    }
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      logger.error('Error saving settings:', error);
    }
  },

  async getTrainingHistory(): Promise<TrainingHistory[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRAINING_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('Error getting training history:', error);
      return [];
    }
  },

  async saveTrainingHistory(history: TrainingHistory[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRAINING_HISTORY, JSON.stringify(history));
    } catch (error) {
      logger.error('Error saving training history:', error);
    }
  },

  async getCustomTrainings(): Promise<CustomTraining[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_TRAININGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('Error getting custom trainings:', error);
      return [];
    }
  },

  async saveCustomTrainings(trainings: CustomTraining[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_TRAININGS, JSON.stringify(trainings));
    } catch (error) {
      logger.error('Error saving custom trainings:', error);
    }
  },

  async getLanguage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_LANGUAGE);
    } catch (error) {
      logger.error('Error getting language:', error);
      return null;
    }
  },

  async saveLanguage(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_LANGUAGE, language);
    } catch (error) {
      logger.error('Error saving language:', error);
    }
  },
};
