import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../context/LanguageContext';
import { defaultTrainings } from '../data/trainings';
import { useApp } from '../context/AppContext';
import ExerciseAnimation from '../components/ExerciseAnimation';
import TimeSelector from '../components/TimeSelector';

type ExerciseDetailRouteProp = RouteProp<RootStackParamList, 'ExerciseDetail'>;

export default function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailRouteProp>();
  const { translate } = useLanguage();
  const { customTrainings } = useApp();
  const { exerciseId, trainingId, duration: initialDuration } = route.params;

  const allTrainings = [...defaultTrainings, ...customTrainings];
  const training = allTrainings.find((t) => t.id === trainingId);
  const exercise = training?.exercises.find((e) => e.id === exerciseId);

  const [duration, setDuration] = useState(initialDuration || 30);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text>Exercise not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.animationContainer}>
          <ExerciseAnimation exerciseId={exerciseId} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.description}>{exercise.description}</Text>
        </View>
        <View style={styles.selectorContainer}>
          <Text style={styles.label}>
            {translate('duration')} ({translate('seconds')})
          </Text>
          <TimeSelector
            value={duration}
            onChange={setDuration}
            min={10}
            max={300}
            step={5}
          />
        </View>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>{translate('start')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  animationContainer: {
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  selectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
