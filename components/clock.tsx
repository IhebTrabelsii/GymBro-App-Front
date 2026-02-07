import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function Clock({
  style,
  timeStyle,
  locale,
  options,
}: {
  style?: any;
  timeStyle?: any;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString(locale ?? undefined, options ?? { hour: 'numeric', minute: 'numeric', second: 'numeric' })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString(locale ?? undefined, options ?? { hour: 'numeric', minute: 'numeric', second: 'numeric' }));
    }, 1000);
    return () => clearInterval(id);
  }, [locale, JSON.stringify(options)]);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.timeText, timeStyle]}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#39FF14',
  },
});