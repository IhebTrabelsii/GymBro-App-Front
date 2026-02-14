# <div align="center">💪 GymBro</div>

## <div align="center">Your Personal Fitness Companion</div>

<div align="center">

### A cutting-edge cross-platform fitness companion with personalized workout plans, intelligent calculators, and expert content to help you achieve your health goals.

---

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-54.0.30-000000?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue?style=for-the-badge)

---

[Features](#-key-features) • [Installation](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## ✨ Overview

**GymBro** is a comprehensive mobile fitness application designed to empower users to take control of their health journey. From beginners starting their first workout to experienced athletes optimizing their training, GymBro provides personalized tools, intelligent calculators, and curated content to help you succeed.

### 🌟 Why Choose GymBro?

| Feature                     | Benefit                                            |
| :-------------------------- | :------------------------------------------------- |
| 🎯 **Personalized Plans**   | Workout recommendations tailored to your body type |
| 📱 **Multi-Platform**       | Seamless experience across iOS, Android, and Web   |
| 🎨 **Beautiful UI**         | Modern design with smooth dark/light themes        |
| 🔒 **Secure & Private**     | JWT authentication with encrypted data storage     |
| ⚡ **High Performance**     | Optimized with React Native & Expo                 |
| 📊 **Advanced Calculators** | BMI, BMR, and TDEE for precision fitness tracking  |

---

## 🚀 Key Features

### 🏠 Dashboard & Home

Your personal fitness command center with real-time insights and quick access to all features.

- **Personalized Dashboard** — Real-time stats and quick insights at a glance
- **Smart Authentication** — Secure login/signup with social auth options
- **Theme Switching** — Seamless dark/light mode toggle
- **Quick Links** — Fast access to all major features
- **Digital Clock** — Live time display with modern UI

### 🏋️ Workout Planning

Personalized training programs tailored to your body type and fitness goals.

Discover your body type and unlock customized training:

- **Ectomorph** — Heavy weights + high-calorie diet strategy
- **Mesomorph** — Balanced strength and cardio training
- **Endomorph** — Cardio-focused with calorie management

Each plan includes:

- ✅ Progressive training recommendations
- ✅ Evidence-based guidance
- ✅ Customized approach per body type
- ✅ Flexible weekly schedules

### 📊 Fitness Calculators

Professional-grade calculation tools for precision fitness tracking.

| Calculator | Purpose                                  |
| :--------- | :--------------------------------------- |
| **BMI**    | Track and assess healthy weight range    |
| **BMR**    | Calculate daily calorie needs at rest    |
| **TDEE**   | Determine total daily energy expenditure |

**Features:** Activity level tracking • Historical data • Visual progress metrics

### 🍎 Nutrition Tracker

Complete nutrition management and meal planning.

- Food logging and calorie tracking
- Macronutrient breakdown (protein, carbs, fats)
- Personalized nutrition recommendations
- Daily intake monitoring

### 📰 News & Content Hub

Stay informed with curated fitness articles and expert wellness advice.

- Curated fitness articles and trends
- Science-backed training tips
- Latest health and wellness updates
- Expert wellness content from professionals

### 🤖 AI Coach

Intelligent coaching powered by advanced algorithms.

- Personalized training recommendations
- Real-time feedback and guidance
- Adaptive workout adjustments
- Progress-based coaching

### 👨‍💼 Admin Panel

Complete administrative control over your application.

- Exclusive admin authentication
- User & content management
- Analytics dashboard
- System monitoring & controls

---

## 🎯 Quick Start

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** 16+ & npm/yarn
- **Expo CLI** — `npm install -g expo-cli`
- **Git** — for version control
- **iOS Development** — Xcode 14+ (macOS only)
- **Android Development** — Android Studio with SDK
- **Code Editor** — VS Code or similar (optional)

### Installation & Setup

Follow these steps to get GymBro running on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/GymBro.git
cd GymBro

# 2. Install dependencies
npm install

# 3. Start the development server
npm start

# 4. Run on your platform
# Select one of the following in the terminal:
#   i = iOS  |  a = Android  |  w = Web
```

### Platform-Specific Setup

#### iOS (macOS only)

```bash
cd ios && pod install && cd ..
npm start
# Press 'i' to open on iOS
```

#### Android

```bash
npm start
# Press 'a' to open on Android Emulator
```

#### Web

```bash
npm run web
# Opens at http://localhost:19000
```

---

## 📂 Project Architecture

```
GymBro/
├── 📁 app/                         # Expo Router navigation framework
│   ├── _layout.tsx                # Root layout & global setup
│   ├── landing.tsx                # Landing/splash screen
│   ├── 📁 (tabs)/                 # Tab navigation layout
│   │   ├── _layout.tsx            # Tab navigation wrapper
│   │   ├── index.tsx              # 🏠 Home Dashboard
│   │   ├── workout.tsx            # 🏋️ Workout Planning
│   │   ├── calculator.tsx         # 📊 Fitness Calculators
│   │   ├── food.tsx               # 🍎 Nutrition Tracker
│   │   ├── ai-coach.tsx           # 🤖 AI Coach
│   │   └── news.tsx.bak             # 📰 News Hub(unused)
│   │
│   ├── 📁 admin/                  # Admin portal section
│   │   ├── dashboard.tsx          # Admin dashboard
│   │   ├── login.tsx              # Admin authentication
│   │   ├── users.tsx              # User management
│   │   └── workouts.tsx           # Workout management
│   │
│   ├── login.tsx                  # User login screen
│   ├── signup.tsx                 # User registration
│   ├── profile.tsx                # User profile management
│   ├── edit-profile.tsx           # Profile editing
│   ├── premium.tsx                # Premium subscription
│   ├── plan.tsx                   # Workout plan selection
│   ├── change-password.tsx        # Password management
│   ├── verify-email.tsx           # Email verification
│   ├── notification-settings.tsx  # Notification preferences
│   ├── privacy-settings.tsx       # Privacy controls
│   ├── support.tsx                # Support/help section
│   └── +not-found.tsx             # 404 page
│
├── 📁 components/                 # Reusable UI components
│   ├── ThemedText.tsx             # Theme-aware text component
│   ├── ThemedView.tsx             # Theme-aware view component
│   ├── clock.tsx                  # Digital clock display
│   ├── Collapsible.tsx            # Expandable component
│   ├── ExternalLink.tsx           # External link handler
│   ├── HapticTab.tsx              # Touch feedback tab
│   ├── HelloWave.tsx              # Animated wave component
│   ├── ParallaxScrollView.tsx     # Parallax scrolling view
│   ├── StripePayment.web.tsx      # Payment processing
│   └── 📁 ui/                     # UI component library
│       ├── IconSymbol.tsx         # Icon component
│       └── TabBarBackground.tsx   # Tab bar styling
│
├── 📁 context/                    # React Context providers
│   ├── ThemeContext.tsx           # Theme state management
│   └── SimpleThemeContext.tsx     # Simplified theme provider
│
├── 📁 hooks/                      # Custom React Hooks
│   ├── useColorScheme.ts          # Device color scheme detection
│   ├── useColorScheme.web.ts      # Web-specific color detection
│   └── useThemeColor.ts           # Theme color helper
│
├── 📁 constants/                  # Application constants
│   └── Colors.ts                  # Color palette definitions
│
├── 📁 assets/                     # Static assets
│   ├── 📁 images/                 # Icons, logos, and images
│   └── 📁 fonts/                  # Custom typography fonts
│
├── 🔧 Configuration Files
│   ├── app.json                   # Expo configuration
│   ├── package.json               # NPM dependencies
│   ├── tsconfig.json              # TypeScript configuration
│   ├── eslint.config.js           # ESLint rules
│   ├── webpack.config.js          # Webpack configuration
│   └── expo-env.d.ts              # Expo type definitions
│
└── 📄 README.md                   # Project documentation
```

---

## 🛠️ Tech Stack

Our modern technology architecture ensures high performance, scalability, and an excellent developer experience.

### Core Technologies

| Category         | Technology              | Version |
| :--------------- | :---------------------- | :------ |
| **Framework**    | React Native            | 0.81.5  |
| **Platform**     | Expo                    | 54.0.30 |
| **Router**       | Expo Router             | 6.0.21  |
| **UI Library**   | React                   | 19.1.0  |
| **Language**     | TypeScript              | 5.9.3   |
| **Animations**   | React Native Reanimated | 4.1.1   |
| **State Mgmt**   | React Context API       | Native  |
| **Storage**      | AsyncStorage            | 2.2.0   |
| **Auth**         | JWT Decode              | 4.0.0   |
| **Icons**        | Expo Vector Icons       | 15.0.3  |
| **Payments**     | Stripe React Native     | 0.58.0  |
| **Bundler**      | Metro / Webpack         | Latest  |
| **Code Quality** | ESLint & TypeScript     | Latest  |

### Key Dependencies

- **expo-linear-gradient** — Gradient UI elements
- **expo-blur** — Blur effects
- **react-native-gesture-handler** — Gesture recognition
- **react-native-screens** — Native screen optimization
- **bcryptjs** — Password hashing
- **mongoose** — Database modeling
- **dotenv** — Environment configuration
- **express** — Backend API

---

## 🔐 Security & Best Practices

### Authentication & Data Protection

- ✅ **JWT Authentication** — Secure token-based user authentication
- ✅ **Password Encryption** — bcryptjs for secure password hashing
- ✅ **AsyncStorage** — Encrypted local data persistence
- ✅ **Admin Controls** — Separate authentication layer for admin access
- ✅ **Session Management** — Automatic token validation and refresh
- ✅ **HTTPS Ready** — Built for secure API communication

### Theme System

Implement consistent theming across your entire application:

```typescript
// Use theme colors easily throughout your app
import { useThemeColor } from '@/hooks/useThemeColor';

export function MyComponent() {
  const textColor = useThemeColor(
    { light: "#000", dark: "#fff" },
    "text"
  );

  return <Text style={{ color: textColor }}>Hello World</Text>;
}
```

---

## � NPM Scripts

Quick reference for common development commands:

```bash
npm start              # Start development server (recommended for first-time)
npm run web           # Start web development server
npm run lint          # Run ESLint code quality checks
npm test              # Run test suite (if available)
```

### Dev Workflow

```bash
# Start with expo go
npm start

# In another terminal, clear cache if needed
npm start -- --clear

# Run specific platform
npm start -- --ios
npm start -- --android
```

---

## 🐛 Troubleshooting

Common issues and their solutions:

| Issue                           | Solution                                              |
| :------------------------------ | :---------------------------------------------------- |
| **Module not found error**      | Run `npm install` and `expo prebuild --clean`         |
| **iOS build fails**             | `cd ios && rm -rf Pods && pod install && cd ..`       |
| **AsyncStorage not persisting** | Check file permissions in `app.json`                  |
| **Android build issues**        | Run `cd android && ./gradlew clean && cd ..`          |
| **Theme not updating**          | Ensure components use `useThemeColor()` hook properly |
| **Blank white screen**          | Clear cache: `npm start -- --clear`                   |
| **Port already in use**         | Kill process or use `npm start -- --port 19001`       |
| **TypeScript errors**           | Run `tsc --noEmit` to check all files                 |

### Getting Help

If issues persist:

1. Check the [Expo Documentation](https://docs.expo.dev)
2. Review React Native [troubleshooting guide](https://reactnative.dev/docs/troubleshooting)
3. Search GitHub issues in this repository
4. Check Discord or community forums

---

## ❓ FAQ

| Question                   | Answer                                                  |
| :------------------------- | :------------------------------------------------------ |
| **Works offline?**         | Yes! All data stored locally with AsyncStorage          |
| **Supported devices?**     | iOS 13+ and Android 5.0+                                |
| **Content updates?**       | Admin team regularly adds new articles & training plans |
| **Data security?**         | JWT tokens + secure encrypted local storage             |
| **Password reset?**        | Available on login screen with email verification       |
| **Data export?**           | Planned for future releases                             |
| **Free or paid?**          | Free with optional premium features                     |
| **Can I use on web?**      | Yes! Full web support with `npm run web`                |
| **Dark mode support?**     | Yes! Automatic based on device settings                 |
| **Multi-account support?** | Yes! Multiple user accounts can use the app             |

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Getting Started with Development

1. **Fork & Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/GymBro.git
   cd GymBro
   npm install
   npm start
   ```

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   # or for bug fixes: git checkout -b fix/BugName
   ```

3. **Make Your Changes**
   - Follow the existing code style and conventions
   - Write clean, readable TypeScript code
   - Add meaningful comments for complex logic
   - Test your changes on multiple platforms (iOS, Android, Web)

4. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "feat: Add description of your changes"
   # Use conventional commits: feat|fix|docs|style|refactor|perf|test|chore
   ```

5. **Push to Your Fork**

   ```bash
   git push origin feature/YourFeatureName
   ```

6. **Create a Pull Request**
   - Go to GitHub and create a pull request
   - Provide a clear description of your changes
   - Reference any related issues
   - Wait for review and feedback

### Development Guidelines

- **Code Style**: Follow TypeScript and React best practices
- **Testing**: Test your code on iOS, Android, and Web before submitting
- **Documentation**: Update README if you add new features
- **Comments**: Add JSDoc comments for complex functions
- **Performance**: Avoid unnecessary re-renders and optimize bundle size
- **Accessibility**: Ensure components are accessible to all users

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, perf, test, ci, build, chore

**Example**: `feat(workout): Add rest day tracking feature`

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to:

- ✅ Use this software for any purpose
- ✅ Modify and distribute the software
- ✅ Include it in proprietary applications

With the requirement to:

- ⚠️ Include a copy of the license and copyright notice

---

## 🔗 Important Resources

**Documentation & Guides**

- [Expo Documentation](https://docs.expo.dev) — Official Expo framework docs
- [React Native Docs](https://reactnative.dev) — React Native official guide
- [TypeScript Guide](https://www.typescriptlang.org/docs/) — TypeScript handbook
- [Expo Router Guide](https://docs.expo.dev/routing/introduction/) — File-based routing

**Community & Support**

- [Expo Community Forums](https://forums.expo.dev)
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

**Tools & Extensions**

- [VS Code](https://code.visualstudio.com/) — Code editor
- [React Developer Tools](https://github.com/facebook/react-devtools) — DevTools
- [Expo DevTools](https://github.com/expo/dev-plugins) — Dev plugins

---

## 📞 Support & Contact

Have questions or need help? We're here to assist!

- **🐛 Found a Bug?** [Open an Issue](https://github.com/yourusername/GymBro/issues)
- **💬 Have a Question?** [Start a Discussion](https://github.com/yourusername/GymBro/discussions)
- **📧 Email Support** — support@gymbro.app
- **🐦 Follow Us** — [@GymBroApp](https://twitter.com/gymbro)

---

## 🌟 Contributors

Thank you to all the amazing contributors who have helped make GymBro better!

<!-- Contributors list will be auto-generated -->

---

<div align="center">

### Made with 💪 by GymBro Team

**If you find GymBro helpful, please give us a ⭐ on GitHub!**

This helps us grow the community and continue improving the app.

---

[⬆ Back to top](#-gymbro)

</div>
