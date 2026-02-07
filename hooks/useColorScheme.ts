    import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';

    let useTheme: any = null;

    try {
    const module = require('../context/ThemeContext');
    useTheme = module.useTheme;
    } catch (error) {
    console.log('ThemeContext not available');
    }

    export function useColorScheme(): NonNullable<ColorSchemeName> {
    const systemScheme = _useColorScheme();
    
    if (useTheme) {
        try {
        const themeContext = useTheme();
        if (themeContext && themeContext.currentTheme) {
            return themeContext.currentTheme;
        }
        } catch (error) {
        console.log('ThemeContext error, using system scheme');
        }
    }
    
    // Fallback to system scheme
    return systemScheme ?? 'light';
    }