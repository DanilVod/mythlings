import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientBackground } from '@/components/game/gradient-background';
import { ParticleSystem } from '@/components/game/particle-system';
import { GameTitle } from '@/components/game/game-title';
import { Character } from '@/components/game/character';
import { LanguageSelector } from '@/components/game/language-selector';
import { PrimaryButton } from '@/components/game/primary-button';
import { SecondaryActions } from '@/components/game/secondary-actions';

export default function StartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  const handleBeginJourney = () => {
    console.log('Begin Journey pressed');
    router.push('/game/character-selection');
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <ParticleSystem />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
          },
        ]}>
        <View style={styles.topSection}>
          <GameTitle />
          <Character />
          <LanguageSelector />
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton onPress={handleBeginJourney} />
          <SecondaryActions />
        </View>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 16,
  },
});
