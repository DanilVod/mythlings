import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientBackground } from '@shared/ui/gradient-background';
import { ParticleSystem } from '@shared/ui/particle-system';
import { GameTitle } from '@features/game-data/ui/game-title';
import { Character } from '@entities/mythling/ui/character';
import { LanguageSelector } from '@features/settings/ui/language-selector';
import { PrimaryButton } from '@shared/ui/primary-button';
import { SecondaryActions } from '@features/settings/ui/secondary-actions';

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
