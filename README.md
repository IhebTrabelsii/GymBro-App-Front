# GymBro

Professional fitness application built with Expo, React Native, and TypeScript. Features personalized workout plans, AI coaching, nutrition tracking, and admin tools.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

xx
GymBro is a cross-platform fitness application providing:

- Body-type specific workout plans (Ectomorph, Mesomorph, Endomorph)
- AI-powered fitness coaching
- Fitness calculator (BMI, BMR, TDEE)
- Nutrition and food database
- User profiles and progress tracking
- Premium subscription system
- Fitness news and articles
- Admin dashboard for content management

## Quick Start

### Prerequisites

- Node.js 16+ and npm or Yarn
- Expo CLI: `npm install -g expo-cli`
- Git

### Installation

```bash
git clone <your-repo-url>
cd GymBro
npm install
npm start
```

### Running on Platforms

```bash
# iOS (Mac only)
npm start -- --ios

# Android
npm start -- --android

# Web
npm run web
```

## Project Structure

```
GymBro/
├── app/
│   ├── _layout.tsx                 # Root layout
│   ├── +not-found.tsx              # 404 page
│   ├── change-password.tsx
│   ├── exercise-details.tsx
│   ├── forgot-password.tsx
│   ├── login.tsx
│   ├── privacy-settings.tsx
│   ├── reset-password.tsx
│   ├── (auth)/                     # Auth group
│   │   ├── forgot-password.tsx
│   │   ├── login.tsx
│   │   ├── reset-password.tsx
│   │   ├── signup.tsx
│   │   └── verify-email.tsx
│   ├── (tabs)/                     # Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── ai-coach.tsx           # AI coaching chatbot
│   │   ├── calculator.tsx         # Fitness calculator
│   │   ├── food.tsx               # Nutrition database
│   │   ├── index.tsx              # Home screen
│   │   └── workout.tsx            # Workout plans
│   ├── admin/                      # Admin panel
│   │   ├── dashboard.tsx
│   │   ├── users.tsx
│   │   └── workouts.tsx
│   ├── config/
│   │   └── plan.tsx               # Plan configuration
│   ├── premium/                    # Premium features
│   │   ├── index.tsx
│   │   └── premium.tsx
│   ├── profile/                    # User profile
│   │   ├── change-password.tsx
│   │   ├── edit-profile.tsx
│   │   ├── index.tsx
│   │   └── notification-settings.tsx
│   └── utils/
│       └── socialAuth.ts
├── assets/
│   ├── images/
│   └── fonts/
├── components/                     # Reusable components
│   ├── clock.tsx
│   ├── Collapsible.tsx
│   ├── ExternalLink.tsx
│   ├── HapticTab.tsx
│   ├── HelloWave.tsx
│   ├── ParallaxScrollView.tsx
│   ├── StripePayment.web.tsx
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   └── ui/
│       ├── IconSymbol.ios.tsx
│       ├── IconSymbol.tsx
│       ├── TabBarBackground.ios.tsx
│       └── TabBarBackground.tsx
├── constants/
│   └── Colors.ts                  # Theme colors
├── context/                        # React context
│   ├── SimpleThemeContext.tsx      # Theme management
│   └── ThemeContext.tsx
├── hooks/                          # Custom React hooks
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
├── scripts/
│   └── reset-project.js           # Project reset utility
├── app_backup/                     # Backup of previous version
├── .expo/                          # Expo configuration
├── .vscode/                        # VS Code settings
├── app.json                        # Expo config
├── package.json
├── tsconfig.json
├── eslint.config.js
└── README.md
```

## Features

### Workout System

- Body-type analysis (Ectomorph, Mesomorph, Endomorph)
- Personalized workout plans from API
- Detailed exercise instructions
- Progress tracking

### AI Coach

- Real-time fitness Q&A
- Workout recommendations
- Nutrition advice
- Message limits for free users
- Unlimited access for premium users

### Fitness Calculator

- BMI calculator
- BMR (Basal Metabolic Rate) calculation
- TDEE (Total Daily Energy Expenditure)
- Activity level customization

### Nutrition Database

- 50+ food items with macros
- Calorie tracking
- Category filtering
- Nutritional benefits display

### User System

- Registration and authentication
- Profile management
- Password reset
- Premium subscription (Monthly, Yearly, Lifetime)
- JWT token-based auth

### Premium Features

- Unlimited AI messages
- Exclusive workout videos
- Advanced analytics
- Early access to new features
- Priority support

### News Feed

- Latest fitness articles
- Categorized content (Nutrition, Workout, Science)
- Search functionality
- News filtering

### Admin Dashboard

- User management
- Workout plan CRUD
- Analytics and stats
- News management
- Role-based access control

## Tech Stack

### Frontend

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and services
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Screen navigation
- **Expo Router** - File-based routing

### Styling & Animations

- **React Native StyleSheet** - Component styling
- **Moti** - Animation library
- **React Native Reanimated** - Advanced animations
- **Expo Linear Gradient** - Gradient backgrounds

### State & Storage

- **AsyncStorage** - Local persistence
- **Context API** - Global state management
- **React Hooks** - State management

### Backend Integration

- **Fetch API** - HTTP requests
- **JWT Authentication** - Token-based auth
- **Node.js/Express** - Backend API (referenced)
- **MongoDB** - Database (referenced)

### Additional Tools

- **Stripe** - Payment processing
- **Expo Vector Icons** - Icon library
- **Expo AV** - Video playback
- **React Native Picker** - Dropdown selections

## Key Dependencies

```json
{
  "expo": "~54.0.30",
  "react": "^19.1.0",
  "react-native": "^0.81.5",
  "react-native-reanimated": "~4.1.1",
  "moti": "^0.30.0",
  "expo-router": "~6.0.21",
  "@stripe/stripe-react-native": "^0.58.0",
  "typescript": "^5.9.3"
}
```

## Development

### Available Scripts

```bash
# Start development server
npm start

# Run on web
npm run web

# Build for production
npm run build

# Lint code
npm run lint
```

### Code Structure Guidelines

- **Components**: Reusable UI components in `/components`
- **Screens**: Full-page screens in `/app`
- **Context**: Global state in `/context`
- **Hooks**: Custom hooks in `/hooks`
- **Constants**: Colors, strings in `/constants`
- **Utils**: Helper functions in `/app/utils`

### Theme System

The app uses a custom theme context (`SimpleThemeContext`) supporting:

- Light mode
- Dark mode
- Dynamic color schemes based on theme

Access theme in components:

```tsx
const { theme } = useSimpleTheme();
const currentColors = Colors[theme];
const isDark = theme === "dark";
```

## Contributing

### Getting Started

1. **Fork & Clone**

   ```bash
   git clone https://github.com/yourusername/GymBro.git
   cd GymBro
   npm install
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Make Changes**
   - Follow TypeScript and React best practices
   - Test on iOS, Android, and Web
   - Write clean, readable code
   - Add JSDoc comments for complex logic

4. **Commit & Push**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push origin feature/YourFeatureName
   ```

5. **Create Pull Request**
   - Provide clear description
   - Reference related issues
   - Wait for review

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `chore`

**Example**: `feat(workout): Add rest day tracking`

### Development Guidelines

- Follow existing code style
- Test on multiple platforms
- Update README for new features
- Optimize performance and bundle size
- Ensure accessibility
- Use TypeScript strictly

## API Integration

The app connects to a backend API at `http://192.168.100.143:3000`:

### Key Endpoints

```
POST /api/auth/register        - User registration
POST /api/auth/login           - User login
GET  /api/auth/verify          - Token verification
GET  /api/workouts             - Fetch workout plans
POST /api/ai/chat              - AI coaching messages
GET  /api/news                 - Fetch news articles
GET  /api/admin/dashboard      - Admin stats
```

## Environment Setup

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://192.168.100.143:3000
STRIPE_PUBLISHABLE_KEY=pk_test_...
JWT_SECRET=your_jwt_secret
```

## Performance Tips

- Use React.memo for heavy components
- Implement FlatList virtualization
- Offload animations to native thread (React Native Reanimated)
- Minimize AsyncStorage calls
- Lazy load images and assets

## Known Issues & TODOs

- [ ] Real-time notifications system
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Social sharing features
- [ ] Video tutorial library
- [ ] Community challenges

## License

This project is licensed under the **MIT License** - see the `LICENSE` file for details.

You are free to:

- Use for any purpose
- Modify and distribute
- Include in proprietary applications

Requirements:

- Include license and copyright notice

## Resources

**Documentation**

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [TypeScript Guide](https://www.typescriptlang.org/docs/)
- [Expo Router Guide](https://docs.expo.dev/routing/introduction/)

**Community & Support**

- [Expo Community Forums](https://forums.expo.dev)
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

**Tools**

- [VS Code](https://code.visualstudio.com/)
- [React Developer Tools](https://github.com/facebook/react-devtools)
- [Expo DevTools](https://github.com/expo/dev-plugins)

## Support & Contact

Have questions or need help?

- ** Found a Bug?** [Open an Issue](https://github.com/yourusername/GymBro/issues)
- ** Questions?** [Start a Discussion](https://github.com/yourusername/GymBro/discussions)
- ** Email** — support@gymbro.app
- ** Follow** — [@GymBroApp](https://twitter.com/gymbro)

## Contributors

Thank you to all contributors who help improve GymBro!

---

<div align="center">

### Made with 💪 by GymBro Team

**If you find GymBro helpful, please give us a star on GitHub!**

This helps grow the community and improve the app.

[⬆ Back to top](#-gymbro)

</div>
