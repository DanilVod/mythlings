import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingTooltipProps {
  visible: boolean;
  onDismiss: () => void;
}

const ONBOARDING_KEY = '@mythlings:onboarding_completed';

export function OnboardingTooltip({
  visible,
  onDismiss,
}: OnboardingTooltipProps) {
  const { t } = useTranslation();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(20, { damping: 15, stiffness: 150 });
    }
  }, [visible]);

  const handleDismiss = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onDismiss();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.tooltip}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>👇</Text>
        </View>
        <View style={styles.arrow} />
        <View style={styles.content}>
          <Text style={styles.title}>{t('home.onboarding.title')}</Text>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            activeOpacity={0.7}>
            <Text style={styles.dismissText}>
              {t('home.onboarding.dismiss')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  tooltip: {
    alignItems: 'center',
  },
  emojiContainer: {
    marginBottom: 8,
  },
  emoji: {
    fontSize: 40,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 16,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    marginTop: -2,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxWidth: 280,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Bungee_400Regular',
  },
  dismissButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
  },
});
