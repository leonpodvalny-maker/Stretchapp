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
- **Firebase** - Authentication and cloud sync (Firestore)
- **Google Sign-In** - OAuth authentication via Firebase

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
- Settings and user data stored in AsyncStorage (local)
- Firebase Firestore used for cloud backup and sync
- Google Sign-In authentication via Firebase Auth
- Context providers manage global state
- Navigation handled by React Navigation stack
- Language/i18n managed by LanguageContext

## Firebase Integration

### Setup
The app uses Firebase for:
- **Authentication** - Google Sign-In (OAuth)
- **Cloud Storage** - Firestore for syncing user data (settings, trainings, history)
- **Offline Support** - Firestore offline persistence enabled

### Configuration Files
- `google-services.json` - Android Google Services configuration (Firebase/Google Sign-In)
- `src/services/firebase.ts` - Firebase initialization and configuration

### Platform-Specific Persistence
Firebase Auth uses different persistence mechanisms per platform:
- **Web**: `indexedDBLocalPersistence` (browser IndexedDB)
- **React Native** (iOS/Android): `getReactNativePersistence` with AsyncStorage

### Cloud Sync Features
- Manual sync button in Settings screen
- Automatic sync on Google Sign-In
- Data synced: settings, custom trainings, training history
- Offline-first: works without internet, syncs when online

## Recent Changes (2026-01-24)

### Dependencies Fixed
- Updated `@react-native-community/netinfo` to version 9.3.10 (Expo SDK 49 compatible)
- Run `npx expo install --fix` if dependency warnings appear

### Firebase Web Compatibility
- Fixed Firebase Auth persistence for web platform
- Web builds now use `indexedDBLocalPersistence` instead of React Native-specific persistence
- Eliminates webpack compilation warnings on web

### Development Notes
- Web version runs on http://localhost:19006 (Webpack)
- Metro bundler runs on http://localhost:8081 or http://localhost:8083
- Use `npm start` then press `w` for web, `a` for Android, `i` for iOS
