import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../context/LanguageContext';
import { defaultTrainings } from '../data/trainings';
import { useApp } from '../context/AppContext';
import ExerciseCard from '../components/ExerciseCard';

type NavigationProp = StackNavigationProp<RootStackParamList, 'TrainingList'>;
type TrainingListRouteProp = RouteProp<RootStackParamList, 'TrainingList'>;

export default function TrainingListScreen() {
  const route = useRoute<TrainingListRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { translate } = useLanguage();
  const { customTrainings } = useApp();
  const { trainingId } = route.params;

  const allTrainings = [...defaultTrainings, ...customTrainings];
  const training = allTrainings.find((t) => t.id === trainingId);

  if (!training) {
    return (
      <View style={styles.container}>
        <Text>{translate('trainingNotFound')}</Text>
      </View>
    );
  }

  const handleStartTraining = () => {
    const exerciseDurations = training.exercises.map((ex) => ex.defaultDuration);
    navigation.navigate('WorkoutSession', {
      trainingId: training.id,
      exerciseDurations,
    });
  };

  // Use translation key if available, otherwise use hardcoded name
  const displayName = training.nameKey ? translate(training.nameKey) : training.name;
  const displayDescription = training.descriptionKey ? translate(training.descriptionKey) : training.description;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{displayName}</Text>
        <Text style={styles.description}>{displayDescription}</Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStartTraining}>
          <Text style={styles.startButtonText}>{translate('startTraining')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {training.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index + 1}
            onPress={() =>
              navigation.navigate('ExerciseDetail', {
                exerciseId: exercise.id,
                trainingId: training.id,
                duration: exercise.defaultDuration,
              })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
