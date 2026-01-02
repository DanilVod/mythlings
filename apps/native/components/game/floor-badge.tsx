import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface FloorBadgeProps {
  floor: number;
  theme?: 'purple' | 'orange' | 'gold' | 'blue' | 'green';
}

export function FloorBadge({ floor, theme = 'purple' }: FloorBadgeProps) {
  const { t } = useTranslation();

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
          background: '#9C27B0',
          border: '#7B1FA2',
          text: '#FFFFFF',
        };
    }
  };

  const colors = getThemeColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {t('home.floor')} {floor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    alignSelf: 'center',
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
