import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface ExerciseAnimationProps {
  exerciseId: string;
}

export default function ExerciseAnimation({ exerciseId }: ExerciseAnimationProps) {
  // For now, we'll use a placeholder. In production, you'd load actual Lottie animations
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Exercise Animation</Text>
      <Text style={styles.subtitle}>Animation for exercise {exerciseId}</Text>
      {/* 
      <LottieView
        source={require(`../assets/animations/${exerciseId}.json`)}
        autoPlay
        loop
        style={styles.animation}
      />
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  placeholder: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
