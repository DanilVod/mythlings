import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Mythling, MythlingType } from '@/lib/mythling-types';

interface MythlingCardProps {
  mythling: Mythling;
  isSelected: boolean;
  onPress: () => void;
}

export function MythlingCard({
  mythling,
  isSelected,
  onPress,
}: MythlingCardProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.card,
          isSelected && styles.selectedCard,
          {
            borderColor: isSelected
              ? mythling.type === MythlingType.FIRE
                ? '#E85D2A'
                : mythling.type === MythlingType.WATER
                ? '#0096B4'
                : '#5A7A1D'
              : '#4B5563',
          },
        ]}>
        <View style={styles.content}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{mythling.emoji}</Text>
          </View>
          <Text style={[styles.name, { color: '#FFFFFF' }]}>
            {t(`mythlings.${mythling.type}.name`)}
          </Text>
          <Text
            style={[styles.description, { color: '#FFFFFF', opacity: 0.7 }]}>
            {t(`mythlings.${mythling.type}.description`)}
          </Text>
          {isSelected && (
            <View
              style={[
                styles.selectedIndicator,
                {
                  backgroundColor:
                    mythling.type === MythlingType.FIRE
                      ? '#FF6B35'
                      : mythling.type === MythlingType.WATER
                      ? '#00B4D8'
                      : '#6B8E23',
                },
              ]}>
              <Text style={styles.selectedText}>
                {t('characterSelection.selected')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 27, 75, 0.8)',
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    width: 280,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    borderWidth: 3,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Bungee_400Regular',
  },
  selectedIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
