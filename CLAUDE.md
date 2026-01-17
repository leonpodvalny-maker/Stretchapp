# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Create Fitness/stretching mobile app.
When first open – start screen with languages, user picks his language
App main screen:
Rows – Training types
Upper right corner – Settings button, when pressed – dropdown

1)	My trainings, when pressed, user can choose exercoses from the list and compose own individual trainingd
2)	Calender with all trainings done 

5)	Settings:
Choose / change user name 
Height
Weight
Date of birth
Don’t turn off screen
Language (by default – system)
Metric and British – kg/lb; cm/in.)
Reminder about training – user chooses Days of week and clock
1)	TTS options
2)	Training options:
Pause between exercises in seconds (user can put his nimber)
3)	Google/Apple login (Sync button beside)

Design – light colours modern sporty 
First there will be three ready trainings
When user clicks on the training, he sees exersices list, when press exersice, sees animation and text description, below he can choose how long he will do this exercise (default time of all exercises – 30 seconds)




## Build & Development Commands

### Install Dependencies
```bash
npm install
```

### For iOS (requires macOS)
```bash
cd ios && pod install && cd ..
```

### Start Development Server
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

### Build Commands
```bash
npm run android    # Start Android
npm run ios        # Start iOS
npm run web        # Start web version
```

## Architecture

### Tech Stack
- **React Native** with **Expo** - Cross-platform mobile development
- **TypeScript** - Type safety
- **React Navigation** - Screen navigation
- **React Context** - State management
- **AsyncStorage** - Local data persistence

### Project Structure
```
src/
├── components/       # Reusable UI components
│   ├── ExerciseAnimation.tsx
│   ├── ExerciseCard.tsx
│   ├── SettingsDropdown.tsx
│   ├── TimeSelector.tsx
│   └── TrainingCard.tsx
├── context/         # React Context providers
│   ├── AppContext.tsx      # App-wide state (settings, history, custom trainings)
│   └── LanguageContext.tsx # Language/i18n state
├── data/           # Static data
│   └── trainings.ts       # Default training exercises
├── navigation/     # Navigation setup
│   └── AppNavigator.tsx   # Stack navigator configuration
├── screens/        # App screens
│   ├── CalendarScreen.tsx
│   ├── ExerciseDetailScreen.tsx
│   ├── LanguageSelectionScreen.tsx
│   ├── MainScreen.tsx
│   ├── MyTrainingsScreen.tsx
│   ├── SettingsScreen.tsx
│   └── TrainingListScreen.tsx
├── types/          # TypeScript definitions
│   └── index.ts
└── utils/          # Utility functions
    ├── i18n.ts            # Internationalization
    └── storage.ts         # AsyncStorage helpers
```

### Key Features
1. **Language Selection** - First screen on app launch
2. **Main Screen** - Lists all trainings (default + custom)
3. **Settings Dropdown** - Quick access to My Trainings, Calendar, Settings
4. **Custom Trainings** - Users can create their own training routines
5. **Calendar** - View training history with marked dates
6. **Settings** - Comprehensive user preferences and profile
7. **Exercise Details** - Animation, description, and time selector

### Data Flow
- Settings and user data stored in AsyncStorage
- Context providers manage global state
- Navigation handled by React Navigation stack
- Language/i18n managed by LanguageContext
