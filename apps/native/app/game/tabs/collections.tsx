import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { GradientBackground } from '@shared/ui/gradient-background';
import { BottomNavigation } from '@features/navigation/ui/bottom-navigation';

type TabType = 'incubation' | 'collections' | 'home' | 'inventory' | 'shop';

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('collections');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'home') {
      router.push('/game/home-screen');
    } else {
      router.push(`/game/tabs/${tab}`);
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground mythlingType={'water'} />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}>
        <Text style={styles.title}>{t('tabs.collections')}</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>📚</Text>
          <Text style={styles.placeholderSubtext}>
            Collections coming soon...
          </Text>
        </View>
      </View>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 48,
    textAlign: 'center',
    fontFamily: 'Bungee_400Regular',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
    marginBottom: 16,
  },
  placeholderSubtext: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Bungee_400Regular',
  },
});
