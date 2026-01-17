import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface DaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export default function DaySelector({ selectedDays, onChange }: DaySelectorProps) {
  const { translate } = useLanguage();

  const days = [
    { value: 0, label: translate('sunday') },
    { value: 1, label: translate('monday') },
    { value: 2, label: translate('tuesday') },
    { value: 3, label: translate('wednesday') },
    { value: 4, label: translate('thursday') },
    { value: 5, label: translate('friday') },
    { value: 6, label: translate('saturday') },
  ];

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      onChange(selectedDays.filter((d) => d !== dayValue));
    } else {
      onChange([...selectedDays, dayValue].sort());
    }
  };

  return (
    <View style={styles.container}>
      {days.map((day) => (
        <TouchableOpacity
          key={day.value}
          style={[
            styles.dayButton,
            selectedDays.includes(day.value) && styles.dayButtonSelected,
          ]}
          onPress={() => toggleDay(day.value)}
        >
          <Text
            style={[
              styles.dayText,
              selectedDays.includes(day.value) && styles.dayTextSelected,
            ]}
          >
            {day.label.substring(0, 3)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    marginBottom: 4,
  },
  dayButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  dayText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#fff',
  },
});
