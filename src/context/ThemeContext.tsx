import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('auto');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (theme === 'auto') {
      setCurrentTheme(systemColorScheme || 'light');
    } else {
      setCurrentTheme(theme);
    }
  }, [theme, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app-theme');
      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('app-theme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    handleSetTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      currentTheme, 
      toggleTheme, 
      setTheme: handleSetTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    console.warn('useTheme used outside ThemeProvider - returning default');
    return {
      theme: 'auto' as Theme,
      currentTheme: 'light' as 'light' | 'dark',
      toggleTheme: () => {
        console.log('Theme toggle not available');
      },
      setTheme: () => {
        console.log('Theme set not available');
      },
    };
  }
  
  return context;
}