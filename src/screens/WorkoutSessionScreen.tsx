import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { defaultTrainings } from '../data/trainings';
import { TrainingHistory } from '../types';
import ExerciseAnimation from '../components/ExerciseAnimation';
import { colors, spacing, fontSize, borderRadius, shadows } from '../utils/theme';

type RouteProps = RouteProp<RootStackParamList, 'WorkoutSession'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutSession'>;

export default function WorkoutSessionScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { translate, language } = useLanguage();
  const { customTrainings, settings, addTrainingHistory } = useApp();
  const { trainingId, exerciseDurations } = route.params;

  const allTrainings = [...defaultTrainings, ...customTrainings];
  const training = allTrainings.find((t) => t.id === trainingId);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(
    exerciseDurations[0] || training?.exercises[0]?.defaultDuration || 30
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<
    Array<{ exerciseId: string; exerciseName: string; duration: number }>
  >([]);

  const currentExercise = training?.exercises[currentExerciseIndex];
  const pauseDuration = settings?.pauseBetweenExercises || 10;
  const restTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef(false);

  // Helper function to get translated exercise properties
  const getTranslatedExercise = (exercise: typeof currentExercise) => {
    if (!exercise) return { name: '', description: '' };
    return {
      name: exercise.nameKey ? translate(exercise.nameKey) : exercise.name,
      description: exercise.descriptionKey ? translate(exercise.descriptionKey) : exercise.description,
    };
  };

  useEffect(() => {
    if (!training) {
      Alert.alert(translate('error'), translate('trainingNotFound'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }
  }, [training]);

  // Cleanup timeout and speech on unmount
  useEffect(() => {
    return () => {
      if (restTimeoutRef.current) {
        clearTimeout(restTimeoutRef.current);
      }
      stopSpeech();
    };
  }, []);

  // TTS function to speak exercise description
  const speakExerciseDescription = async (exercise: typeof currentExercise) => {
    if (!exercise) {
      console.log('TTS: No exercise');
      return;
    }

    if (!settings?.ttsEnabled) {
      console.log('TTS: Disabled in settings', settings?.ttsEnabled);
      return;
    }

    const translatedExercise = getTranslatedExercise(exercise);
    console.log('TTS: Speaking exercise:', translatedExercise.name);

    // Stop any ongoing speech
    await stopSpeech();

    // Map language codes to TTS language codes
    const languageMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ru: 'ru-RU',
      zh: 'zh-CN',
      ja: 'ja-JP',
    };

    const ttsLanguage = languageMap[language] || 'en-US';
    const textToSpeak = `${translatedExercise.name}. ${translatedExercise.description}`;

    console.log('TTS: Text to speak:', textToSpeak);
    console.log('TTS: Language:', ttsLanguage);

    try {
      isSpeakingRef.current = true;
      await Speech.speak(textToSpeak, {
        language: ttsLanguage,
        pitch: 1.0,
        rate: 0.85,
        onDone: () => {
          console.log('TTS: Done speaking');
          isSpeakingRef.current = false;
        },
        onStopped: () => {
          console.log('TTS: Stopped');
          isSpeakingRef.current = false;
        },
        onError: (error) => {
          console.log('TTS: Error callback', error);
          isSpeakingRef.current = false;
        },
      });
      console.log('TTS: Speech started');
    } catch (error) {
      console.error('TTS Error:', error);
      isSpeakingRef.current = false;
    }
  };

  // Stop TTS speech
  const stopSpeech = async () => {
    try {
      if (isSpeakingRef.current) {
        await Speech.stop();
        isSpeakingRef.current = false;
      }
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  };

  // Speak exercise description when new exercise starts
  useEffect(() => {
    if (currentExercise && !isResting && settings?.ttsEnabled) {
      speakExerciseDescription(currentExercise);
    }
  }, [currentExerciseIndex, isResting]);

  useEffect(() => {
    if (isPaused || !currentExercise) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleExerciseComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentExerciseIndex, isPaused, isResting, currentExercise]);

  const handleExerciseComplete = () => {
    if (!currentExercise || !training) return;

    // Stop any ongoing speech
    stopSpeech();

    const exerciseDuration = exerciseDurations[currentExerciseIndex] || currentExercise.defaultDuration;
    const translatedExercise = getTranslatedExercise(currentExercise);

    setCompletedExercises((prev) => [
      ...prev,
      {
        exerciseId: currentExercise.id,
        exerciseName: translatedExercise.name,
        duration: exerciseDuration,
      },
    ]);

    if (currentExerciseIndex < training.exercises.length - 1) {
      // Start rest period
      setIsResting(true);
      setTimeRemaining(pauseDuration);
      setIsPaused(true); // Pause the timer during rest

      // Schedule transition to next exercise
      restTimeoutRef.current = setTimeout(() => {
        const nextIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextIndex);
        setTimeRemaining(
          exerciseDurations[nextIndex] ||
            training.exercises[nextIndex]?.defaultDuration ||
            30
        );
        setIsResting(false);
        setIsPaused(false); // Resume timer for next exercise
      }, pauseDuration * 1000);
    } else {
      handleWorkoutComplete();
    }
  };

  const handleWorkoutComplete = async () => {
    if (!training) return;

    // Use translation key if available, otherwise use hardcoded name
    const displayName = training.nameKey ? translate(training.nameKey) : training.name;

    const finalExercise = getTranslatedExercise(currentExercise);

    const history: TrainingHistory = {
      id: Date.now().toString(),
      trainingId: training.id,
      trainingName: displayName,
      date: new Date().toISOString().split('T')[0],
      exercises: [
        ...completedExercises,
        {
          exerciseId: currentExercise!.id,
          exerciseName: finalExercise.name,
          duration: exerciseDurations[currentExerciseIndex] || currentExercise!.defaultDuration,
        },
      ],
    };

    try {
      await addTrainingHistory(history);
      Alert.alert(
        translate('workoutComplete'),
        translate('workoutCompleteMessage').replace('{name}', displayName),
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(translate('error'), translate('failedToSaveHistory'), [
        { text: 'OK', onPress: () => navigation.navigate('Main') },
      ]);
    }
  };

  const handlePauseResume = () => {
    if (isResting) return; // Don't allow pause during rest

    if (!isPaused) {
      // Pausing - stop speech
      stopSpeech();
    }

    setIsPaused(!isPaused);
  };

  const handleQuit = () => {
    Alert.alert(
      translate('quitWorkout'),
      translate('quitWorkoutConfirm'),
      [
        {
          text: translate('cancel'),
          style: 'cancel',
        },
        {
          text: translate('quit'),
          style: 'destructive',
          onPress: () => {
            if (restTimeoutRef.current) {
              clearTimeout(restTimeoutRef.current);
            }
            stopSpeech();
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!training || !currentExercise) {
    return null;
  }

  // Use translation key if available, otherwise use hardcoded name
  const displayName = training.nameKey ? translate(training.nameKey) : training.name;
  const translatedCurrentExercise = getTranslatedExercise(currentExercise);

  // Get translated name for next exercise
  const nextExercise = training.exercises[currentExerciseIndex + 1];
  const translatedNextExercise = nextExercise ? getTranslatedExercise(nextExercise) : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.trainingName}>{displayName}</Text>
        <Text style={styles.progress}>
          {translate('exercise')} {currentExerciseIndex + 1} / {training.exercises.length}
        </Text>
      </View>

      <View style={styles.animationContainer}>
        <ExerciseAnimation exerciseId={currentExercise.id} />
      </View>

      <View style={styles.infoContainer}>
        {isResting ? (
          <>
            <Text style={styles.restingText}>{translate('resting')}</Text>
            <Text style={styles.nextExerciseText}>
              {translate('next')}: {translatedNextExercise?.name}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.exerciseName}>{translatedCurrentExercise.name}</Text>
            <Text style={styles.exerciseDescription}>{translatedCurrentExercise.description}</Text>
          </>
        )}
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{timeRemaining}</Text>
        <Text style={styles.timerLabel}>{translate('seconds')}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.pauseButton, isResting && styles.buttonDisabled]}
          onPress={handlePauseResume}
          disabled={isResting}
          accessibilityLabel={isPaused ? translate('resume') : translate('pause')}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {isPaused ? translate('resume') : translate('pause')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.quitButton]}
          onPress={handleQuit}
          accessibilityLabel={translate('quit')}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{translate('quit')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    ...shadows.small,
  },
  trainingName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  progress: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  animationContainer: {
    height: 250,
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  infoContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    minHeight: 100,
    ...shadows.small,
  },
  exerciseName: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  exerciseDescription: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  restingText: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  nextExerciseText: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  timer: {
    fontSize: fontSize.display,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timerLabel: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: colors.primary,
  },
  quitButton: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
});
