import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  MythlingType,
  getMythlingScheme,
} from '@entities/mythling/model/types';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface GradientBackgroundProps {
  mythlingType?: MythlingType;
}

export function GradientBackground({ mythlingType }: GradientBackgroundProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const scheme = mythlingType ? getMythlingScheme(mythlingType) : null;
  const colors: [string, string, ...string[]] = scheme
    ? scheme.backgroundGradient
    : ['#9CA3AF', '#1E1B4B'];

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      <AnimatedLinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
