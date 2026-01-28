# Firebase Setup Guide

This guide will walk you through setting up Firebase for the StretchApp app to enable Google Sign-In and cloud sync functionality.

## Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: **StretchApp App** (or your preferred name)
4. Click "Continue"
5. Disable Google Analytics (optional for now)
6. Click "Create project"
7. Wait for project creation to complete
8. Click "Continue"

## Step 2: Register Your App

### For Web (Required for Expo)

1. In the Firebase Console, on your project's **Project Overview** page, look for the section "Get started by adding Firebase to your app" (or "Add an app")
2. Click the **Web icon** (`</>`) - it's typically the first icon in the row of platform options
2. Enter app nickname: **StretchApp Web**
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. **IMPORTANT**: Copy the Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

6. Paste this configuration into `src/services/firebase.ts` (replace the placeholder values)

### For Android

1. In the Firebase Console, click the **Android icon**
2. Enter package name: `com.stretchapp.app`
3. Enter app nickname: **StretchApp Android** (optional)
4. Click "Register app"
5. Download the `google-services.json` file
6. Place `google-services.json` in the **root directory** of your project (same level as `app.json`)

### For iOS (Optional)

1. In the Firebase Console, click the **iOS icon**
2. Enter iOS bundle ID: `com.stretchapp.app`
3. Enter app nickname: **StretchApp iOS** (optional)
4. Click "Register app"
5. Download the `GoogleService-Info.plist` file
6. Place it in the root directory

## Step 3: Enable Google Sign-In

1. In the Firebase Console, go to **Authentication** in the left sidebar
2. Click "Get started" (if not already enabled)
3. Click on the **Sign-in method** tab
4. Click on **Google** in the providers list
5. Toggle the **Enable** switch
6. Select a support email from the dropdown
7. Click **Save**

## Step 4: Create Firestore Database

1. In the Firebase Console, go to **Firestore Database** in the left sidebar
2. Click "Create database"
3. Select "Start in **test mode**" (we'll add security rules later)
4. Choose a Cloud Firestore location (select the closest to your users)
5. Click "Enable"
6. Wait for the database to be created

## Step 5: Deploy Firestore Security Rules

The security rules file has already been created at `firestore.rules`. To deploy them:

### Option 1: Using Firebase Console (Manual)

1. Go to **Firestore Database** > **Rules** tab
2. Replace the default rules with the content from `firestore.rules`:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

### Option 2: Using Firebase CLI (Recommended)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use `firestore.rules` as the rules file
   - Don't overwrite the existing file

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Step 6: Configure Google OAuth Client IDs

To enable Google Sign-In in your app, you need to create OAuth client IDs for each platform.

### Get Web Client ID (Already created)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** > **Credentials**
4. You should see a Web client automatically created by Firebase
5. Click on it and copy the **Client ID**
6. Paste it into `src/services/authService.ts` as `GOOGLE_WEB_CLIENT_ID`

### Create Android Client ID

1. In Google Cloud Console > **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Android** as application type
4. Enter name: **StretchApp Android**
5. Enter package name: `com.stretchapp.app`
6. Get SHA-1 fingerprint:

   **For development (debug keystore):**
   ```bash
   # On Windows
   keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

   # On Mac/Linux
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

   **For production:**
   - Use your release keystore
   - Or get it from Google Play Console if using Play App Signing

7. Paste the SHA-1 fingerprint
8. Click **Create**
9. Copy the **Client ID**
10. Paste it into `src/services/authService.ts` as `GOOGLE_ANDROID_CLIENT_ID`

### Create iOS Client ID (Optional)

1. In Google Cloud Console > **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **iOS** as application type
4. Enter name: **StretchApp iOS**
5. Enter bundle ID: `com.stretchapp.app`
6. Click **Create**
7. Copy the **Client ID**
8. Paste it into `src/services/authService.ts` as `GOOGLE_IOS_CLIENT_ID`

## Step 7: Update Configuration Files

### Update `src/services/firebase.ts`

Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // From Step 2
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Update `src/services/authService.ts`

Replace the placeholder client IDs:

```typescript
const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
```

## Step 8: Test the Setup

1. Start your development server:
   ```bash
   npm start
   ```

2. Open the app in your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

3. Navigate to **Settings**

4. You should see "Sign in with Google" button

5. Click the button and test the sign-in flow

6. After signing in, verify:
   - Your email is displayed
   - "Last synced" shows a recent timestamp
   - You can see "Sync Now" and "Sign Out" buttons

7. Make a change (e.g., update settings) and verify data syncs to Firestore:
   - Go to Firebase Console > Firestore Database
   - You should see a `users` collection with your user ID
   - Check that your data is stored there

## Troubleshooting

### "Error: No Firebase App '[DEFAULT]' has been created"

- Make sure you've updated `src/services/firebase.ts` with your actual config

### "Error: API key not valid"

- Double-check your API key in `src/services/firebase.ts`
- Ensure the API key matches your Firebase project

### "Google Sign-In failed"

- Verify all three client IDs are correct in `src/services/authService.ts`
- Make sure Google Sign-In is enabled in Firebase Console
- For Android: Verify SHA-1 fingerprint is correct

### "Permission denied" when syncing

- Check that Firestore security rules are deployed
- Verify the user is authenticated before syncing

### "Module not found" errors

- Run `npm install` to ensure all dependencies are installed
- Clear Metro bundler cache: `npx expo start --clear`

## Security Best Practices

1. **Never commit credentials to Git:**
   - Add `google-services.json` and `GoogleService-Info.plist` to `.gitignore`
   - Use environment variables for sensitive config in production

2. **Use production keystores for release builds:**
   - Generate a new keystore for production
   - Add its SHA-1 to Google Cloud Console

3. **Monitor Firebase usage:**
   - Set up usage alerts in Firebase Console
   - Free tier has limits: ~50k reads/day, ~20k writes/day

4. **Review security rules regularly:**
   - Current rules allow users to access only their own data
   - Don't make rules too permissive

## Next Steps

- Test sync across multiple devices
- Test offline functionality (airplane mode)
- Test data persistence after app restart
- Consider adding Apple Sign-In for iOS users
- Set up Firebase Analytics (optional)
- Enable Firebase Crashlytics (optional)

## Support

If you encounter issues:
1. Check Firebase Console logs
2. Check Metro bundler logs
3. Check browser/device console for errors
4. Verify all configuration steps were completed

## Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Google Sign-In for Expo](https://docs.expo.dev/guides/authentication/#google)
