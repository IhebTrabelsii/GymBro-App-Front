# GymBro

A professional cross-platform fitness application providing personalized workout plans, AI-powered coaching, nutrition tracking, and comprehensive fitness management tools.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Support](#support)

---

## Overview

GymBro is a comprehensive fitness platform designed to help users achieve their fitness goals through personalized workout plans, intelligent coaching, and detailed progress tracking. The application supports multiple platforms including iOS, Android, and Web, built with modern technologies and best practices.

---

## Features

**Core Features**

- Personalized workout plans based on body type (Ectomorph, Mesomorph, Endomorph)
- AI-powered fitness coaching and recommendations
- Comprehensive fitness calculator (BMI, BMR, TDEE calculations)
- Detailed nutrition and food database integration
- User profile management and progress tracking
- Premium subscription system with exclusive features
- Fitness news and educational content

**Additional Capabilities**

- Email verification and multi-step authentication
- Password recovery and reset functionality
- Privacy and notification settings customization
- Admin dashboard for content and user management
- Haptic feedback and smooth animations
- Secure payment processing with Stripe integration

---

## Tech Stack

**Frontend**

- React Native with TypeScript
- Expo framework for cross-platform development
- Expo Router for navigation
- React hooks for state management
- Reanimated for animations

**Backend & Database**

- Express.js server
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcryptjs for password encryption

**Additional Libraries**

- Stripe React Native for payments
- Async Storage for local persistence
- Gesture Handler for touch interactions
- Linear Gradient for UI components
- Vector Icons from Expo

---

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or Yarn package manager
- Expo CLI installed globally
- Git for version control

### Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd GymBro
npm install
```

Start the development server:

```bash
npm start
```

### Running on Different Platforms

**iOS** (macOS only)

```bash
npm start -- --ios
```

**Android**

```bash
npm start -- --android
```

**Web**

```bash
npm run web
```

---

## Project Structure

```
GymBro/
├── app/
│   ├── _layout.tsx                  Main layout
│   ├── +not-found.tsx               404 error page
│   ├── (auth)/                      Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   └── verify-email.tsx
│   ├── (tabs)/                      Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx                Home screen
│   │   ├── workout.tsx              Workout plans
│   │   ├── ai-coach.tsx             AI coaching interface
│   │   ├── calculator.tsx           Fitness calculations
│   │   ├── food.tsx                 Nutrition database
│   │   └── news.tsx                 Fitness news
│   ├── admin/                       Administration panel
│   │   ├── dashboard.tsx
│   │   ├── users.tsx
│   │   ├── workouts.tsx
│   │   ├── manage-exercises.tsx
│   │   ├── manage-plan-exercises.tsx
│   │   └── foods.tsx
│   ├── profile/                     User profile section
│   │   ├── index.tsx
│   │   ├── edit-profile.tsx
│   │   ├── change-password.tsx
│   │   ├── notification-settings.tsx
│   │   └── privacy-settings.tsx
│   ├── premium/                     Premium features
│   │   ├── index.tsx
│   │   └── premium.tsx
│   ├── config/                      Configuration
│   │   └── plan.tsx
│   └── utils/                       Utility functions
│       └── socialAuth.ts
├── components/                      Reusable UI components
├── constants/                       App constants and colors
├── context/                         React context providers
├── hooks/                           Custom React hooks
└── assets/                          Images and fonts
```

---

## Development

### Code Organization

- **Components**: Reusable UI components in `/components`
- **Screens**: Full-page views in `/app`
- **Context**: Global state providers in `/context`
- **Hooks**: Custom React hooks in `/hooks`
- **Constants**: Application constants in `/constants`
- **Utils**: Helper functions in `/app/utils`

### Theme System

The application includes a comprehensive theme management system supporting:

- Light and dark modes
- Dynamic color schemes
- Centralized color management via `SimpleThemeContext`

Access theme in your components:

```tsx
import { useSimpleTheme } from '@/context/SimpleThemeContext';

const MyComponent = () => {
  const { theme } = useSimpleTheme();
  const colors = Colors[theme];

  return (
    // Your component code
  );
};
```

### Development Workflow

**Starting Development**

```bash
npm start
```

**Testing on Specific Platforms**

```bash
npm start -- --ios
npm start -- --android
npm run web
```

### Best Practices

- Use TypeScript for type safety
- Follow component composition patterns
- Leverage custom hooks for reusable logic
- Maintain consistent styling through context
- Test across all platforms during development
- Add meaningful comments for complex business logic

---

## Deployment

### Building for Production

**iOS**

```bash
eas build --platform ios
```

**Android**

```bash
eas build --platform android
```

**Web**

```bash
expo export:web
```

### Environment Configuration

Create a `.env` file in the project root with necessary API endpoints and keys:

```
REACT_APP_API_URL=your_api_url
STRIPE_PUBLIC_KEY=your_stripe_key
```

---

## Support

For questions, issues, or feature requests, please submit an issue on the project repository or contact the development team.

### Common Issues

**Expo CLI not found**: Ensure Expo is installed globally

```bash
npm install -g expo-cli
```

**Dependencies not installing**: Clear cache and reinstall

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Platform-specific errors**: Clear Expo cache

```bash
npm start --clear
```

---

## License

This project is proprietary and all rights are reserved. Unauthorized copying or distribution is prohibited.

</div>
