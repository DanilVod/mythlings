import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { env } from '@mythlings/env/native';
import { MythlingType } from '@entities/mythling/model/types';
import {
  createPlayerTeam,
  createEnemyTeamFromFloor,
  generateEnemyTeam,
} from '@entities/battle/lib/battle-utils';
import { BattleButton } from '@features/battle-system/ui/battle-button';
import { useGameData } from '@features/game-data';
import { fetchFloorByNumber } from '@features/game-data/lib/game-api';
import type { GameFloor } from '@features/game-data/lib/game-api';
import { BattleMythling } from '@entities/battle/model/types';

export default function BattleSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { floors, mythlings } = useGameData();

  const [selectedMythlings, setSelectedMythlings] = useState<MythlingType[]>(
    [],
  );
  const [currentFloor, setCurrentFloor] = useState<GameFloor | null>(null);
  const [isLoadingFloor, setIsLoadingFloor] = useState(true);

  const floorNumber = params.floorNumber
    ? parseInt(params.floorNumber as string)
    : 1;

  useEffect(() => {
    loadFloorData();
  }, [floorNumber, floors]);

  const loadFloorData = async () => {
    try {
      setIsLoadingFloor(true);
      // First try to get from context (already loaded)
      let floor = floors.find((f) => f.floorNumber === floorNumber);

      // If not found, fetch from server
      if (!floor) {
        const fetchedFloor = await fetchFloorByNumber(floorNumber);
        console.log(fetchedFloor);
        floor = fetchedFloor ?? undefined;
      }

      setCurrentFloor(floor ?? null);
    } catch (error) {
      console.error('Error loading floor data:', error);
      setCurrentFloor(null);
    } finally {
      setIsLoadingFloor(false);
    }
  };

  const toggleMythling = (type: MythlingType) => {
    if (selectedMythlings.includes(type)) {
      setSelectedMythlings(selectedMythlings.filter((m) => m !== type));
    } else if (selectedMythlings.length < 4) {
      setSelectedMythlings([...selectedMythlings, type]);
    }
  };

  const playerTeam = createPlayerTeam(selectedMythlings, mythlings);
  const enemyTeam = currentFloor
    ? createEnemyTeamFromFloor(currentFloor)
    : generateEnemyTeam(1);

  const handleStartBattle = () => {
    // Pass floor data and team data to battle screen
    router.push({
      pathname: '/game/battle-screen',
      params: {
        floorNumber: floorNumber.toString(),
        playerTeam: JSON.stringify(playerTeam),
        enemyTeam: JSON.stringify(enemyTeam),
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
          },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TEAM</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* BP Display */}
        <Text style={styles.bpLabel}>BP:{playerTeam.totalPower}</Text>

        {/* Player Team Display */}
        <View style={styles.teamCard}>
          {selectedMythlings.length > 0 ? (
            selectedMythlings.map((type) => {
              const mythling = mythlings.find((m) => m.type === type);
              const iconPath = mythling?.icon?.startsWith('/uploads/')
                ? `${env.EXPO_PUBLIC_SERVER_URL}${mythling.icon}`
                : undefined;

              return (
                <View key={type} style={styles.playerMythling}>
                  {iconPath ? (
                    <Image
                      source={{ uri: iconPath }}
                      style={styles.mythlingImage}
                      resizeMode='contain'
                    />
                  ) : (
                    <Text style={styles.mythlingEmoji}>{mythling?.icon}</Text>
                  )}
                  <Text style={styles.mythlingLevel}>Lv1</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>
              {t('battleSelection.selectMythlings')}
            </Text>
          )}
        </View>

        {/* Enemy Team Preview */}
        <View style={styles.section}>
          {isLoadingFloor ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color='#FFFFFF' />
              <Text style={styles.loadingText}>Loading floor data...</Text>
            </View>
          ) : currentFloor ? (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTextColumn}>
                <Text style={styles.floorText}>Floor {floorNumber}</Text>
                <Text style={styles.bpText}>BP:{enemyTeam.totalPower}</Text>
              </View>
              <View style={styles.enemyTeam}>
                {enemyTeam.mythlings.map((mythling: BattleMythling) => {
                  const emojiPath = mythling.emoji?.startsWith('/uploads/')
                    ? `${env.EXPO_PUBLIC_SERVER_URL}${mythling.emoji}`
                    : undefined;

                  return (
                    <View key={mythling.id} style={styles.enemyMythling}>
                      {emojiPath ? (
                        <Image
                          source={{ uri: emojiPath }}
                          style={styles.enemyImage}
                          resizeMode='contain'
                        />
                      ) : (
                        <Text style={styles.enemyEmoji}>{mythling.emoji}</Text>
                      )}
                      <Text style={styles.enemyLevel}>Lv1</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <Text style={styles.errorText}>Failed to load floor data</Text>
          )}
        </View>

        {/* Selection Area */}
        <View style={styles.selectionCard}>
          <Text style={styles.selectionTitle}>CHOOSE PETS</Text>
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.mythlingList}
            style={styles.scrollView}>
            {mythlings.map((mythling) => {
              const isSelected = selectedMythlings.includes(mythling.type);
              return (
                <TouchableOpacity
                  key={mythling.id}
                  style={[
                    styles.mythlingCard,
                    isSelected && styles.selectedCard,
                  ]}
                  onPress={() => toggleMythling(mythling.type)}>
                  {mythling.icon?.startsWith('/uploads/') ? (
                    <Image
                      source={{
                        uri: `${env.EXPO_PUBLIC_SERVER_URL}${mythling.icon}`,
                      }}
                      style={styles.cardImage}
                      resizeMode='contain'
                    />
                  ) : (
                    <Text style={styles.cardEmoji}>{mythling.icon}</Text>
                  )}
                  <Text style={styles.cardName}>{mythling.name}</Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Battle Button */}
        <View style={styles.buttonContainer}>
          <View
            style={[
              styles.buttonWrapper,
              selectedMythlings.length === 0 && styles.buttonWrapperDisabled,
            ]}>
            <BattleButton
              title='BATTLE'
              onPress={handleStartBattle}
              disabled={selectedMythlings.length === 0}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F46E5',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  bpLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Saira_400Regular',
  },
  teamCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playerMythling: {
    alignItems: 'center',
  },
  mythlingEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  mythlingImage: {
    width: 48,
    height: 48,
    marginBottom: 4,
  },
  mythlingLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontFamily: 'Bungee_400Regular',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
    padding: 12,
    marginBottom: 16,
    gap: 16,
    width: '80%',
    alignSelf: 'flex-end',
  },
  sectionTextColumn: {
    flexDirection: 'column',
    gap: 8,
  },
  floorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  foesText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  bpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  enemyTeam: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    flex: 1,
  },
  enemyMythling: {
    alignItems: 'center',
  },
  enemyEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  enemyImage: {
    width: 48,
    height: 48,
    marginBottom: 4,
  },
  enemyLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  selectionCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    flex: 1,
    paddingBottom: 80,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'Bungee_400Regular',
  },
  scrollView: {
    flex: 1,
  },
  mythlingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 4,
    paddingBottom: 20,
    flexGrow: 1,
  },
  mythlingCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#6366F1',
    backgroundColor: '#1E293B',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  cardImage: {
    width: 40,
    height: 40,
    marginBottom: 6,
  },
  cardName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Bungee_400Regular',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  handCue: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  handEmoji: {
    fontSize: 48,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 320,
  },
  buttonWrapperDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Bungee_400Regular',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
    fontFamily: 'Bungee_400Regular',
  },
});
