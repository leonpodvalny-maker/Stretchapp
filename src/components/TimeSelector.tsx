import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

interface TimeSelectorProps {
  value: number; // Total seconds
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function TimeSelector({
  value,
  onChange,
  min = 10,
  max = 300,
  step = 5,
}: TimeSelectorProps) {
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');

  // Update minutes and seconds when value changes
  useEffect(() => {
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    setMinutes(mins.toString().padStart(2, '0'));
    setSeconds(secs.toString().padStart(2, '0'));
  }, [value]);

  // Update total value from minutes and seconds
  const updateTotal = (newMinutes: string, newSeconds: string) => {
    const mins = parseInt(newMinutes, 10) || 0;
    const secs = parseInt(newSeconds, 10) || 0;
    const total = mins * 60 + secs;

    if (total >= min && total <= max) {
      onChange(total);
    }
  };

  const handleMinutesChange = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers === '') {
      setMinutes('00');
      updateTotal('00', seconds);
      return;
    }

    let num = parseInt(numbers, 10);
    if (num > 99) num = 99;
    if (num < 0) num = 0;

    const formatted = num.toString().padStart(2, '0');
    setMinutes(formatted);
    updateTotal(formatted, seconds);
  };

  const handleSecondsChange = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers === '') {
      setSeconds('00');
      updateTotal(minutes, '00');
      return;
    }

    let num = parseInt(numbers, 10);
    if (num > 59) num = 59;
    if (num < 0) num = 0;

    const formatted = num.toString().padStart(2, '0');
    setSeconds(formatted);
    updateTotal(minutes, formatted);
  };

  const incrementMinutes = () => {
    const current = parseInt(minutes, 10);
    const next = Math.min(99, current + 1);
    const formatted = next.toString().padStart(2, '0');
    setMinutes(formatted);
    updateTotal(formatted, seconds);
  };

  const decrementMinutes = () => {
    const current = parseInt(minutes, 10);
    const prev = Math.max(0, current - 1);
    const formatted = prev.toString().padStart(2, '0');
    setMinutes(formatted);
    updateTotal(formatted, seconds);
  };

  const incrementSeconds = () => {
    const current = parseInt(seconds, 10);
    if (current >= 59) {
      // Wrap to 00 and increment minutes
      setSeconds('00');
      incrementMinutes();
    } else {
      const next = current + 1;
      const formatted = next.toString().padStart(2, '0');
      setSeconds(formatted);
      updateTotal(minutes, formatted);
    }
  };

  const decrementSeconds = () => {
    const current = parseInt(seconds, 10);
    if (current <= 0) {
      // Wrap to 59 and decrement minutes
      setSeconds('59');
      decrementMinutes();
    } else {
      const prev = current - 1;
      const formatted = prev.toString().padStart(2, '0');
      setSeconds(formatted);
      updateTotal(minutes, formatted);
    }
  };

  return (
    <View style={styles.container}>
      {/* Minutes Section */}
      <View style={styles.timeSection}>
        <TouchableOpacity style={styles.arrowButton} onPress={incrementMinutes}>
          <Text style={styles.arrowText}>▲</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={minutes}
          onChangeText={handleMinutesChange}
          keyboardType="numeric"
          textAlign="center"
          maxLength={2}
          selectTextOnFocus
        />
        <TouchableOpacity style={styles.arrowButton} onPress={decrementMinutes}>
          <Text style={styles.arrowText}>▼</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.separator}>:</Text>

      {/* Seconds Section */}
      <View style={styles.timeSection}>
        <TouchableOpacity style={styles.arrowButton} onPress={incrementSeconds}>
          <Text style={styles.arrowText}>▲</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={seconds}
          onChangeText={handleSecondsChange}
          keyboardType="numeric"
          textAlign="center"
          maxLength={2}
          selectTextOnFocus
        />
        <TouchableOpacity style={styles.arrowButton} onPress={decrementSeconds}>
          <Text style={styles.arrowText}>▼</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSection: {
    alignItems: 'center',
  },
  arrowButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  input: {
    width: 60,
    height: 50,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 8,
  },
});
