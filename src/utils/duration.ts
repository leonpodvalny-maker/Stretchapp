import { Training } from '../types';

/**
 * Calculate total workout duration including exercises and pauses
 * @param training - Training object with exercises
 * @param pauseBetweenExercises - Pause duration in seconds
 * @returns Total duration in seconds
 */
export const calculateWorkoutDuration = (
  training: Training,
  pauseBetweenExercises: number
): number => {
  // Sum all exercise durations
  const totalExerciseDuration = training.exercises.reduce(
    (sum, exercise) => sum + exercise.defaultDuration,
    0
  );

  // Calculate number of pauses (no pause before first or after last exercise)
  const numberOfPauses = Math.max(0, training.exercises.length - 1);
  const totalPauseTime = numberOfPauses * pauseBetweenExercises;

  return totalExerciseDuration + totalPauseTime;
};

/**
 * Format duration in seconds to human-readable string
 * @param totalSeconds - Duration in seconds
 * @param translate - Translation function
 * @returns Formatted string like "5 min 30 sec" or "45 sec"
 */
export const formatDuration = (
  totalSeconds: number,
  translate: (key: string) => string
): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0 && seconds > 0) {
    return `${minutes} ${translate('minutes')} ${seconds} ${translate('seconds')}`;
  } else if (minutes > 0) {
    return `${minutes} ${translate('minutes')}`;
  } else {
    return `${seconds} ${translate('seconds')}`;
  }
};
