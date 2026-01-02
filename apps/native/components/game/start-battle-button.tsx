import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { AnimatedButton } from './animated-button';

interface StartBattleButtonProps {
  floor: number;
  theme?: 'purple' | 'orange' | 'gold' | 'blue' | 'green';
  onPress: () => void;
}

export function StartBattleButton({
  floor,
  theme = 'purple',
  onPress,
}: StartBattleButtonProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const getThemeColors = () => {
    switch (theme) {
      case 'orange':
        return {
          background: '#FF6B35',
          border: '#E55A2B',
          text: '#FFFFFF',
        };
      case 'gold':
        return {
          background: '#FFD700',
          border: '#FFC000',
          text: '#1A1A1A',
        };
      case 'blue':
        return {
          background: '#4FC3F7',
          border: '#29B6F6',
          text: '#FFFFFF',
        };
      case 'green':
        return {
          background: '#66BB6A',
          border: '#4CAF50',
          text: '#FFFFFF',
        };
      case 'purple':
      default:
        return {
          background: '#6366F1',
          border: '#4338CA',
          text: '#FFFFFF',
        };
    }
  };

  const colors = getThemeColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Animated.View style={animatedStyle}>
        <View style={styles.buttonContainer}>
          {/* Battle Button */}
          <AnimatedButton
            onPress={onPress}
            style={{
              ...styles.button,
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
            textStyle={styles.buttonText}>
            <Text style={[styles.buttonText, { color: colors.text }]}>
              {t('home.startBattle').toUpperCase()}
            </Text>
          </AnimatedButton>

          {/* Floor Badge */}
          <View style={styles.floorBadgeContainer}>
            <View
              style={[
                styles.floorBadge,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}>
              <Text style={styles.floorBadgeText}>
                {t('home.floor')} {floor}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 320,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  floorBadgeContainer: {
    position: 'absolute',
    top: -14,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  floorBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  floorBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
