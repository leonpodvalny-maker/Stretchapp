import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { getAllExercises } from '../data/trainings';
import { CustomTraining } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MyTrainings'>;

export default function MyTrainingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { translate } = useLanguage();
  const { customTrainings, addCustomTraining, deleteCustomTraining } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [trainingName, setTrainingName] = useState('');
  const [trainingDescription, setTrainingDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const allExercises = getAllExercises();

  const handleCreateTraining = () => {
    if (!trainingName.trim()) {
      Alert.alert(translate('error'), translate('enterTrainingName'));
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert(translate('error'), translate('selectAtLeastOneExercise'));
      return;
    }

    const exercises = allExercises.filter((e) => selectedExercises.includes(e.id));
    const newTraining: CustomTraining = {
      id: Date.now().toString(),
      name: trainingName,
      description: trainingDescription || `${translate('customTrainingWith')} ${exercises.length} ${exercises.length === 1 ? translate('exercise') : translate('exercisesPlural')}`,
      exercises,
      createdAt: new Date().toISOString(),
    };

    addCustomTraining(newTraining);
    setTrainingName('');
    setTrainingDescription('');
    setSelectedExercises([]);
    setShowCreateForm(false);
    Alert.alert(translate('success'), translate('customTrainingCreated'));
  };

  const toggleExercise = (exerciseId: string) => {
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(selectedExercises.filter((id) => id !== exerciseId));
    } else {
      setSelectedExercises([...selectedExercises, exerciseId]);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(translate('deleteTraining'), translate('areYouSure'), [
      { text: translate('cancel'), style: 'cancel' },
      {
        text: translate('delete'),
        style: 'destructive',
        onPress: () => deleteCustomTraining(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.createButtonText}>
            {showCreateForm ? translate('cancel') : translate('createCustomTraining')}
          </Text>
        </TouchableOpacity>
      </View>

      {showCreateForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder={translate('trainingName')}
            value={trainingName}
            onChangeText={setTrainingName}
          />
          <TextInput
            style={styles.input}
            placeholder={translate('trainingDescription')}
            value={trainingDescription}
            onChangeText={setTrainingDescription}
            multiline
          />
          <Text style={styles.label}>{translate('selectExercises')}</Text>
          <ScrollView style={styles.exerciseList}>
            {allExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.exerciseItem,
                  selectedExercises.includes(exercise.id) && styles.exerciseItemSelected,
                ]}
                onPress={() => toggleExercise(exercise.id)}
              >
                <Text
                  style={[
                    styles.exerciseText,
                    selectedExercises.includes(exercise.id) && styles.exerciseTextSelected,
                  ]}
                >
                  {exercise.nameKey ? translate(exercise.nameKey) : exercise.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.saveButton} onPress={handleCreateTraining}>
            <Text style={styles.saveButtonText}>{translate('save')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {customTrainings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{translate('noCustomTrainings')}</Text>
          </View>
        ) : (
          customTrainings.map((training) => (
            <TouchableOpacity
              key={training.id}
              style={styles.trainingCard}
              onPress={() => navigation.navigate('TrainingList', { trainingId: training.id })}
            >
              <View style={styles.trainingInfo}>
                <Text style={styles.trainingName}>{training.name}</Text>
                <Text style={styles.exerciseCount}>
                  {training.exercises.length} {training.exercises.length === 1 ? translate('exercise') : translate('exercisesPlural')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(training.id)}
              >
                <Text style={styles.deleteButtonText}>{translate('delete')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
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
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  exerciseList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  exerciseItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  exerciseItemSelected: {
    backgroundColor: '#4CAF50',
  },
  exerciseText: {
    fontSize: 16,
    color: '#333',
  },
  exerciseTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  trainingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trainingInfo: {
    flex: 1,
  },
  trainingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
