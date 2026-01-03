import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character } from '@entities/mythling/ui/character';
import { StartBattleButton } from '@features/battle-system/ui/start-battle-button';
import { OnboardingTooltip } from '@features/onboarding/ui/onboarding-tooltip';
import { BottomNavigation } from '@features/navigation/ui/bottom-navigation';
import { TopStatusBar } from '@features/navigation/ui/top-status-bar';
import { TutorialProgress } from '@features/tutorial/ui/tutorial-progress';
import { TreasureChest } from '@features/treasure/ui/treasure-chest';
import { useGameData } from '@features/game-data';

type TabType = 'incubation' | 'collections' | 'home' | 'inventory' | 'shop';

const ONBOARDING_KEY = '@mythlings:onboarding_completed';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, isLoading: isGameDataLoading } = useGameData();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Use currentFloor from profile, default to 1 if not available
  const currentFloor = profile?.currentFloor || 1;
  const totalFloors = profile?.totalFloors || 10;

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
  };

  const handleStartBattle = () => {
    console.log('Start Battle pressed on Floor', currentFloor);
    // Pass the current floor number to the battle selection screen
    router.push({
      pathname: '/game/battle-selection-screen',
      params: { floorNumber: currentFloor.toString() },
    });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'home') {
      router.push('/game/home-screen');
    } else {
      router.push(`/game/tabs/${tab}`);
    }
  };

  const handleSettingsPress = () => {
    router.push('/game/settings-screen');
  };

  const handleMissionsPress = () => {
    console.log('Missions pressed');
    // Navigate to missions screen
  };

  const handleClaimTreasure = () => {
    console.log('Claim treasure pressed');
    // Handle treasure claim logic
  };

  const getThemeForTab = (
    tab: TabType,
  ): 'purple' | 'orange' | 'gold' | 'blue' | 'green' => {
    switch (tab) {
      case 'incubation':
        return 'orange';
      case 'collections':
        return 'gold';
      case 'home':
        return 'purple';
      case 'inventory':
        return 'blue';
      case 'shop':
        return 'green';
      default:
        return 'purple';
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/home-backround.png')}
        style={styles.backgroundImage}
        resizeMode='cover'
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}>
        {/* Top Status Bar */}
        <TopStatusBar
          onSettingsPress={handleSettingsPress}
          onMissionsPress={handleMissionsPress}
          gold={profile?.gold}
          gems={profile?.gems}
          energy={0}
          isLoading={isGameDataLoading}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Tutorial Progress */}
          <TutorialProgress
            currentFloor={currentFloor}
            totalFloors={totalFloors}
          />

          {/* Treasure Chest Section */}
          <TreasureChest onClaim={handleClaimTreasure} />

          {/* Main Content Area - Mythling Display */}
          <View style={styles.mainArea}>
            <Character />
          </View>

          {/* Battle Controls */}
          <View style={styles.battleControls}>
            <StartBattleButton
              floor={currentFloor}
              theme={getThemeForTab(activeTab)}
              onPress={handleStartBattle}
            />
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </View>

      {/* Onboarding Tooltip */}
      {showOnboarding && (
        <OnboardingTooltip
          visible={showOnboarding}
          onDismiss={handleDismissOnboarding}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 70,
  },
  mainArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  battleControls: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
});
