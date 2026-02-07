# 💪 GymBro - Your Personal Fitness Companion

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-54.0.30-000000?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)

A cutting-edge mobile fitness application designed to help users achieve their gym goals with personalized workout plans, fitness calculators, and expert fitness content.

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Overview

**GymBro** is a comprehensive fitness platform that combines workout planning, personal metrics tracking, and fitness education. Whether you're a beginner or an experienced athlete, GymBro provides the tools you need to transform your fitness journey.

Built with **React Native** and **Expo**, GymBro delivers a seamless experience across iOS, Android, and Web platforms with a modern, responsive UI and dark mode support.

---

## ✨ Features

### 🏠 **Dashboard & Home**

- User authentication and profile management
- Personalized home screen with quick stats
- Real-time digital clock
- Dark/Light theme support

### 🏋️ **Workout Planning**

- **Body Type Analysis**: Identify your body type (Ectomorph, Mesomorph, Endomorph)
- **Customized Plans**: Get workout recommendations based on your body composition
- **Training Strategies**: Detailed guidance for each body type
  - Ectomorph: Heavy weights + High carbs
  - Mesomorph: Balanced strength and cardio
  - Endomorph: Cardio-focused with calorie control

### 📊 **Fitness Calculator**

- **BMI Calculator**: Calculate and track your Body Mass Index
- **BMR Calculator**: Determine your Basal Metabolic Rate
- **TDEE Calculator**: Calculate Total Daily Energy Expenditure based on activity level
- **Personalized Input**: Age, Gender, Weight, Height, Activity Level

### 📰 **Fitness News & Education**

- Latest fitness trends and tips
- Expert articles and information
- Updated content regularly

### 👥 **Admin Dashboard**

- Admin authentication
- Dashboard management
- Content monitoring

### ⚙️ **Additional Features**

- User authentication (Login/Signup)
- Secure token management
- Async data storage with AsyncStorage
- Support and help section
- Responsive design across all devices
- Smooth animations and transitions

---

## 🎯 Demo

| Home      | Workout Planning | Calculator      |
| --------- | ---------------- | --------------- |
| ![Home]() | ![Workout]()     | ![Calculator]() |

---

## 🚀 Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: macOS with Xcode (for iOS development)
- Android: Android Studio and SDK

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/GymBro.git
   cd GymBro
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**

   ```bash
   npm start
   # or
   expo start --clear
   ```

4. **Run on your preferred platform**
   - **iOS**: Press `i` in the terminal
   - **Android**: Press `a` in the terminal
   - **Web**: Press `w` in the terminal

---

## 🏗️ Architecture

### Project Structure

```
GymBro/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation routes
│   │   ├── index.tsx             # Home/Dashboard
│   │   ├── workout.tsx           # Workout planning
│   │   ├── calculator.tsx        # Fitness calculator
│   │   ├── news.tsx              # Fitness news
│   │   └── _layout.tsx           # Tab layout
│   ├── admin/                    # Admin pages
│   │   ├── dashboard.tsx         # Admin dashboard
│   │   └── login.tsx             # Admin login
│   ├── login.tsx                 # User login
│   ├── signup.tsx                # User registration
│   ├── plan.tsx                  # Workout plans
│   ├── support.tsx               # Support page
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx            # 404 page
│
├── components/                   # Reusable components
│   ├── ThemedText.tsx            # Theme-aware text
│   ├── ThemedView.tsx            # Theme-aware view
│   ├── ParallaxScrollView.tsx    # Parallax scroll
│   ├── clock.tsx                 # Digital clock
│   └── ui/                       # UI components
│
├── context/                      # React Context
│   ├── SimpleThemeContext.tsx    # Theme management
│   └── ThemeContext.tsx          # Extended theme
│
├── hooks/                        # Custom React hooks
│   ├── useColorScheme.ts         # Color scheme detection
│   └── useThemeColor.ts          # Theme color hook
│
├── constants/                    # App constants
│   └── Colors.ts                 # Color definitions
│
├── assets/                       # Static assets
│   ├── images/                   # App images
│   └── fonts/                    # Custom fonts
│
├── app.json                      # Expo config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── webpack.config.js             # Web build config
```

### Navigation Flow

```
Root (Auth Check)
├── LoginScreen
├── SignUpScreen
├── TabNavigator
│   ├── Home (Dashboard)
│   ├── Workout Planning
│   ├── Calculator
│   └── News
├── PlanScreen
├── SupportScreen
└── AdminStack
    ├── AdminLogin
    └── AdminDashboard
```

---

## 🛠️ Tech Stack

### Frontend Framework

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **Expo Router** - File-based routing (v6)
- **React 19** - Latest React features
- **TypeScript** - Type-safe development

### UI & Animations

- **React Native Reanimated** - Advanced animations (v4.1)
- **React Native Gesture Handler** - Gesture recognition
- **Expo Linear Gradient** - Gradient effects
- **Expo Vector Icons** - Icon library
- **React Native Safe Area Context** - Safe area handling
- **React Native Screens** - Native navigation

### State Management & Storage

- **React Context API** - Global theme management
- **Async Storage** - Local data persistence

### Utilities

- **JWT Decode** - JWT token parsing
- **React Native Worklets** - High-performance operations (v0.5.1)
- **React Native Worklets Core** (v1.6.2)

### Development Tools

- **TypeScript** (5.9.3) - Type safety
- **Babel** (7.27.4) - Code transpilation
- **ESLint** - Code quality

---

## 📱 Supported Platforms

| Platform    | Support | Details                           |
| ----------- | ------- | --------------------------------- |
| **iOS**     | ✅ Full | iOS 13+ with tab bar optimization |
| **Android** | ✅ Full | Android 5+, Edge-to-edge enabled  |
| **Web**     | ✅ Full | Responsive design, Metro bundler  |

---

## 🔐 Authentication

GymBro implements secure authentication with:

- JWT token management
- AsyncStorage for token persistence
- Automatic session validation
- Separate admin authentication
- Secure user credentials handling

---

## 🎨 Theming

The app features a comprehensive theming system:

- **Dark Mode** - Eye-friendly dark interface
- **Light Mode** - Bright, clean interface
- **Context-based**: Easy theme switching across all components
- **Color Scheme**: Automatic detection of system preferences

---

## 📝 Scripts

```bash
# Start development server
npm start

# Start web version
npm run web

# Build for production
npm run build

# Run type checking
tsc --noEmit

# Lint code
npx eslint .
```

---

## 🚀 Getting Started with Development

### Setting Up Your Environment

```bash
# Install Node.js dependencies
npm install

# For iOS development (macOS only)
cd ios
pod install
cd ..

# Start the development server
npm start
```

### Hot Reload

Both Fast Refresh and native module hot loading are enabled by default in Expo. Simply save your files and see the changes instantly!

### Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Web
npm run web
```

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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
