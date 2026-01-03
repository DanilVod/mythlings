import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MythlingType } from '@entities/mythling/model/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GradientBackground } from '@shared/ui/gradient-background';
import { updateGameProfile } from '@entities/game-profile/lib/game-storage';
import {
  GameMythling,
  fetchStarterMythlings,
} from '@/features/game-data/lib/game-api';
import { env } from '@mythlings/env/native';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function CharacterSelectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const [starterMythlings, setStarterMythlings] = useState<GameMythling[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMythling, setSelectedMythling] = useState<MythlingType | null>(
    null,
  );
  const tooltipOpacity = useSharedValue(0);

  // Fetch starter mythlings on mount
  useEffect(() => {
    const loadStarterMythlings = async () => {
      try {
        const data = await fetchStarterMythlings();
        setStarterMythlings(data);
      } catch (error) {
        console.error('Error loading starter mythlings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStarterMythlings();
  }, []);

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

  // Find selected mythling from server data
  const selectedMythlingData = starterMythlings.find(
    (m) => m.type === selectedMythling,
  );

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <View style={styles.container}>
        <GradientBackground mythlingType={undefined} />
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 32,
            },
          ]}>
          <ActivityIndicator size='large' color='#FFFFFF' />
        </View>
      </View>
    );
  }

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
          {starterMythlings.map((mythling) => (
            <AnimatedTouchableOpacity
              key={mythling.id}
              onPress={() =>
                handleSelectMythling(mythling.type as MythlingType)
              }
              style={[
                styles.mythlingCard,
                selectedMythling === mythling.type && styles.selectedCard,
                {
                  borderColor:
                    selectedMythling === mythling.type
                      ? mythling.type === 'fire'
                        ? '#E85D2A'
                        : mythling.type === 'water'
                        ? '#0096B4'
                        : '#5A7A1D'
                      : '#4B5563',
                  borderWidth: selectedMythling === mythling.type ? 4 : 2,
                },
              ]}>
              <View style={styles.emojiContainer}>
                {mythling.icon?.startsWith('/uploads/') ? (
                  <Image
                    source={{
                      uri: `${env.EXPO_PUBLIC_SERVER_URL}${mythling.icon}`,
                    }}
                    style={styles.mythlingImage}
                    resizeMode='contain'
                  />
                ) : (
                  <Text style={styles.emoji}>{mythling.icon}</Text>
                )}
              </View>
              <Text style={styles.mythlingName}>{mythling.name}</Text>
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
                ? selectedMythlingData.type === 'fire'
                  ? '#FF6B35'
                  : selectedMythlingData.type === 'water'
                  ? '#00B4D8'
                  : '#6B8E23'
                : '#4B5563',
              borderColor: selectedMythlingData
                ? selectedMythlingData.type === 'fire'
                  ? '#E85D2A'
                  : selectedMythlingData.type === 'water'
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
  mythlingImage: {
    width: 48,
    height: 48,
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
