import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import MainScreen from '../screens/MainScreen';
import TrainingListScreen from '../screens/TrainingListScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
import MyTrainingsScreen from '../screens/MyTrainingsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';

export type RootStackParamList = {
  LanguageSelection: undefined;
  Main: undefined;
  TrainingList: { trainingId: string };
  ExerciseDetail: { exerciseId: string; trainingId: string; duration?: number };
  MyTrainings: undefined;
  Calendar: undefined;
  Settings: undefined;
  WorkoutSession: { trainingId: string; exerciseDurations: number[] };
};

const Stack = createStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  initialRoute: 'LanguageSelection' | 'Main';
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ initialRoute }) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="LanguageSelection"
        component={LanguageSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={MainScreen}
        options={{ title: 'Stretcher' }}
      />
      <Stack.Screen
        name="TrainingList"
        component={TrainingListScreen}
        options={{ title: 'Training' }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: 'Exercise' }}
      />
      <Stack.Screen
        name="MyTrainings"
        component={MyTrainingsScreen}
        options={{ title: 'My Trainings' }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
        options={{ title: 'Workout', headerLeft: () => null }}
      />
    </Stack.Navigator>
  );
};
