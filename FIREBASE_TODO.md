# Firebase Setup - Remaining Tasks

✅ **Completed:**
- [x] Created Firebase project (stretchapp-cf32c)
- [x] Registered Web app
- [x] Updated firebase.ts with configuration

## 🔴 **Still Need to Complete:**

### 1. Enable Google Sign-In in Firebase Console
1. Go to https://console.firebase.google.com/project/stretchapp-cf32c/authentication/providers
2. Click on **Google** provider
3. Toggle **Enable**
4. Select support email
5. Click **Save**

### 2. Get OAuth Client IDs from Google Cloud Console
1. Go to https://console.cloud.google.com/apis/credentials?project=stretchapp-cf32c
2. You should see an auto-created Web client
3. Copy the **Web Client ID**
4. Create **Android OAuth client**:
   - Click "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Type: Android
   - Package name: `com.stretchapp.app`
   - Get SHA-1 fingerprint (see below)
5. (Optional) Create **iOS OAuth client**:
   - Type: iOS
   - Bundle ID: `com.stretchapp.app`

### 3. Update authService.ts
Open `src/services/authService.ts` and replace:
```typescript
const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
```

### 4. Get SHA-1 Fingerprint (for Android)
Run this command in terminal:
```bash
# For development (debug keystore)
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```
Copy the SHA-1 fingerprint and use it when creating Android OAuth client.

### 5. Download and Add google-services.json
1. In Firebase Console, go to Project Settings
2. Under "Your apps" > Android app
3. Download `google-services.json`
4. Place it in the **root directory** of this project (same level as app.json)

### 6. Create Firestore Database
1. Go to https://console.firebase.google.com/project/stretchapp-cf32c/firestore
2. Click "Create database"
3. Start in **test mode**
4. Choose location closest to your users
5. Click "Enable"

### 7. Deploy Firestore Security Rules
Option A - Firebase Console:
1. Go to Firestore > Rules tab
2. Copy content from `firestore.rules` file
3. Paste and publish

Option B - Firebase CLI (recommended):
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

## ✅ Quick Verification Checklist
- [ ] Google Sign-In enabled in Firebase Console
- [ ] Web, Android, and iOS OAuth client IDs created
- [ ] authService.ts updated with all 3 client IDs
- [ ] google-services.json downloaded and added to root
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Tested sign-in flow in app

## 🚀 After Completion
Once all steps are done:
1. Run `npm start`
2. Open app in Android/iOS
3. Go to Settings
4. Tap "Sign in with Google"
5. Verify sync works!

## 📚 Detailed Instructions
See `FIREBASE_SETUP.md` for step-by-step guide with screenshots and troubleshooting.
