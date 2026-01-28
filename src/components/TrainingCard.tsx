import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Training } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { calculateWorkoutDuration, formatDuration } from '../utils/duration';
import { colors, spacing, fontSize, borderRadius, shadows } from '../utils/theme';

interface TrainingCardProps {
  training: Training;
  onPress: () => void;
}

const TrainingCard = memo(({ training, onPress }: TrainingCardProps) => {
  const { translate } = useLanguage();
  const { settings } = useApp();

  // Use translation key if available, otherwise use hardcoded name
  const displayName = training.nameKey ? translate(training.nameKey) : training.name;
  const displayDescription = training.descriptionKey ? translate(training.descriptionKey) : training.description;

  // Calculate total workout duration
  const pauseBetweenExercises = settings?.pauseBetweenExercises || 10;
  const totalSeconds = calculateWorkoutDuration(training, pauseBetweenExercises);
  const durationText = formatDuration(totalSeconds, translate);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={displayName}
      accessibilityHint={`View ${training.exercises.length} exercises`}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.description}>{displayDescription}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.exerciseCount}>
            {training.exercises.length} {training.exercises.length === 1 ? translate('exercise') : translate('exercisesPlural')}
          </Text>
          <Text style={styles.duration}> • {durationText}</Text>
        </View>
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );
});

TrainingCard.displayName = 'TrainingCard';

export default TrainingCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseCount: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  duration: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  arrow: {
    marginLeft: spacing.md,
  },
  arrowText: {
    fontSize: fontSize.xxl,
    color: colors.primary,
  },
});
