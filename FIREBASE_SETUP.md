# Firebase Authentication Setup Guide

This guide will help you set up Firebase authentication for SecureChat.

## Prerequisites

1. A Google account
2. Node.js and npm installed
3. Firebase CLI (optional but recommended)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "securechat-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project dashboard, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", and add your project support email
   - **GitHub**: Click, toggle "Enable", and add your GitHub OAuth App credentials

### GitHub OAuth Setup (for GitHub sign-in)

1. Go to GitHub.com → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: "SecureChat"
   - Homepage URL: Your app URL (e.g., `http://localhost:8080` for development)
   - Authorization callback URL: `https://your-project-id.firebaseapp.com/__/auth/handler`
4. Copy the Client ID and Client Secret to Firebase GitHub provider settings

## Step 3: Configure Firestore Database

1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Enter app nickname (e.g., "SecureChat Web")
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 5: Install Firebase Dependencies

Run the following command in your project directory:

\`\`\`bash
npm install firebase
\`\`\`

## Step 6: Configure Environment Variables

Create or update your `.env` file with your Firebase configuration:

\`\`\`env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
\`\`\`

Replace the placeholder values with your actual Firebase configuration values.

## Step 7: Security Rules (Firestore)

Update your Firestore security rules to secure user data:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add other collection rules as needed
    match /{document=**} {
      allow read, write: if false; // Deny all other access
    }
  }
}
\`\`\`

## Step 8: Test the Integration

1. Start your development server: \`npm run dev\`
2. Navigate to \`/signin\` in your browser
3. Try signing up with email/password
4. Test Google and GitHub sign-in (if configured)
5. Test anonymous sign-in

## Features Included

### Authentication Methods
- ✅ Email/Password registration and login
- ✅ Google OAuth sign-in
- ✅ GitHub OAuth sign-in
- ✅ Anonymous session creation
- ✅ Password reset via email

### User Management
- ✅ User profile creation and management
- ✅ Preference settings
- ✅ Statistics tracking
- ✅ Session management

### Security Features
- ✅ Secure password requirements
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Account deletion
- ✅ Session timeout protection

## Development vs Production

### Development
- Use localhost URLs for OAuth callbacks
- Test mode for Firestore rules
- Debug mode enabled

### Production
- Update OAuth callback URLs to your production domain
- Implement proper Firestore security rules
- Enable proper authentication restrictions
- Set up Firebase hosting (optional)

## Troubleshooting

### Common Issues

1. **"Firebase not defined" error**
   - Make sure you've installed Firebase: \`npm install firebase\`
   - Check that environment variables are properly set

2. **OAuth popup blocked**
   - Enable popups for your domain
   - Use redirect method instead of popup for mobile

3. **"Project not found" error**
   - Verify your project ID in environment variables
   - Make sure the Firebase project exists and is active

4. **Firestore permission denied**
   - Check your Firestore security rules
   - Ensure user is properly authenticated

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

## Next Steps

After setting up Firebase authentication:

1. Configure additional features like push notifications
2. Set up Firebase Analytics (optional)
3. Implement proper error handling
4. Add user profile image upload with Firebase Storage
5. Set up Firebase Functions for backend logic (optional)

The authentication system is now fully integrated and ready to use!
