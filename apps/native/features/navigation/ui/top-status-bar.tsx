import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface TopStatusBarProps {
  onSettingsPress?: () => void;
  onMissionsPress?: () => void;
  gold?: number;
  gems?: number;
  energy?: number;
  isLoading?: boolean;
}

export function TopStatusBar({
  onSettingsPress,
  onMissionsPress,
  gold = 0,
  gems = 0,
  energy = 0,
  isLoading = false,
}: TopStatusBarProps) {
  const { t } = useTranslation();

  const formatCurrency = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <View style={styles.container}>
      {/* Settings Icon */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onSettingsPress}
        activeOpacity={0.7}>
        <Text style={styles.icon}>⚙️</Text>
      </TouchableOpacity>

      {/* Currency Counters */}
      <View style={styles.currencyContainer}>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyIcon}>💎</Text>
          <Text style={styles.currencyText}>
            {isLoading ? '...' : formatCurrency(gems)}
          </Text>
        </View>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyIcon}>🪙</Text>
          <Text style={styles.currencyText}>
            {isLoading ? '...' : formatCurrency(gold)}
          </Text>
        </View>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyIcon}>⚡</Text>
          <Text style={styles.currencyText}>
            {isLoading ? '...' : formatCurrency(energy)}
          </Text>
        </View>
      </View>

      {/* Missions Button */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onMissionsPress}
        activeOpacity={0.7}>
        <Text style={styles.icon}>📋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  currencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'gray',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  currencyIcon: {
    fontSize: 12,
  },
  currencyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
});
