import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MythlingType, MYTHLINGS } from '@/lib/mythling-types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GradientBackground } from '@/components/game/gradient-background';
import { updateGameProfile } from '@/lib/game-storage';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function CharacterSelectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedMythling, setSelectedMythling] = useState<MythlingType | null>(
    null,
  );
  const tooltipOpacity = useSharedValue(0);

  const handleSelectMythling = (type: MythlingType) => {
    setSelectedMythling(type);
    tooltipOpacity.value = withTiming(1, { duration: 300 });
  };

  const handleChooseMythling = async () => {
    if (selectedMythling) {
      try {
        // Save character type to storage
        await updateGameProfile({
          characterType: selectedMythling,
        });

        router.push({
          pathname: '/game/username-selection',
          params: { mythlingType: selectedMythling },
        });
      } catch (error) {
        console.error('Error saving character type:', error);
        // Still navigate even if save fails
        router.push({
          pathname: '/game/username-selection',
          params: { mythlingType: selectedMythling },
        });
      }
    }
  };

  const tooltipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
  }));

  const selectedMythlingData = MYTHLINGS.find(
    (m) => m.type === selectedMythling,
  );

  return (
    <View style={styles.container}>
      <GradientBackground mythlingType={selectedMythling || undefined} />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
          },
        ]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('characterSelection.title')}</Text>
          <Text style={styles.subtitle}>
            {t('characterSelection.subtitle')}
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {MYTHLINGS.map((mythling) => (
            <AnimatedTouchableOpacity
              key={mythling.type}
              onPress={() => handleSelectMythling(mythling.type)}
              style={[
                styles.mythlingCard,
                selectedMythling === mythling.type && styles.selectedCard,
                {
                  borderColor:
                    selectedMythling === mythling.type
                      ? mythling.type === MythlingType.FIRE
                        ? '#E85D2A'
                        : mythling.type === MythlingType.WATER
                        ? '#0096B4'
                        : '#5A7A1D'
                      : '#4B5563',
                  borderWidth: selectedMythling === mythling.type ? 4 : 2,
                },
              ]}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{mythling.emoji}</Text>
              </View>
              <Text style={styles.mythlingName}>
                {t(`mythlings.${mythling.type}.name`)}
              </Text>
            </AnimatedTouchableOpacity>
          ))}
        </View>

        <View style={styles.tooltipContainer}>
          <Animated.View style={[styles.tooltip, tooltipAnimatedStyle]}>
            {selectedMythlingData && (
              <>
                <Text style={styles.tooltipTitle}>
                  {t(`mythlings.${selectedMythlingData.type}.name`)}
                </Text>
                <Text style={styles.tooltipDescription}>
                  {t(`mythlings.${selectedMythlingData.type}.description`)}
                </Text>
              </>
            )}
          </Animated.View>
        </View>

        <TouchableOpacity
          onPress={handleChooseMythling}
          disabled={!selectedMythling}
          style={[
            styles.chooseButton,
            {
              backgroundColor: selectedMythlingData
                ? selectedMythlingData.type === MythlingType.FIRE
                  ? '#FF6B35'
                  : selectedMythlingData.type === MythlingType.WATER
                  ? '#00B4D8'
                  : '#6B8E23'
                : '#4B5563',
              borderColor: selectedMythlingData
                ? selectedMythlingData.type === MythlingType.FIRE
                  ? '#E85D2A'
                  : selectedMythlingData.type === MythlingType.WATER
                  ? '#0096B4'
                  : '#5A7A1D'
                : '#374151',
            },
          ]}>
          <Text style={styles.chooseButtonText}>
            {selectedMythlingData
              ? t('characterSelection.iChoose', {
                  name: selectedMythlingData.name,
                })
              : t('characterSelection.selectMythling')}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Bungee_400Regular',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    fontFamily: 'Bungee_400Regular',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 24,
  },
  mythlingCard: {
    backgroundColor: 'rgba(30, 27, 75, 0.8)',
    borderRadius: 16,
    padding: 16,
    width: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  selectedCard: {
    borderWidth: 4,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 36,
  },
  mythlingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  tooltipContainer: {
    minHeight: 80,
    justifyContent: 'center',
    marginVertical: 16,
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Bungee_400Regular',
  },
  tooltipDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    fontFamily: 'Bungee_400Regular',
  },
  chooseButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 4,
  },
  chooseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
});
