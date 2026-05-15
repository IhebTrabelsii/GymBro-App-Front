# GymBro

GymBro is a cross-platform fitness application built with Expo and React Native. It supports Android, iOS, and web while combining workout planning, AI coaching, nutrition tracking, premium subscriptions, and admin content management.

---

## Overview

GymBro delivers a fitness experience with:

- AI coaching and workout recommendations
- Nutrition tracking and food analysis
- Fitness calculators and progress monitoring
- Premium subscription management
- Admin content and user controls
- Authentication, profile, and privacy features

The project is built with TypeScript, Expo Router, and React Native, and integrates backend services for authentication, data storage, and payments.

---

## Main App Sections

### Tabs

- `Home` — Main dashboard with workouts and stats
- `AI Coach` — Conversational fitness guidance
- `Calculator` — BMI, BMR, TDEE, and fitness calculations
- `Food` — Nutrition tracking and food information
- `Workout` — Workout plan browsing and exercise navigation

### Authentication

- Login
- Signup
- Forgot Password
- Reset Password
- Verify Email

### Profile & Settings

- Profile overview
- Edit Profile
- Change Password
- Notifications
- Privacy Settings
- Contact Support
- Privacy Policy
- Terms of Service

### Premium

- Premium subscription overview
- Subscription upgrade flow

### Admin

- Admin dashboard
- User management
- Exercise management
- Workout plan management
- Plan exercise editing
- Food database management

### Other Pages

- Exercise Details
- Form Check
- Sleep tracking
- Hydration, plan, schedule, and experimental config pages

---

## Key Features

- Cross-platform support for Android, iOS, and Web
- AI-powered coaching and workout recommendations
- Nutrition and food tracking
- Fitness calculators with immediate results
- Secure authentication and account recovery
- Premium subscription support with Stripe
- Admin content and user management
- Reusable components and modular screen structure

---

## Tech Stack

### Frontend

- Expo 55.0.0
- React Native 0.83.6
- React 19.2.0
- TypeScript 5.9.3
- Expo Router 55.0.14

### UI & Animation

- React Native Reanimated 4.2.1
- Moti 0.30.0
- React Native Chart Kit 6.12.0
- Expo Linear Gradient

### Camera & Media

- Expo Camera
- Expo Image Picker
- Expo Image Manipulator
- Expo Video Thumbnails

### Authentication & Security

- jsonwebtoken 9.0.3
- bcryptjs 3.0.3

### Backend & Database

- Express 5.2.1
- Mongoose 9.2.1

### Payments

- @stripe/stripe-react-native 0.63.0

---

## Project Structure

```
GymBro/
├── app/                    # App screens and routes
│   ├── (tabs)/             # Main tab screens
│   ├── (auth)/             # Authentication flows
│   ├── admin/              # Admin portal screens
│   ├── profile/            # Profile and account screens
│   ├── premium/            # Premium subscription screens
│   ├── settings/           # Settings and legal pages
│   ├── config/             # App configuration pages
│   ├── exercise-details.tsx
│   ├── form-check.tsx
│   ├── sleep.tsx
│   ├── change-password.tsx
│   ├── privacy-settings.tsx
│   └── _layout.tsx
├── components/             # Reusable UI components
├── constants/              # Styling and theme constants
├── context/                # React context providers
├── hooks/                  # Custom hooks
├── assets/                 # Images, fonts, audio assets
├── android/                # Android native configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript config
└── app.json                # Expo configuration
```

---

## Getting Started

### Prerequisites

- Node.js 16 or newer
- npm or Yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or Xcode for native development

### Install

```bash
git clone <repository-url>
cd GymBro
npm install
```

### Run

```bash
npm start
npm run android
npm run ios
npm run web
```

### Environment Variables

Create a `.env` file with values such as:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend.example.com
EXPO_PUBLIC_STRIPE_KEY=pk_test_...
EXPO_PUBLIC_GROQ_API_KEY=...
```

---

## Development Notes

- App navigation uses Expo Router file-based routes.
- Global state is managed with React Context and AsyncStorage.
- Backend services should handle auth, user data, and payment flows.
- Use `components/` for reusable UI and `app/` for page screens.

---

## Support

If you encounter issues, verify dependencies are installed, environment variables are configured, and the backend is running.

For user-facing issues, open the in-app Contact Support page or review the settings pages for privacy and terms of service.
