declare module 'expo-linear-gradient' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';
  
  export interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
  }
  
  export class LinearGradient extends Component<LinearGradientProps> {}
}

declare module 'expo-blur' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';
  
  export type BlurTint = 'light' | 'dark' | 'default';
  
  export interface BlurViewProps extends ViewProps {
    intensity?: number;
    tint?: BlurTint;
  }
  
  export class BlurView extends Component<BlurViewProps> {}
}
