# 💪 GymBro - Your Personal Fitness Companion

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-54.0.30-000000?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue?style=for-the-badge)

A cutting-edge mobile fitness application designed to help users achieve their gym goals with personalized workout plans, intelligent fitness calculators, and expert fitness content.

[Quick Start](#-quick-start) • [Features](#-features) • [Installation](#-installation) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

**GymBro** is a comprehensive, cross-platform fitness companion that empowers users to take control of their health and fitness journey. Whether you're a beginner starting your first workout or an experienced athlete looking to optimize your training, GymBro provides personalized tools, intelligent calculators, and curated fitness content to help you achieve your goals.

### Why GymBro?

- 🎯 **Personalized**: Get workout recommendations tailored to your body type
- 📱 **Cross-Platform**: Seamless experience on iOS, Android, and Web
- 🎨 **Modern UI**: Beautiful dark/light theme with smooth animations
- 🔒 **Secure**: Token-based authentication with secure data storage
- ⚡ **Fast**: Built with React Native and Expo for optimal performance

---

## ✨ Features

### 🏠 **Dashboard & Home**

- User authentication with secure login and signup
- Personalized home screen with quick stats and insights
- Real-time digital clock display
- Seamless dark/light theme switching
- Quick navigation to all major features

### 🏋️ **Workout Planning**

- **Body Type Analysis**: Identify your body type
  - Ectomorph
  - Mesomorph
  - Endomorph
- **Customized Plans**: Personalized workout recommendations based on body composition
- **Training Strategies**: Detailed, evidence-based guidance for each body type
  - Ectomorph: Heavy weights + High carb diet strategy
  - Mesomorph: Balanced strength training and cardio
  - Endomorph: Cardio-focused routines with calorie management
- Progressive training recommendations

### 📊 **Fitness Calculator**

- **BMI Calculator**: Track and understand your Body Mass Index
- **BMR Calculator**: Calculate Basal Metabolic Rate for personalized nutrition
- **TDEE Calculator**: Determine Total Daily Energy Expenditure based on activity levels
- **Smart Inputs**: Age, Gender, Weight, Height, Activity Level
- Historical tracking and progress metrics

### 📰 **Fitness News & Education**

- Curated fitness trends and expert tips
- Latest health and wellness articles
- Science-backed fitness information
- Regular content updates
- Educational resources for fitness enthusiasts

### 🍎 **Nutrition Tracking**

- Food logging and tracking
- Macronutrient breakdown
- Calorie management tools
- Personalized nutrition recommendations

### 👥 **Admin Dashboard**

- Admin authentication portal
- Content management system
- User management capabilities
- Analytics and monitoring tools
- Content approval workflows

### ⚙️ **Additional Features**

- Secure JWT-based authentication
- AsyncStorage for persistent data management
- Smooth animations and transitions using Moti
- Responsive design optimized for all device sizes
- Haptic feedback for better user experience
- Support and help section with FAQs

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm/yarn
- **Expo CLI**: `npm install -g expo-cli`
- **iOS**: macOS with Xcode 14+ (for iOS development)
- **Android**: Android Studio with SDK (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/GymBro.git
   cd GymBro
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or with yarn
   yarn install
   ```

3. **Start the development server**

   ```bash
   npm start
   # or
   expo start --clear
   ```

4. **Run on your platform**

   ```bash
   # iOS (requires macOS)
   i

   # Android
   a

   # Web
   w
   ```

---

## 📱 Platform Setup

### iOS Development

```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npm start
# Then press 'i'

# Build with EAS
eas build --platform ios
```

### Android Development

```bash
# Run on Android emulator
npm start
# Then press 'a'

# Build with EAS
eas build --platform android
```

### Web Development

```bash
npm run web
# or
npm start
# Then press 'w'
```

---

## 🏗️ Project Architecture

### Directory Structure

```
GymBro/
├── app/                          # Expo Router - File-based routing
│   ├── _layout.tsx              # Root layout & navigation setup
│   ├── landing.tsx              # Splash/loading screen
│   ├── login.tsx                # User login page
│   ├── signup.tsx               # User registration page
│   ├── plan.tsx                 # Fitness plans page
│   ├── support.tsx              # Support & help section
│   ├── +not-found.tsx           # 404 page
│   ├── (tabs)/                  # Tab-based navigation routes
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Home/Dashboard
│   │   ├── workout.tsx          # Workout planning
│   │   ├── calculator.tsx       # Fitness calculator
│   │   ├── food.tsx             # Nutrition tracking
│   │   └── news.tsx             # Fitness news & articles
│   └── admin/                   # Admin portal
│       ├── login.tsx            # Admin authentication
│       └── dashboard.tsx        # Admin dashboard
│
├── components/                  # Reusable React components
│   ├── ThemedText.tsx           # Theme-aware text component
│   ├── ThemedView.tsx           # Theme-aware view component
│   ├── ParallaxScrollView.tsx   # Parallax scrolling container
│   ├── ExternalLink.tsx         # External links
│   ├── Collapsible.tsx          # Collapsible section component
│   ├── HapticTab.tsx            # Haptic feedback tab
│   ├── HelloWave.tsx            # Animated wave component
│   ├── clock.tsx                # Digital clock display
│   └── ui/                      # UI-specific components
│       ├── IconSymbol.tsx       # Icon symbol
│       ├── TabBarBackground.tsx # Tab bar styling
│       └── ...
│
├── context/                     # React Context providers
│   ├── ThemeContext.tsx         # Dark/Light theme context
│   └── SimpleThemeContext.tsx   # Simplified theme context
│
├── hooks/                       # Custom React hooks
│   ├── useColorScheme.ts        # Device color scheme detection
│   ├── useColorScheme.web.ts    # Web-specific color scheme
│   └── useThemeColor.ts         # Theme color access hook
│
├── constants/                   # Application constants
│   └── Colors.ts                # Color palette definitions
│
├── assets/                      # Static assets
│   ├── images/                  # App images & icons
│   │   ├── icon.png             # App icon
│   │   ├── adaptive-icon.png    # Android adaptive icon
│   │   └── favicon.png          # Web favicon
│   └── fonts/                   # Custom fonts
│
├── scripts/                     # Utility scripts
│   └── reset-project.js         # Project reset utility
│
├── app.json                     # Expo configuration
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── webpack.config.js            # Web build configuration
├── eslint.config.js            # ESLint configuration
└── README.md                    # This file
```

### Data Flow

```
┌─────────────────────────────────────┐
│         User Interface              │
│  (Screens & Components)             │
└──────────────────┬──────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  React Context API   │
        │  (Theme, Auth Data)  │
        └─────────┬────────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │   AsyncStorage       │
        │   (Persistent Data)  │
        └──────────────────────┘
```

---

## 🛠️ Technology Stack

### Core

- **React Native** 0.81.5 - Cross-platform mobile framework
- **Expo** 54.0.30 - Development platform and cloud build service
- **Expo Router** 6.0.21 - File-based routing system
- **React** 19.1.0 - UI library
- **TypeScript** 5.9.3 - Type-safe JavaScript

### Animations & UI

- **React Native Reanimated** 4.1.1 - Advanced animations
- **React Native Gesture Handler** 2.28 - Gesture recognition
- **Moti** 0.30.0 - Animation library
- **Expo Linear Gradient** 15.0.8 - Gradient backgrounds
- **Expo Blur** 15.0.8 - Blur effects

### Navigation & State

- **React Native Screens** 4.16 - Native screen management
- **React Context API** - State management
- **React Native Safe Area Context** 5.6.2 - Safe area handling

### Storage & Authentication

- **AsyncStorage** 2.2.0 - Local data persistence
- **JWT Decode** 4.0.0 - Token decoding

### Utilities

- **React Native Worklets** 0.5.1 - High-performance operations
- **Expo Vector Icons** 15.0.3 - Icon library
- **React Native Picker** 2.11.1 - Picker component

### Development

- **Babel** 7.27.4 - Code transpilation
- **Webpack** 5+ - Module bundling
- **ESLint** - Code linting

---

## 📖 Features in Detail

### Home Dashboard

- Real-time digital clock
- Quick statistic overview
- Personalized fitness recommendations
- Quick action buttons for all features

### Workout Module

Identify your body type and get tailored workout plans:

#### Body Types

- **Ectomorph**: Naturally lean, fast metabolism
  - Focus: High-intensity strength training
  - Diet: High calories, high protein
  - Frequency: 4-5 days/week

- **Mesomorph**: Athletic, balanced metabolism
  - Focus: Strength and hypertrophy training
  - Diet: Balanced macros
  - Frequency: 5-6 days/week

- **Endomorph**: Stocky build, slow metabolism
  - Focus: High-intensity cardio with strength
  - Diet: Lower calories, controlled carbs
  - Frequency: 6 days/week with cardio emphasis

### Fitness Calculators

- **BMI (Body Mass Index)**: Assess healthy weight range
- **BMR (Basal Metabolic Rate)**: Daily calorie needs at rest
- **TDEE (Total Daily Energy Expenditure)**: Overall daily calorie needs based on activity level

### Nutrition Tracker

- Log daily food intake
- Track macronutrients (proteins, carbs, fats)
- Calorie counting and monitoring
- Personalized nutrition recommendations

### News & Education Hub

- Latest fitness articles
- Training tips and tricks
- Nutrition guides
- Science-backed information

### Admin Panel

- User management
- Content creation and editing
- Analytics dashboard
- System monitoring

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **AsyncStorage Encryption**: Secure local data storage
- **Admin-Only Access**: Separate admin authentication layer
- **Session Management**: Automatic token validation
- **HTTPS**: Secure API communication (production)

---

## 🎨 Theming System

The app includes a robust theming system:

```typescript
// Access theme colors anywhere
const colors = useThemeColor();

// Available colors
{
  light: { primary, background, tint, ... },
  dark: { primary, background, tint, ... }
}
```

Features:

- Automatic system theme detection
- Manual theme switching
- Smooth transitions
- Full component consistency

---

## 📝 Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run web           # Start web development server

# Building
npm run build         # Build for production
eas build             # Cloud build for all platforms

# Quality
npm run lint          # Check code quality
npm run type-check    # Run TypeScript type checking

# Utilities
npm run reset-project # Reset project to initial state
```

---

## 🧪 Development Best Practices

### Hot Reloading

Both Fast Refresh and full app reloading are enabled:

```bash
npm start
# Save files to see changes instantly
```

### Debugging

```bash
# Enable remote debugging
npm start
# Press 'j' for debugger menu
```

### Type Checking

Ensure type safety throughout development:

```bash
tsc --noEmit      # Check for type errors
npm run lint      # Run ESLint
```

---

## 📊 Performance Optimization

- React Native Worklets for heavy computations
- Memoization of expensive components
- Lazy loading of routes
- Optimized animations with Reanimated
- Efficient local storage queries

---

## 🐛 Troubleshooting

### Common Issues

**Problem**: `Module not found` after npm install

```bash
# Solution
npm install
expo prebuild --clean
npm start --clear
```

**Problem**: iOS build fails

```bash
# Solution
cd ios && rm -rf Pods && pod install && cd ..
npm start
```

**Problem**: AsyncStorage not persisting data

```bash
# Ensure you're not in development mode reload
# Check AsyncStorage permissions in app.json
```

**Problem**: Theme not updating across all screens

```typescript
// Ensure component uses useThemeColor() hook
import { useThemeColor } from "@/hooks/useThemeColor";
const color = useThemeColor({ light: "#000", dark: "#fff" }, "text");
```

**Problem**: Android build issues

```bash
# Clear Android build cache
cd android && ./gradlew clean && cd ..
npm start
```

---

## ❓ FAQ

**Q: Does GymBro work offline?**
A: Yes! All user data is stored locally with AsyncStorage and works offline.

**Q: Can I use GymBro on my older device?**
A: iOS 13+ and Android 5+ are supported.

**Q: How often is fitness content updated?**
A: The admin team regularly updates articles and training information.

**Q: Is my data secure?**
A: Yes, we use JWT tokens and secure local storage with encryption.

**Q: Can I export my fitness data?**
A: This feature is in development for future releases.

**Q: What if I forget my password?**
A: Use the password reset option on the login screen.

---

## 🤝 Contributing

We appreciate your interest in contributing to GymBro! Here's how you can help:

### Getting Started

1. **Fork the repository**

   ```bash
   git clone https://github.com/yourusername/GymBro.git
   cd GymBro
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow TypeScript best practices
   - Add comments for complex logic
   - Test on multiple platforms

4. **Commit your changes**

   ```bash
   git add .
   git commit -m 'Add AmazingFeature'
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Create a Pull Request**
   - Describe your changes clearly
   - Link to relevant issues
   - Include testing details

### Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Respect the project's architecture

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

Permission is granted to use, modify, and distribute the software freely, with the only requirement being attribution.

---

## 👥 Authors & Acknowledgments

- **Development Team**: GymBro Contributors
- **Framework**: [Expo](https://expo.dev)
- **Community**: Thanks to all contributors and users

---

## 🔗 Useful Links

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [TypeScript Guide](https://www.typescriptlang.org/docs/)
- [Expo Router Guide](https://docs.expo.dev/routing/introduction/)

---

## 📞 Support

For issues, questions, or suggestions:

- **GitHub Issues**: [Report a bug](https://github.com/yourusername/GymBro/issues)
- **Discussions**: [Ask questions](https://github.com/yourusername/GymBro/discussions)
- **Email**: support@gymbro.app
- **Support Page**: In-app support section

---

<div align="center">

### Made with ❤️ by GymBro Team

⭐ If you find this project helpful, please consider giving it a star!

[⬆ Back to top](#-gymbro---your-personal-fitness-companion)

</div>

---

## 📄 License

This project is private. All rights reserved.

---

## 👨‍💻 Author

**GymBro Development Team**

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - The world's fastest way to build apps
- [React Native](https://reactnative.dev/) - Learn once, write anywhere
- [React Router](https://expo.github.io/router/) - File-based routing
- [Expo Vector Icons](https://icons.expo.fyi/) - Vector icon library

---

## 💬 Support

For support, email support@gymbro.app or create an issue in the repository.

---

<div align="center">

**Made with 💪 by the GymBro Team**

[⬆ back to top](#-gymbro---your-personal-fitness-companion)

</div>
