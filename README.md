# GymBro

A comprehensive cross-platform fitness application integrating AI-powered coaching, intelligent nutrition analysis, advanced fitness calculations, and personalized workout management. GymBro delivers professional-grade fitness tools through an intuitive interface available on iOS, Android, and Web platforms.

---

## Table of Contents

- [Overview](#overview)
- [Application Pages](#application-pages)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)

---

## Overview

GymBro is a multi-platform fitness management system designed to deliver personalized fitness experiences through artificial intelligence, real-time form analysis, and comprehensive health metrics. The platform combines advanced technologies including pose detection, food image recognition, and intelligent coaching systems to provide users with actionable fitness guidance. Built with React Native and TypeScript, GymBro supports both free and premium subscription models with role-based access control for administrators.

---

## Application Pages

### Primary Navigation (Tabs)

#### Home

Central hub providing quick access to workout plans and daily fitness summaries. Displays user progress metrics, upcoming workouts, and motivational content. Serves as the entry point for daily fitness tracking and activity review.

#### AI Coach

Intelligent conversational assistant powered by AI language models. Provides personalized fitness advice, workout recommendations, nutrition guidance, and answers fitness-related questions. Features adaptive responses based on user fitness level and goals. Premium feature with usage limits for free tier users.

#### Fitness Calculator

Comprehensive calculation suite including:

- BMI (Body Mass Index) computation with category classification
- BMR (Basal Metabolic Rate) calculation using Harris-Benedict equation
- TDEE (Total Daily Energy Expenditure) estimation based on activity levels
- Macro nutrient recommendations
- Interactive results with actionable insights

#### Nutrition & Food

Detailed food database integration and nutrition tracking interface. Enables users to log meals, track calories, and monitor macro nutrients. Includes search functionality for common foods and beverages with comprehensive nutritional information.

#### Fitness News

Curated fitness and wellness content providing educational articles, training tips, research updates, and lifestyle guidance. Delivers latest industry information to keep users informed about fitness trends and best practices.

#### Workout Plans

Management interface for personalized workout routines. Displays available workout plans, current training programs, exercise details, and progress tracking. Includes body-type specific plan recommendations (Ectomorph, Mesomorph, Endomorph).

### Authentication Pages

#### Login

Secure credential-based authentication with email and password. Supports credential validation against backend authentication system. Includes account recovery options and signup navigation.

#### Signup

New account creation interface with email registration. Includes form validation, password requirements, and terms acceptance. Initiates email verification process upon successful registration.

#### Email Verification

Email confirmation flow ensuring account ownership. Displays verification status and resend options for verification emails.

#### Forgot Password

Account recovery initiation providing password reset request functionality. Triggers secure reset email delivery to registered account email.

#### Reset Password

Secure password reset interface accessible via reset tokens. Enables users to establish new passwords with strength validation.

#### Password Change

Account security management feature allowing existing authenticated users to modify current passwords with verification.

### Profile & Account Management

#### Profile Page

Comprehensive user dashboard displaying personal information, fitness statistics, and account settings. Shows total workouts, current activity streaks, fitness level, and personal goals. Provides navigation to sub-sections for profile management.

#### Edit Profile

Profile information modification interface allowing updates to personal data including name, bio, location, birth date, and fitness preferences. Includes image upload for profile picture.

#### Notifications

Notification preferences and history management. Displays recent notifications including workout reminders, achievement notifications, and system messages. Enables users to configure notification settings.

#### Privacy Settings

User data and privacy control configuration. Allows management of profile visibility, data sharing preferences, and privacy policies review.

### Premium Features

#### Premium Page

Subscription information and upgrade interface. Displays premium tier benefits, pricing details, and feature comparisons between free and premium tiers.

### Settings & Support

#### Settings Hub

Central configuration location for application preferences and user options.

#### Contact Support

User support communication interface enabling customers to submit support requests, report issues, or request assistance.

#### Privacy Policy

Legal documentation displaying application privacy terms and data handling practices.

#### Terms of Service

Legal agreement outline covering application usage terms and user responsibilities.

### Admin Section

#### Admin Dashboard

Administrative overview displaying system metrics, user statistics, and platform health indicators. Shows user activity charts and key performance indicators.

#### Manage Users

User account management interface for administrators. Enables viewing user accounts, managing permissions, and account administration.

#### Manage Exercises

Exercise database management allowing administrators to add, modify, or delete exercises. Controls exercise details including name, description, body parts, and difficulty.

#### Manage Workout Plans

Workout plan creation and modification interface. Enables administrators to create training programs, assign exercises, and manage difficulty levels.

#### Manage Plan Exercises

Exercise-plan association management. Allows configuration of exercises within workout plans including sets, reps, and progression details.

#### Manage Foods

Nutrition database management. Enables administrators to add food items, update nutritional information, and manage food categories.

---

## Features

### AI-Powered Tools

#### AI Coaching System

Conversational AI providing real-time fitness advice, personalized recommendations, and nutrition guidance. Leverages language models for intelligent context-aware responses. Premium feature with tiered usage limits.

#### Pose Detection & Form Analysis

Computer vision technology analyzing exercise form using device camera. Provides real-time feedback on exercise execution, form corrections, and performance scoring. Integrates TensorFlow and MediaPipe for pose estimation.

#### Food Image Recognition

AI-powered food identification and nutritional analysis. Analyzes food images to identify dishes and extract nutritional information including calories, macros, and serving sizes.

### Core Fitness Features

#### Personalized Workout Plans

Body-type specific workout recommendations (Ectomorph, Mesomorph, Endomorph). Provides structured training programs with progressive difficulty levels.

#### Fitness Metrics & Calculations

BMI, BMR, and TDEE calculations with real-time computation and classification. Macro nutrient recommendations based on fitness goals and activity levels.

#### Nutrition Tracking

Comprehensive food logging with macro tracking (protein, carbs, fats). Database integration with common food items and serving sizes.

#### Progress Tracking

Workout history and statistics management. Tracks total workouts completed, current activity streaks, and historical progress data.

#### Form Analysis Feedback

Real-time form correction during exercises using pose detection technology. Provides scoring and actionable feedback for improvement.

### User Management

#### Authentication System

Multi-step email verification process. Secure password management with recovery and reset capabilities. JWT-based session management.

#### Profile Management

User profile customization including personal information, fitness data, and preferences. Profile picture upload and editing.

#### Notification System

Push notification delivery for workouts, achievements, and system events. In-app notification center with notification history.

#### Privacy Controls

Profile visibility settings and data privacy configuration. Customizable notification and sharing preferences.

### Payment & Subscription

#### Stripe Integration

Secure payment processing for premium subscriptions. PCI-compliant transaction handling.

#### Premium Tier System

Free tier with limited AI coach usage and basic features. Premium tier with unlimited AI access, advanced analytics, and exclusive features.

#### Subscription Management

Active subscription tracking and tier information. Upgrade and downgrade options for users.

### Admin Capabilities

#### Content Management

Exercise database administration. Workout plan creation and management. Food database management.

#### User Administration

User account management and role assignment. User statistics and activity monitoring.

#### Dashboard Analytics

System performance metrics and user activity data visualization. Platform health indicators.

---

## Tech Stack

### Frontend Technologies

- React Native 0.81.5 - Cross-platform mobile development framework
- TypeScript 5.9.3 - Typed JavaScript for code quality and safety
- Expo 54.0.30 - Development platform and distribution service
- Expo Router 6.0.21 - File-based routing for React Native
- React 19.1.0 - Component library and state management

### UI & Animation

- React Native Reanimated 4.1.1 - High-performance animations
- Expo Linear Gradient 15.0.8 - Gradient rendering components
- React Native Web 0.21.0 - Web platform support
- Moti 0.30.0 - Animation library for React Native
- React Native Chart Kit 6.12.0 - Data visualization and charting

### AI & Computer Vision

- TensorFlow 2.1.3 - Machine learning framework for pose detection
- MediaPipe 0.0.21 - Pose estimation and form analysis
- Groq API integration - Language model for AI coaching

### Camera & Media

- Expo Camera 17.0.10 - Camera access and capture
- Expo Image Picker 17.0.11 - Image selection and upload
- Expo Image Manipulator 14.0.8 - Image processing and resizing
- Expo Video Thumbnails 10.0.8 - Video preview generation
- Expo GL 55.0.13 - Graphics rendering

### Authentication & Security

- JWT (jsonwebtoken 9.0.3) - Token-based authentication
- Bcryptjs 3.0.3 - Password hashing and encryption
- Expo Auth Session 7.0.10 - OAuth and authentication flows
- Expo Web Browser 15.0.10 - External browser integration

### State Management & Storage

- AsyncStorage 2.2.0 - Local device storage
- Context API - React state management system

### Payment Processing

- Stripe React Native 0.58.0 - Payment integration and processing

### Backend & Database

- Express.js 5.2.1 - Node.js server framework
- MongoDB with Mongoose 9.2.1 - NoSQL database with ODM
- JWT for API authentication
- Bcryptjs for secure password storage

### Additional Libraries

- Lodash 4.18.1 - Utility functions and data manipulation
- Expo Haptics 15.0.8 - Device vibration feedback
- Expo Notifications 0.32.17 - Push notification system
- React Native Gesture Handler 2.28.0 - Touch gesture recognition
- React Native Safe Area Context 5.6.2 - Safe area management
- Expo Vector Icons 15.0.3 - Icon library (Ionicons, Material Icons)

---

## Project Structure

```
GymBro/
├── app/                           # Application routing and screens
│   ├── (tabs)/                    # Primary navigation tab screens
│   │   ├── index.tsx             # Home page
│   │   ├── ai-coach.tsx          # AI coaching interface
│   │   ├── calculator.tsx        # Fitness calculations
│   │   ├── food.tsx              # Nutrition tracking
│   │   ├── news.tsx              # Fitness news and content
│   │   ├── workout.tsx           # Workout management
│   │   └── _layout.tsx           # Tab navigation configuration
│   ├── (auth)/                    # Authentication screens
│   │   ├── login.tsx             # User login
│   │   ├── signup.tsx            # Account registration
│   │   ├── forgot-password.tsx   # Password recovery
│   │   ├── reset-password.tsx    # Password reset
│   │   └── verify-email.tsx      # Email verification
│   ├── admin/                     # Administrator screens
│   │   ├── dashboard.tsx         # Admin overview
│   │   ├── users.tsx             # User management
│   │   ├── manage-exercises.tsx  # Exercise administration
│   │   ├── manage-plan-exercises.tsx # Plan exercise management
│   │   ├── workouts.tsx          # Workout plan management
│   │   └── foods.tsx             # Food database management
│   ├── profile/                   # User profile section
│   │   ├── index.tsx             # Profile main page
│   │   ├── edit-profile.tsx      # Profile editing
│   │   ├── notifications.tsx     # Notification management
│   │   ├── change-password.tsx   # Password modification
│   │   └── privacy-settings.tsx  # Privacy configuration
│   ├── premium/                   # Premium features
│   │   ├── index.tsx             # Premium overview
│   │   └── premium.tsx           # Premium subscription
│   ├── settings/                  # Settings and legal pages
│   │   ├── index.tsx             # Settings hub
│   │   ├── contact-support.tsx   # Support contact
│   │   ├── privacy-policy.tsx    # Privacy documentation
│   │   └── terms-of-service.tsx  # Legal terms
│   ├── config/                    # Configuration pages
│   │   └── plan.tsx              # Plan configuration
│   ├── _layout.tsx               # Root layout configuration
│   └── +not-found.tsx            # 404 error page
├── components/                    # Reusable UI components
│   ├── FoodAnalyzer.tsx          # Food image recognition and analysis
│   ├── PoseDetectionView.tsx     # Form analysis and feedback component
│   ├── MusicPlayer.tsx           # Audio playback component
│   ├── ParallaxScrollView.tsx    # Parallax scroll effect component
│   ├── HapticTab.tsx             # Haptic feedback handler
│   ├── Clock.tsx                 # Clock display component
│   ├── HelloWave.tsx             # Wave animation component
│   ├── ThemedText.tsx            # Theme-aware text component
│   ├── ThemedView.tsx            # Theme-aware view component
│   ├── Collapsible.tsx           # Expandable/collapsible component
│   ├── ExternalLink.tsx          # External link component
│   ├── StripePayment.web.tsx     # Web-specific Stripe payment component
│   └── ui/                        # UI subcomponents
│       └── TabBarBackground.tsx  # Tab bar styling and background
├── constants/                     # Application constants
│   └── Colors.ts                 # Color theme definitions
├── context/                       # React context providers
│   ├── ThemeContext.tsx          # Theme management
│   ├── SimpleThemeContext.tsx    # Light/dark mode context
│   └── MusicContext.tsx          # Music state management
├── hooks/                         # Custom React hooks
│   ├── useColorScheme.ts         # Color scheme detection
│   ├── useColorScheme.web.ts     # Web-specific color scheme
│   └── useThemeColor.ts          # Theme color hook
├── services/                      # Business logic and APIs
│   └── notificationService.ts    # Push notification handling
├── assets/                        # Static assets
│   ├── images/                    # Image assets
│   ├── fonts/                     # Custom fonts
│   └── music/                     # Audio files
├── android/                       # Android native configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── app.json                       # Expo configuration
└── README.md                      # Documentation

```

---

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or Yarn package manager
- Expo CLI installed globally (npm install -g expo-cli)
- Git for version control
- Android Studio (for Android development) or Xcode (for iOS development)

### Installation Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd GymBro
```

2. Install dependencies:

```bash
npm install
```

3. Install Expo CLI if not already installed:

```bash
npm install -g expo-cli
```

### Running the Application

Start the development server:

```bash
npm start
```

Run on specific platforms:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Environment Configuration

Create a .env file in the root directory with the following variables:

```
EXPO_PUBLIC_API_BASE_URL=your_backend_url
EXPO_PUBLIC_STRIPE_KEY=your_stripe_key
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

---

## Development

### Code Organization

The project follows a modular structure with clear separation of concerns:

- Pages and screens organized by feature in the app directory
- Reusable components in the components directory
- Business logic separated in the services directory
- State management through Context API and AsyncStorage

### Available Scripts

```bash
npm start          # Start development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run on web browser
```

### Key Technologies for Development

- TypeScript for type safety and code quality
- React hooks for functional component development
- Reanimated for smooth, performant animations
- AsyncStorage for local data persistence
- Context API for global state management

### Backend Services

The application connects to a Node.js/Express backend that handles:

- User authentication and session management
- Database operations through MongoDB
- Payment processing with Stripe
- API endpoints for content management
- Admin operations and user management

---

## Support

For technical issues or feature requests, use the in-app contact support feature or check the privacy policy and terms of service in the settings section.

For development support, ensure all dependencies are properly installed and the backend server is running before launching the application.

</div>
