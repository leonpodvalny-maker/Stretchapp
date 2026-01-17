export interface Exercise {
  id: string;
  name: string;
  description: string;
  animationUrl?: string;
  defaultDuration: number; // in seconds
}

export interface Training {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  icon?: string;
}

export interface UserSettings {
  userName: string;
  height: number;
  weight: number;
  dateOfBirth: string;
  keepScreenOn: boolean;
  language: string;
  unitSystem: 'metric' | 'imperial';
  reminderEnabled: boolean;
  reminderDays: number[]; // 0-6, Sunday-Saturday
  reminderTime: string; // HH:mm format
  ttsEnabled: boolean;
  pauseBetweenExercises: number; // in seconds
  isSynced: boolean;
}

export interface TrainingHistory {
  id: string;
  trainingId: string;
  trainingName: string;
  date: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    duration: number;
  }[];
}

export interface CustomTraining {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  createdAt: string;
}
