import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

interface TimeInputProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  label?: string;
}

export default function TimeInput({ value, onChange, label }: TimeInputProps) {
  const [hours, setHours] = useState('09');
  const [minutes, setMinutes] = useState('00');

  // Initialize from value prop
  useEffect(() => {
    const [h, m] = value.split(':');
    setHours(h || '09');
    setMinutes(m || '00');
  }, [value]);

  // Update parent when hours or minutes change
  const updateTime = (newHours: string, newMinutes: string) => {
    const paddedHours = newHours.padStart(2, '0');
    const paddedMinutes = newMinutes.padStart(2, '0');
    onChange(`${paddedHours}:${paddedMinutes}`);
  };

  // Handle hours input
  const handleHoursChange = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers === '') {
      setHours('00');
      updateTime('00', minutes);
      return;
    }

    let num = parseInt(numbers, 10);
    if (num > 23) num = 23;
    if (num < 0) num = 0;

    const formatted = num.toString().padStart(2, '0');
    setHours(formatted);
    updateTime(formatted, minutes);
  };

  // Handle minutes input
  const handleMinutesChange = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers === '') {
      setMinutes('00');
      updateTime(hours, '00');
      return;
    }

    let num = parseInt(numbers, 10);
    if (num > 59) num = 59;
    if (num < 0) num = 0;

    const formatted = num.toString().padStart(2, '0');
    setMinutes(formatted);
    updateTime(hours, formatted);
  };

  // Increment hours
  const incrementHours = () => {
    const current = parseInt(hours, 10);
    const next = current >= 23 ? 0 : current + 1;
    const formatted = next.toString().padStart(2, '0');
    setHours(formatted);
    updateTime(formatted, minutes);
  };

  // Decrement hours
  const decrementHours = () => {
    const current = parseInt(hours, 10);
    const prev = current <= 0 ? 23 : current - 1;
    const formatted = prev.toString().padStart(2, '0');
    setHours(formatted);
    updateTime(formatted, minutes);
  };

  // Increment minutes
  const incrementMinutes = () => {
    const current = parseInt(minutes, 10);
    const next = current >= 59 ? 0 : current + 1;
    const formatted = next.toString().padStart(2, '0');
    setMinutes(formatted);
    updateTime(hours, formatted);
  };

  // Decrement minutes
  const decrementMinutes = () => {
    const current = parseInt(minutes, 10);
    const prev = current <= 0 ? 59 : current - 1;
    const formatted = prev.toString().padStart(2, '0');
    setMinutes(formatted);
    updateTime(hours, formatted);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.timeContainer}>
        {/* Hours Section */}
        <View style={styles.timeSection}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={incrementHours}
            accessibilityLabel="Increase hours"
            accessibilityRole="button"
          >
            <Text style={styles.arrowText}>▲</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.timeInput}
            value={hours}
            onChangeText={handleHoursChange}
            keyboardType="numeric"
            maxLength={2}
            selectTextOnFocus
            accessibilityLabel="Hours"
          />
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={decrementHours}
            accessibilityLabel="Decrease hours"
            accessibilityRole="button"
          >
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <Text style={styles.separator}>:</Text>

        {/* Minutes Section */}
        <View style={styles.timeSection}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={incrementMinutes}
            accessibilityLabel="Increase minutes"
            accessibilityRole="button"
          >
            <Text style={styles.arrowText}>▲</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.timeInput}
            value={minutes}
            onChangeText={handleMinutesChange}
            keyboardType="numeric"
            maxLength={2}
            selectTextOnFocus
            accessibilityLabel="Minutes"
          />
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={decrementMinutes}
            accessibilityLabel="Decrease minutes"
            accessibilityRole="button"
          >
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
  },
  timeSection: {
    alignItems: 'center',
  },
  arrowButton: {
    padding: spacing.xs,
    minWidth: 40,
    alignItems: 'center',
  },
  arrowText: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: 'bold',
  },
  timeInput: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    minWidth: 60,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  separator: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginHorizontal: spacing.sm,
  },
});
