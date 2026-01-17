import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function CalendarScreen() {
  const { translate } = useLanguage();
  const { trainingHistory } = useApp();

  const markedDates: Record<string, any> = {};
  trainingHistory.forEach((history) => {
    markedDates[history.date] = {
      marked: true,
      dotColor: '#4CAF50',
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        markedDates={markedDates}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#4CAF50',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#4CAF50',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
        }}
      />
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>{translate('trainingHistory')}</Text>
        {trainingHistory.length === 0 ? (
          <Text style={styles.emptyText}>{translate('noTrainings')}</Text>
        ) : (
          trainingHistory.map((history) => (
            <View key={history.id} style={styles.historyItem}>
              <Text style={styles.historyDate}>{history.date}</Text>
              <Text style={styles.historyName}>{history.trainingName}</Text>
              <Text style={styles.historyExercises}>
                {history.exercises.length} {history.exercises.length === 1 ? translate('exercise') : translate('exercisesPlural')} {translate('finish').toLowerCase()}
              </Text>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  historyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historyExercises: {
    fontSize: 14,
    color: '#4CAF50',
  },
});
