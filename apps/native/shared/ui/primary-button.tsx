import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedButton } from './animated-button';

const AnimatedView = Animated.createAnimatedComponent(View);

export function PrimaryButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 600 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <AnimatedButton
        onPress={onPress}
        style={styles.button}
        textStyle={styles.text}>
        {t('startScreen.beginJourney').toUpperCase()}
      </AnimatedButton>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#4338CA',
    backgroundColor: '#6366F1',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
