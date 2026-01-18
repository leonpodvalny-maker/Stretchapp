import { UserSettings, CustomTraining, TrainingHistory } from './index';

export interface CloudUserData {
  userId: string;
  settings: UserSettings;
  customTrainings: CustomTraining[];
  trainingHistory: TrainingHistory[];
  language: string;
  lastSyncedAt: string;
  deviceId: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}
