import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabType = 'incubation' | 'collections' | 'home' | 'inventory' | 'shop';

interface TabConfig {
  id: TabType;
  emoji: string;
  theme: 'orange' | 'gold' | 'purple' | 'blue' | 'green' | 'red';
}

const TABS: TabConfig[] = [
  { id: 'incubation', emoji: '🥚', theme: 'orange' },
  { id: 'collections', emoji: '📚', theme: 'gold' },
  { id: 'home', emoji: '🏠', theme: 'purple' },
  { id: 'inventory', emoji: '🎒', theme: 'blue' },
  { id: 'shop', emoji: '🛒', theme: 'green' },
];

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  const getThemeColors = (theme: TabConfig['theme'], isActive: boolean) => {
    const baseColors = {
      orange: { background: '#FF6B35', border: '#E55A2B' },
      gold: { background: '#FFD700', border: '#FFC000' },
      purple: { background: '#6366F1', border: '#4338CA' },
      blue: { background: '#4FC3F7', border: '#29B6F6' },
      green: { background: '#66BB6A', border: '#4CAF50' },
      red: { background: '#EF4444', border: '#DC2626' },
    };

    const colors = baseColors[theme];

    return {
      background: isActive ? colors.background : 'rgba(255, 255, 255, 0.1)',
      border: isActive ? colors.border : 'rgba(255, 255, 255, 0.2)',
    };
  };

  const handleTabPress = (tab: TabConfig) => {
    onTabChange(tab.id);
  };

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const colors = getThemeColors(tab.theme, isActive);

        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              isActive && styles.activeTab,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleTabPress(tab)}
            activeOpacity={1}>
            <Text style={[styles.emoji, isActive && styles.activeEmoji]}>
              {tab.emoji}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 27, 75, 0.95)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderTopWidth: 2,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  emoji: {
    fontSize: 26,
  },
  activeEmoji: {
    fontSize: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
