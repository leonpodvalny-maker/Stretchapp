import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Exercise } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onPress: () => void;
  onDurationChange?: (exerciseId: string, newDurationInSeconds: number) => void;
}

export default function ExerciseCard({ exercise, index, onPress, onDurationChange }: ExerciseCardProps) {
  const { language, translate } = useLanguage();

  // Get translated exercise properties
  const exerciseName = exercise.nameKey ? translate(exercise.nameKey) : exercise.name;
  const exerciseDescription = exercise.descriptionKey ? translate(exercise.descriptionKey) : exercise.description;
  const exerciseStartingPosition = exercise.startingPositionKey ? translate(exercise.startingPositionKey) : exercise.startingPosition;

  // State for duration (in total seconds)
  const [totalSeconds, setTotalSeconds] = useState(exercise.defaultDuration);
  const [originalDuration, setOriginalDuration] = useState(exercise.defaultDuration);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);

  // Convert seconds to minutes and seconds for display
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Format numbers with leading zeros
  const formatMinutes = (min: number): string => min.toString().padStart(3, '0');
  const formatSeconds = (sec: number): string => sec.toString().padStart(2, '0');

  // Handle duration change and show Save button
  const handleDurationChange = (newTotalSeconds: number) => {
    setTotalSeconds(newTotalSeconds);
    setShowSaveButton(newTotalSeconds !== originalDuration);
    setShowSavedConfirmation(false);
  };

  // Handle minutes increment
  const incrementMinutes = (e: any) => {
    e.stopPropagation(); // Prevent card press
    const newMinutes = Math.min(minutes + 1, 999);
    const newTotalSeconds = newMinutes * 60 + seconds;
    handleDurationChange(newTotalSeconds);
  };

  // Handle minutes decrement
  const decrementMinutes = (e: any) => {
    e.stopPropagation(); // Prevent card press
    const newMinutes = Math.max(minutes - 1, 0);
    const newTotalSeconds = newMinutes * 60 + seconds;
    handleDurationChange(newTotalSeconds);
  };

  // Handle seconds increment
  const incrementSeconds = (e: any) => {
    e.stopPropagation(); // Prevent card press
    const newSeconds = seconds === 59 ? 0 : seconds + 1;
    const newTotalSeconds = minutes * 60 + newSeconds;
    handleDurationChange(newTotalSeconds);
  };

  // Handle seconds decrement
  const decrementSeconds = (e: any) => {
    e.stopPropagation(); // Prevent card press
    const newSeconds = seconds === 0 ? 59 : seconds - 1;
    const newTotalSeconds = minutes * 60 + newSeconds;
    handleDurationChange(newTotalSeconds);
  };

  // Handle save button press
  const handleSave = (e: any) => {
    e.stopPropagation(); // Prevent card press
    onDurationChange?.(exercise.id, totalSeconds);
    setOriginalDuration(totalSeconds);
    setShowSaveButton(false);
    setShowSavedConfirmation(true);

    // Hide confirmation after 2 seconds
    setTimeout(() => {
      setShowSavedConfirmation(false);
    }, 2000);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${exerciseName}, ${t('duration', language)}: ${minutes} ${t('minutes', language)} ${seconds} ${t('seconds', language)}`}
    >
      {/* Image/Illustration Section */}
      <View style={styles.imageContainer}>
        {exercise.imageUrl ? (
          <Image
            source={{ uri: exercise.imageUrl }}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderIcon}>🧘</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Exercise Number Badge */}
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{index}</Text>
        </View>

        {/* Exercise Name */}
        <Text style={styles.exerciseName} numberOfLines={2}>
          {exerciseName}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {exerciseDescription}
        </Text>

        {/* Starting Position */}
        {exerciseStartingPosition && (
          <View style={styles.startingPositionContainer}>
            <Text style={styles.startingPositionLabel}>
              {t('startingPosition', language)}:
            </Text>
            <Text style={styles.startingPositionText} numberOfLines={2}>
              {exerciseStartingPosition}
            </Text>
          </View>
        )}

        {/* Duration Display with Interactive Controls */}
        <View style={styles.durationContainer}>
          {/* Minutes Section */}
          <View style={styles.timeBlock}>
            <View style={styles.timeControlRow}>
              {/* Minutes Up Arrow */}
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={incrementMinutes}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel={t('increaseMinutes', language)}
              >
                <Text style={styles.arrowIcon}>▲</Text>
              </TouchableOpacity>

              {/* Minutes Value */}
              <View style={styles.timeValueContainer}>
                <Text style={styles.timeValue}>{formatMinutes(minutes)}</Text>
              </View>

              {/* Minutes Down Arrow */}
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={decrementMinutes}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel={t('decreaseMinutes', language)}
              >
                <Text style={styles.arrowIcon}>▼</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.timeLabel}>{t('minutes', language)}</Text>
          </View>

          {/* Separator */}
          <Text style={styles.timeSeparator}>:</Text>

          {/* Seconds Section */}
          <View style={styles.timeBlock}>
            <View style={styles.timeControlRow}>
              {/* Seconds Up Arrow */}
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={incrementSeconds}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel={t('increaseSeconds', language)}
              >
                <Text style={styles.arrowIcon}>▲</Text>
              </TouchableOpacity>

              {/* Seconds Value */}
              <View style={styles.timeValueContainer}>
                <Text style={styles.timeValue}>{formatSeconds(seconds)}</Text>
              </View>

              {/* Seconds Down Arrow */}
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={decrementSeconds}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel={t('decreaseSeconds', language)}
              >
                <Text style={styles.arrowIcon}>▼</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.timeLabel}>{t('seconds', language)}</Text>
          </View>
        </View>

        {/* Save Button - Shows when duration is modified */}
        {showSaveButton && !showSavedConfirmation && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('saveDuration', language)}
          >
            <Text style={styles.saveButtonText}>{t('saveDuration', language)}</Text>
          </TouchableOpacity>
        )}

        {/* Saved Confirmation - Shows after saving */}
        {showSavedConfirmation && (
          <View style={styles.savedConfirmation}>
            <Text style={styles.savedConfirmationText}>✓ {t('durationSaved', language)}</Text>
          </View>
        )}
      </View>

      {/* Arrow Indicator */}
      <View style={styles.arrowContainer}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f4f8',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: '#f0f4f8',
  },
  placeholderIcon: {
    fontSize: 64,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  numberBadge: {
    position: 'absolute',
    top: -20,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a202c',
    marginTop: 12,
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontSize: 15,
    color: '#4a5568',
    lineHeight: 22,
    marginBottom: 12,
  },
  startingPositionContainer: {
    backgroundColor: '#f7fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
  },
  startingPositionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  startingPositionText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 100,
  },
  timeControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValueContainer: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0369a1',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    fontSize: 12,
    color: '#0369a1',
    marginTop: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0369a1',
    marginHorizontal: 12,
  },
  arrowButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0369a1',
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  arrowIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -20,
  },
  arrowText: {
    fontSize: 40,
    color: '#cbd5e0',
    fontWeight: '300',
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  savedConfirmation: {
    marginTop: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  savedConfirmationText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
