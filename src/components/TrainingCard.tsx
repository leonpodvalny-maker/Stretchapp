import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Training } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '../utils/theme';

interface TrainingCardProps {
  training: Training;
  onPress: () => void;
}

const TrainingCard = memo(({ training, onPress }: TrainingCardProps) => {
  const { translate } = useLanguage();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={training.name}
      accessibilityHint={`View ${training.exercises.length} exercises`}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <Text style={styles.name}>{training.name}</Text>
        <Text style={styles.description}>{training.description}</Text>
        <Text style={styles.exerciseCount}>
          {training.exercises.length} {training.exercises.length === 1 ? translate('exercise') : translate('exercisesPlural')}
        </Text>
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
  exerciseCount: {
    fontSize: fontSize.xs,
    color: colors.primary,
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
