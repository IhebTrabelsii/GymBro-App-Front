import { Colors } from '../constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type Theme = 'light' | 'dark';
type ColorKeys = keyof typeof Colors.light;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorKeys
) {
  const theme = useColorScheme() as Theme;
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}