import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import ChestIcon from '../../../assets/icons/chest-icon';

interface TreasureChestProps {
  onClaim?: () => void;
}

export function TreasureChest({ onClaim }: TreasureChestProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(16 * 3600 + 31 * 60 + 35);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Bounce animation for the chest
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) {
          return prev - 1;
        }
        clearInterval(timer);
        return 0;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(secs).padStart(2, '0')}`;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.chestButton}
        onPress={onClaim}
        activeOpacity={0.8}>
        <Animated.View style={[styles.chestIcon, animatedStyle]}>
          <ChestIcon width={48} height={48} />
        </Animated.View>

        <View style={styles.chestInfo}>
          <Text style={styles.findingText}>finding chest</Text>
          <Text style={styles.countdownText}>{formatTime(timeLeft)}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 28,
    alignItems: 'center',
  },
  chestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  chestIcon: {
    marginRight: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chestImage: {
    width: 48,
    height: 48,
  },
  chestInfo: {
    flex: 1,
  },
  findingText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countdownText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
