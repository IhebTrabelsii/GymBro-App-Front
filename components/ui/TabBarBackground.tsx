// components/ui/TabBarBackground.tsx
import React from 'react';
import { View } from 'react-native';

export default function TabBarBackground({ style }: { style?: any }) {
  return <View style={[{ flex: 1, backgroundColor: '#ffffff' }, style]} />;
}
