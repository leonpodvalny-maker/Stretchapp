import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { CloudUserData, SyncStatus } from '../types/auth';
import { UserSettings, CustomTraining, TrainingHistory } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const SYNC_TIMEOUT = 10000; // 10 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Get device ID (create if doesn't exist)
const getDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = uuid.v4() as string;
    await AsyncStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Push data to Firestore
export const pushToCloud = async (
  userId: string,
  settings: UserSettings,
  customTrainings: CustomTraining[],
  trainingHistory: TrainingHistory[],
  language: string
): Promise<void> => {
  const deviceId = await getDeviceId();
  const userRef = doc(firestore, 'users', userId);

  const cloudData: CloudUserData = {
    userId,
    settings,
    customTrainings,
    trainingHistory,
    language,
    lastSyncedAt: new Date().toISOString(),
    deviceId,
  };

  await setDoc(userRef, cloudData, { merge: true });
};

// Pull data from Firestore
export const pullFromCloud = async (userId: string): Promise<CloudUserData | null> => {
  const userRef = doc(firestore, 'users', userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as CloudUserData;
  }

  return null;
};

// Merge sync data with conflict resolution
export const mergeSyncData = (
  local: {
    settings: UserSettings;
    customTrainings: CustomTraining[];
    trainingHistory: TrainingHistory[];
    language: string;
  },
  cloud: CloudUserData | null
): {
  settings: UserSettings;
  customTrainings: CustomTraining[];
  trainingHistory: TrainingHistory[];
  language: string;
  shouldUpdate: boolean;
} => {
  if (!cloud) {
    // No cloud data, use local
    return { ...local, shouldUpdate: false };
  }

  // Settings: Last write wins (timestamp-based)
  let mergedSettings = local.settings;
  if (cloud.settings.lastSyncedAt && local.settings.lastSyncedAt) {
    if (new Date(cloud.settings.lastSyncedAt) > new Date(local.settings.lastSyncedAt)) {
      mergedSettings = cloud.settings;
    }
  } else if (cloud.settings.lastSyncedAt) {
    mergedSettings = cloud.settings;
  }

  // Training History: Merge arrays by unique ID
  const mergedHistory = [...local.trainingHistory];
  cloud.trainingHistory.forEach(cloudItem => {
    const existingIndex = mergedHistory.findIndex(item => item.id === cloudItem.id);
    if (existingIndex === -1) {
      mergedHistory.push(cloudItem);
    }
  });

  // Custom Trainings: Merge by training ID
  const mergedTrainings = [...local.customTrainings];
  cloud.customTrainings.forEach(cloudItem => {
    const existingIndex = mergedTrainings.findIndex(item => item.id === cloudItem.id);
    if (existingIndex === -1) {
      mergedTrainings.push(cloudItem);
    } else {
      // Update if cloud version is newer
      if (new Date(cloudItem.createdAt) > new Date(mergedTrainings[existingIndex].createdAt)) {
        mergedTrainings[existingIndex] = cloudItem;
      }
    }
  });

  // Language: Use cloud if available
  const mergedLanguage = cloud.language || local.language;

  const shouldUpdate =
    JSON.stringify(mergedSettings) !== JSON.stringify(local.settings) ||
    JSON.stringify(mergedHistory) !== JSON.stringify(local.trainingHistory) ||
    JSON.stringify(mergedTrainings) !== JSON.stringify(local.customTrainings) ||
    mergedLanguage !== local.language;

  return {
    settings: mergedSettings,
    customTrainings: mergedTrainings,
    trainingHistory: mergedHistory,
    language: mergedLanguage,
    shouldUpdate,
  };
};

// Sync after login (bidirectional)
export const syncAfterLogin = async (
  userId: string,
  localData: {
    settings: UserSettings;
    customTrainings: CustomTraining[];
    trainingHistory: TrainingHistory[];
    language: string;
  }
): Promise<{
  settings: UserSettings;
  customTrainings: CustomTraining[];
  trainingHistory: TrainingHistory[];
  language: string;
  shouldUpdate: boolean;
}> => {
  try {
    // Pull from cloud
    const cloudData = await pullFromCloud(userId);

    // Merge data
    const merged = mergeSyncData(localData, cloudData);

    // Push merged data back to cloud
    await pushToCloud(
      userId,
      merged.settings,
      merged.customTrainings,
      merged.trainingHistory,
      merged.language
    );

    return merged;
  } catch (error) {
    console.error('Error syncing after login:', error);
    throw error;
  }
};

// Sync before app exit (push only)
export const syncBeforeExit = async (
  userId: string,
  settings: UserSettings,
  customTrainings: CustomTraining[],
  trainingHistory: TrainingHistory[],
  language: string
): Promise<void> => {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Sync timeout')), 3000);
    });

    await Promise.race([
      pushToCloud(userId, settings, customTrainings, trainingHistory, language),
      timeoutPromise,
    ]);
  } catch (error) {
    console.error('Error syncing before exit:', error);
    // Don't throw, just log (app is exiting)
  }
};

// Sync on app foreground (pull only)
export const syncOnForeground = async (
  userId: string,
  localData: {
    settings: UserSettings;
    customTrainings: CustomTraining[];
    trainingHistory: TrainingHistory[];
    language: string;
  }
): Promise<{
  settings: UserSettings;
  customTrainings: CustomTraining[];
  trainingHistory: TrainingHistory[];
  language: string;
  shouldUpdate: boolean;
}> => {
  try {
    const cloudData = await pullFromCloud(userId);
    return mergeSyncData(localData, cloudData);
  } catch (error) {
    console.error('Error syncing on foreground:', error);
    throw error;
  }
};

// Immediate sync with retry and debouncing
let syncDebounceTimer: NodeJS.Timeout | null = null;

export const syncImmediately = async (
  userId: string,
  settings: UserSettings,
  customTrainings: CustomTraining[],
  trainingHistory: TrainingHistory[],
  language: string
): Promise<void> => {
  // Clear existing timer
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
  }

  // Debounce: wait 500ms before syncing
  return new Promise((resolve, reject) => {
    syncDebounceTimer = setTimeout(async () => {
      let attempts = 0;
      let lastError: any = null;

      while (attempts < MAX_RETRY_ATTEMPTS) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Sync timeout')), SYNC_TIMEOUT);
          });

          await Promise.race([
            pushToCloud(userId, settings, customTrainings, trainingHistory, language),
            timeoutPromise,
          ]);

          resolve();
          return;
        } catch (error) {
          lastError = error;
          attempts++;

          if (attempts < MAX_RETRY_ATTEMPTS) {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempts - 1)));
          }
        }
      }

      reject(lastError);
    }, 500);
  });
};
