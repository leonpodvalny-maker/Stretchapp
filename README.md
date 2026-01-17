# Stretcher - Fitness & Stretching Mobile App

A React Native mobile application for fitness and stretching routines.

## Features

- **Multi-language support** - Choose from 7 languages on first launch
- **Custom training creation** - Build your own training routines from available exercises
- **Training calendar and history** - Track all your completed trainings
- **Comprehensive settings** - User profile, units, reminders, TTS options, and more
- **Exercise animations** - Visual guides for each exercise (Lottie animations)
- **Adjustable exercise duration** - Customize how long you perform each exercise
- **Three default trainings** - Morning Stretch, Full Body Flexibility, Evening Relaxation

## Setup

1. Install dependencies:
```bash
npm install
```

2. For iOS:
```bash
cd ios && pod install && cd ..
```

3. Start the app:
```bash
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator.

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type safety
- **React Navigation** - Navigation between screens
- **AsyncStorage** - Local data persistence
- **React Native Calendars** - Calendar component
- **Lottie React Native** - Animation support
- **Expo** - Development platform

## Project Structure

```
src/
├── components/       # Reusable UI components
├── context/         # React Context for state management
├── data/           # Default training data
├── navigation/     # Navigation configuration
├── screens/        # App screens
├── types/          # TypeScript type definitions
└── utils/          # Utility functions (storage, i18n)
```

## Features in Detail

### Language Selection
On first launch, users select their preferred language. The app supports:
- English
- Spanish
- French
- German
- Russian
- Chinese
- Japanese

### Main Screen
- Displays all available trainings (default + custom)
- Settings dropdown in upper right corner
- Access to My Trainings, Calendar, and Settings

### Settings Screen
- **Profile**: Name, height, weight, date of birth
- **General**: Keep screen on, language, unit system (metric/imperial)
- **Reminder**: Enable/disable, select days of week, set time
- **TTS Options**: Enable text-to-speech
- **Training Options**: Pause between exercises
- **Sync**: Google/Apple login integration

### My Trainings
- Create custom trainings by selecting exercises
- View and delete custom trainings
- Tap to start a custom training

### Calendar
- View all completed trainings
- Marked dates show when trainings were completed
- Training history list below calendar

### Exercise Detail
- Animation placeholder (ready for Lottie animations)
- Text description
- Time selector (10-300 seconds, default 30)
- Start button to begin exercise

## Next Steps

1. Add Lottie animation files in `assets/animations/` for each exercise
2. Add app icons and splash screens
3. Configure Google/Apple authentication
4. Set up notification reminders
5. Implement actual exercise timer functionality
6. Add more default trainings and exercises

## License

Private project
