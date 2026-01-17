import { Training } from '../types';

export const defaultTrainings: Training[] = [
  {
    id: '1',
    name: 'Morning Stretch',
    description: 'Perfect way to start your day with gentle stretches',
    exercises: [
      {
        id: '1-1',
        name: 'Neck Stretch',
        description: 'Gently tilt your head to the right, hold for 30 seconds, then repeat on the left side.',
        defaultDuration: 30,
      },
      {
        id: '1-2',
        name: 'Shoulder Roll',
        description: 'Roll your shoulders backward in a circular motion 10 times, then forward 10 times.',
        defaultDuration: 30,
      },
      {
        id: '1-3',
        name: 'Arm Circles',
        description: 'Extend your arms to the sides and make small circles, gradually increasing the size.',
        defaultDuration: 30,
      },
      {
        id: '1-4',
        name: 'Forward Fold',
        description: 'Stand with feet hip-width apart, slowly bend forward and reach toward your toes.',
        defaultDuration: 30,
      },
    ],
  },
  {
    id: '2',
    name: 'Full Body Flexibility',
    description: 'Comprehensive stretching routine for entire body',
    exercises: [
      {
        id: '2-1',
        name: 'Cat-Cow Stretch',
        description: 'Start on hands and knees, arch your back up (cat), then drop it down (cow).',
        defaultDuration: 30,
      },
      {
        id: '2-2',
        name: 'Hip Flexor Stretch',
        description: 'Step forward into a lunge position, keeping your back leg straight.',
        defaultDuration: 30,
      },
      {
        id: '2-3',
        name: 'Hamstring Stretch',
        description: 'Sit on the floor with one leg extended, reach forward toward your toes.',
        defaultDuration: 30,
      },
      {
        id: '2-4',
        name: 'Quad Stretch',
        description: 'Stand and pull your heel toward your glutes, holding your ankle.',
        defaultDuration: 30,
      },
      {
        id: '2-5',
        name: 'Spinal Twist',
        description: 'Sit with legs extended, cross one leg over the other and twist your torso.',
        defaultDuration: 30,
      },
    ],
  },
  {
    id: '3',
    name: 'Evening Relaxation',
    description: 'Gentle stretches to unwind before bed',
    exercises: [
      {
        id: '3-1',
        name: 'Child\'s Pose',
        description: 'Kneel on the floor, sit back on your heels, and reach your arms forward.',
        defaultDuration: 30,
      },
      {
        id: '3-2',
        name: 'Seated Forward Bend',
        description: 'Sit with legs extended, slowly reach forward and hold your feet or ankles.',
        defaultDuration: 30,
      },
      {
        id: '3-3',
        name: 'Supine Twist',
        description: 'Lie on your back, bring knees to chest, then drop them to one side.',
        defaultDuration: 30,
      },
      {
        id: '3-4',
        name: 'Legs Up the Wall',
        description: 'Lie on your back and rest your legs vertically against a wall.',
        defaultDuration: 30,
      },
    ],
  },
];

export const getAllExercises = (): Training['exercises'] => {
  return defaultTrainings.flatMap(training => training.exercises);
};
