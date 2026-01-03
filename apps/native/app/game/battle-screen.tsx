import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { env } from '@mythlings/env/native';
import {
  BattleMythling,
  BattleTeam,
  BattleState,
  Ability,
} from '@entities/battle/model/types';

export default function BattleScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Track cooldowns for abilities: { abilityId: remainingTurns }
  const [abilityCooldowns, setAbilityCooldowns] = useState<
    Record<string, number>
  >({});

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize battle state with default values
  const [battleState, setBattleState] = useState<BattleState>({
    playerTeam: { mythlings: [], totalPower: 0 },
    enemyTeam: { mythlings: [], totalPower: 0 },
    currentTurn: 'player',
    selectedAbility: null,
    selectedTarget: null,
    battleLog: ['Battle started!'],
    isBattleOver: false,
    winner: null,
  });

  // Load team data from URL params
  useEffect(() => {
    const loadBattleData = () => {
      try {
        const playerTeamParam = params.playerTeam as string;
        const enemyTeamParam = params.enemyTeam as string;

        if (!playerTeamParam || !enemyTeamParam) {
          setError('Battle data not found');
          setIsLoading(false);
          return;
        }

        const playerTeam = JSON.parse(playerTeamParam) as BattleTeam;
        const enemyTeam = JSON.parse(enemyTeamParam) as BattleTeam;

        setBattleState({
          playerTeam,
          enemyTeam,
          currentTurn: 'player',
          selectedAbility: null,
          selectedTarget: null,
          battleLog: ['Battle started!'],
          isBattleOver: false,
          winner: null,
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading battle data:', err);
        setError('Failed to load battle data');
        setIsLoading(false);
      }
    };

    loadBattleData();
  }, [params.playerTeam, params.enemyTeam]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);

  const currentPlayerMythling =
    battleState.playerTeam.mythlings[currentPlayerIndex];
  const currentEnemyMythling =
    battleState.enemyTeam.mythlings[currentEnemyIndex];
  const isPlayerTurn = battleState.currentTurn === 'player';

  const handleAbilitySelect = (ability: Ability) => {
    if (!isPlayerTurn || battleState.isBattleOver) return;

    // Check if ability is on cooldown
    const cooldownRemaining = abilityCooldowns[ability.id] || 0;
    if (cooldownRemaining > 0) {
      Alert.alert(
        'Ability on Cooldown',
        `${ability.name} is on cooldown for ${cooldownRemaining} more turn(s)`,
      );
      return;
    }

    setBattleState((prev) => ({ ...prev, selectedAbility: ability }));
  };

  const handleTargetSelect = (targetId: string) => {
    if (
      !isPlayerTurn ||
      !battleState.selectedAbility ||
      battleState.isBattleOver
    )
      return;
    setBattleState((prev) => ({ ...prev, selectedTarget: targetId }));
    executePlayerTurn(targetId);
  };

  const executePlayerTurn = (targetId: string) => {
    if (!currentPlayerMythling || !battleState.selectedAbility) return;

    const target = battleState.enemyTeam.mythlings.find(
      (m) => m.id === targetId,
    );
    if (!target) return;

    const damage = battleState.selectedAbility.damage;
    const newEnemyHealth = Math.max(0, target.currentHealth - damage);

    // Create new arrays to ensure immutability
    const updatedPlayerMythlings = battleState.playerTeam.mythlings.map((m) => {
      if (m.id === currentPlayerMythling.id) {
        return {
          ...m,
          damageDealt: m.damageDealt + damage,
        };
      }
      return { ...m };
    });

    const updatedEnemyMythlings = battleState.enemyTeam.mythlings.map((m) => {
      if (m.id === targetId) {
        return {
          ...m,
          currentHealth: newEnemyHealth,
          damageReceived: m.damageReceived + damage,
        };
      }
      return { ...m };
    });

    const updatedPlayerTeam = {
      ...battleState.playerTeam,
      mythlings: updatedPlayerMythlings,
    };

    const updatedEnemyTeam = {
      ...battleState.enemyTeam,
      mythlings: updatedEnemyMythlings,
    };

    // Set cooldown for the used ability
    const newCooldowns = { ...abilityCooldowns };
    newCooldowns[battleState.selectedAbility.id] =
      battleState.selectedAbility.cooldown;

    const newLog = [
      ...battleState.battleLog,
      `${currentPlayerMythling.name} used ${battleState.selectedAbility.name}!`,
      `Dealt ${damage} damage to ${target.name}!`,
    ];

    const aliveEnemies = updatedEnemyTeam.mythlings.filter(
      (m) => m.currentHealth > 0,
    );
    const isPlayerWinner = aliveEnemies.length === 0;

    setBattleState((prev) => ({
      ...prev,
      playerTeam: updatedPlayerTeam,
      enemyTeam: updatedEnemyTeam,
      selectedAbility: null,
      selectedTarget: null,
      battleLog: newLog,
      isBattleOver: isPlayerWinner,
      winner: isPlayerWinner ? 'player' : null,
      currentTurn: isPlayerWinner ? 'player' : 'enemy',
    }));

    setAbilityCooldowns(newCooldowns);

    if (!isPlayerWinner) {
      setTimeout(() => executeEnemyTurn(), 1500);
    } else {
      // Decrement cooldowns after player turn
      decrementCooldowns();
      // Show statistics screen after victory (don't navigate yet)
    }
  };

  const decrementCooldowns = () => {
    const newCooldowns = { ...abilityCooldowns };
    Object.keys(newCooldowns).forEach((key) => {
      if (newCooldowns[key] > 0) {
        newCooldowns[key] -= 1;
      }
    });
    setAbilityCooldowns(newCooldowns);
  };

  const executeEnemyTurn = () => {
    // Use functional update to get the latest state
    setBattleState((prevBattleState) => {
      const aliveEnemies = prevBattleState.enemyTeam.mythlings.filter(
        (m) => m.currentHealth > 0,
      );
      const alivePlayers = prevBattleState.playerTeam.mythlings.filter(
        (m) => m.currentHealth > 0,
      );

      if (aliveEnemies.length === 0 || alivePlayers.length === 0) {
        return prevBattleState;
      }

      // Select a random alive enemy to attack
      const attacker =
        aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      const target =
        alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      const ability =
        attacker.abilities[
          Math.floor(Math.random() * attacker.abilities.length)
        ];
      const damage = ability.damage;
      const newPlayerHealth = Math.max(0, target.currentHealth - damage);

      // Create new arrays to ensure immutability
      const updatedEnemyMythlings = prevBattleState.enemyTeam.mythlings.map(
        (m) => {
          if (m.id === attacker.id) {
            // Update attacker's damageDealt but preserve currentHealth
            return {
              ...m,
              damageDealt: m.damageDealt + damage,
            };
          }
          // Return a new object with all properties preserved
          return { ...m };
        },
      );

      const updatedPlayerMythlings = prevBattleState.playerTeam.mythlings.map(
        (m) => {
          if (m.id === target.id) {
            // Update target's health and damage received
            return {
              ...m,
              currentHealth: newPlayerHealth,
              damageReceived: m.damageReceived + damage,
            };
          }
          // Return a new object with all properties preserved
          return { ...m };
        },
      );

      const updatedEnemyTeam = {
        ...prevBattleState.enemyTeam,
        mythlings: updatedEnemyMythlings,
      };

      const updatedPlayerTeam = {
        ...prevBattleState.playerTeam,
        mythlings: updatedPlayerMythlings,
      };

      const newLog = [
        ...prevBattleState.battleLog,
        `${attacker.name} used ${ability.name}!`,
        `Dealt ${damage} damage to ${target.name}!`,
      ];

      const alivePlayersAfter = updatedPlayerTeam.mythlings.filter(
        (m) => m.currentHealth > 0,
      );
      const isEnemyWinner = alivePlayersAfter.length === 0;

      // Update currentEnemyIndex to the attacker for visual consistency
      const attackerIndex =
        prevBattleState.enemyTeam.mythlings.indexOf(attacker);
      setCurrentEnemyIndex(attackerIndex);

      // Decrement cooldowns after enemy turn
      if (!isEnemyWinner) {
        decrementCooldowns();

        // Move to next ALIVE player mythling
        const alivePlayers = updatedPlayerTeam.mythlings.filter(
          (m) => m.currentHealth > 0,
        );
        if (alivePlayers.length > 0) {
          // Find the next alive player mythling
          const currentPlayerIdx = prevBattleState.playerTeam.mythlings.indexOf(
            prevBattleState.playerTeam.mythlings[currentPlayerIndex]!,
          );
          let nextPlayerIndex =
            (currentPlayerIdx + 1) %
            prevBattleState.playerTeam.mythlings.length;

          // Skip dead mythlings
          let attempts = 0;
          while (
            prevBattleState.playerTeam.mythlings[nextPlayerIndex]
              .currentHealth <= 0 &&
            attempts < prevBattleState.playerTeam.mythlings.length
          ) {
            nextPlayerIndex =
              (nextPlayerIndex + 1) %
              prevBattleState.playerTeam.mythlings.length;
            attempts++;
          }

          setCurrentPlayerIndex(nextPlayerIndex);
        }
      } else {
        // Show statistics screen after defeat (don't navigate yet)
      }

      return {
        ...prevBattleState,
        enemyTeam: updatedEnemyTeam,
        playerTeam: updatedPlayerTeam,
        battleLog: newLog,
        isBattleOver: isEnemyWinner,
        winner: isEnemyWinner ? 'enemy' : null,
        currentTurn: isEnemyWinner ? 'enemy' : 'player',
      };
    });
  };

  const handleBack = () => {
    router.replace('/game/battle-selection-screen');
  };

  const renderMythling = (
    mythling: BattleMythling,
    isPlayer: boolean,
    index: number,
  ) => {
    const healthPercent = (mythling.currentHealth / mythling.maxHealth) * 100;
    const isSelected = battleState.selectedTarget === mythling.id && !isPlayer;
    const isCurrentTurn = isPlayer
      ? index === currentPlayerIndex && isPlayerTurn
      : index === currentEnemyIndex && !isPlayerTurn;
    const level = 5 + Math.floor(Math.random() * 3); // Random level 5-7

    // Handle image URL or emoji
    const iconPath = mythling.emoji?.startsWith('/uploads/')
      ? `${env.EXPO_PUBLIC_SERVER_URL}${mythling.emoji}`
      : undefined;

    return (
      <TouchableOpacity
        key={mythling.id}
        style={[
          styles.mythlingCard,
          isPlayer ? styles.playerCard : styles.enemyCard,
          isSelected && styles.targetCard,
          isCurrentTurn && styles.currentTurnCard,
          mythling.currentHealth <= 0 && styles.defeatedCard,
        ]}
        onPress={() => !isPlayer && handleTargetSelect(mythling.id)}
        disabled={mythling.currentHealth <= 0 || battleState.isBattleOver}>
        <View style={styles.mythlingImageContainer}>
          {iconPath ? (
            <Image
              source={{ uri: iconPath }}
              style={styles.mythlingImage}
              resizeMode='contain'
            />
          ) : (
            <Text style={styles.mythlingEmoji}>{mythling.emoji}</Text>
          )}
          {isCurrentTurn && <View style={styles.turnIndicator} />}
        </View>
        <View style={styles.mythlingInfo}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv{level}</Text>
          </View>
          <Text style={styles.mythlingName}>{mythling.name}</Text>
          <View style={styles.healthBarContainer}>
            <View style={styles.healthBarBackground}>
              <View
                style={[
                  styles.healthBarFill,
                  { width: `${healthPercent}%` },
                  healthPercent > 50 ? styles.healthHigh : styles.healthLow,
                ]}
              />
            </View>
            <Text style={styles.healthText}>
              {mythling.currentHealth}/{mythling.maxHealth}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background with gradient and mountain effect */}
      <LinearGradient
        colors={['#4338CA', '#7C3AED', '#A855F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Mountain silhouette overlay */}
      <View style={styles.mountainOverlay}>
        <View style={styles.mountain1} />
        <View style={styles.mountain2} />
        <View style={styles.mountain3} />
      </View>

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
          <Text style={styles.title}>BATTLE</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading battle data...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={handleBack}>
              <Text style={styles.errorButtonText}>GO BACK</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Teams Container */}
        {!isLoading && !error && (
          <View style={styles.teamsContainer}>
          {/* Player Team - Left */}
          <View style={styles.teamColumn}>
            <Text style={styles.teamLabel}>YOUR TEAM</Text>
            <View style={styles.mythlingsList}>
              {battleState.playerTeam.mythlings.map((mythling, index) =>
                renderMythling(mythling, true, index),
              )}
            </View>
          </View>

          {/* VS - Center */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Enemy Team - Right */}
          <View style={styles.teamColumn}>
            <Text style={styles.teamLabel}>ENEMY</Text>
            <View style={styles.mythlingsList}>
              {battleState.enemyTeam.mythlings.map((mythling, index) =>
                renderMythling(mythling, false, index),
              )}
            </View>
          </View>
        </View>
      </View>
      {/* Battle Over Overlay - Statistics Screen */}
      {battleState.isBattleOver && (
        <View style={styles.battleOverContainer}>
          <LinearGradient
            colors={['#FF8C00', '#FF6B00', '#FF4500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.statsGradientBackground}
          />

          <View style={styles.statsContent}>
            {/* Header */}
            <Text style={styles.statsWinnerText}>
              {battleState.winner === 'player' ? 'VICTORY!' : 'DEFEAT'}
            </Text>
            <Text style={styles.statsSubtitleText}>FLOOR 5 CLEARED</Text>

            {/* Statistics Panel */}
            <View style={styles.statsPanel}>
              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}></Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderIcon}>⚔️</Text>
                  <Text style={styles.tableHeaderText}>DMG</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderIcon}>🛡️</Text>
                  <Text style={styles.tableHeaderText}>DEF</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderIcon}>❤️</Text>
                  <Text style={styles.tableHeaderText}>HEAL</Text>
                </View>
              </View>

              {/* Player Team Statistics */}
              <View style={styles.tableBody}>
                {battleState.playerTeam.mythlings.map((mythling) => (
                  <View key={mythling.id} style={styles.tableRow}>
                    {/* Mythling Cell */}
                    <View style={styles.tableCell}>
                      <View style={styles.tableAvatarContainer}>
                        <Text style={styles.tableAvatarEmoji}>
                          {mythling.emoji}
                        </Text>
                      </View>
                      <Text style={styles.tableCellText}>{mythling.name}</Text>
                    </View>
                    {/* Damage Cell */}
                    <View style={styles.tableCell}>
                      <View style={styles.progressBarContainer}>
                        <Text style={styles.progressValueText}>
                          {mythling.damageDealt}
                        </Text>
                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFill,
                              styles.damageProgressBar,
                              {
                                width: `${Math.min(
                                  100,
                                  (mythling.damageDealt / 300) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                    {/* Damage Received Cell */}
                    <View style={styles.tableCell}>
                      <View style={styles.progressBarContainer}>
                        <Text style={styles.progressValueText}>
                          {mythling.damageReceived}
                        </Text>
                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFill,
                              styles.defenseProgressBar,
                              {
                                width: `${Math.min(
                                  100,
                                  (mythling.damageReceived / 300) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                    {/* Healing Cell */}
                    <View style={styles.tableCell}>
                      <View style={styles.progressBarContainer}>
                        <Text style={styles.progressValueText}>
                          {mythling.healingDone}
                        </Text>
                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFill,
                              styles.healingProgressBar,
                              {
                                width: `${Math.min(
                                  100,
                                  (mythling.healingDone / 300) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* DONE Button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.replace('/game/home-screen')}>
              <Text style={styles.doneButtonText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Ability Panel - Bottom */}
      {!battleState.isBattleOver && currentPlayerMythling && (
        <View style={[styles.abilityPanel, { paddingBottom: insets.bottom }]}>
          {/* Ability Details */}
          {battleState.selectedAbility ? (
            <View style={styles.abilityDetails}>
              <View style={styles.abilityInfoRow}>
                <Text style={styles.abilityName}>
                  {battleState.selectedAbility.name}
                </Text>
                <View style={styles.abilityStats}>
                  <Text style={styles.abilityDamage}>
                    DMG: {battleState.selectedAbility.damage}
                  </Text>
                  <Text style={styles.abilityCooldown}>
                    CD: {battleState.selectedAbility.cooldown}
                  </Text>
                </View>
              </View>
              <Text style={styles.abilityDescription}>
                {battleState.selectedAbility.description}
              </Text>
            </View>
          ) : (
            <View style={styles.abilityDetails}>
              <Text style={styles.selectAbilityText}>
                Select an ability to attack
              </Text>
            </View>
          )}

          {/* Ability Icons */}
          <View style={styles.abilityIcons}>
            {currentPlayerMythling.abilities.map((ability) => {
              const isSelected = battleState.selectedAbility?.id === ability.id;
              const cooldownRemaining = abilityCooldowns[ability.id] || 0;
              const isOnCooldown = cooldownRemaining > 0;

              return (
                <TouchableOpacity
                  key={ability.id}
                  style={[
                    styles.abilityIcon,
                    isSelected && styles.selectedAbilityIcon,
                    isOnCooldown && styles.cooldownIcon,
                  ]}
                  onPress={() => handleAbilitySelect(ability)}
                  disabled={!isPlayerTurn || isOnCooldown}
                  activeOpacity={0.8}>
                  <Text style={styles.abilityIconText}>{ability.icon}</Text>
                  {isSelected && <View style={styles.selectedRing} />}
                  {isOnCooldown && (
                    <View style={styles.cooldownOverlay}>
                      <Text style={styles.cooldownText}>
                        {cooldownRemaining}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mountainOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  mountain1: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    width: 0,
    height: 0,
    borderLeftWidth: 150,
    borderRightWidth: 150,
    borderBottomWidth: 300,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(67, 56, 202, 0.6)',
  },
  mountain2: {
    position: 'absolute',
    bottom: 0,
    left: '40%',
    width: 0,
    height: 0,
    borderLeftWidth: 120,
    borderRightWidth: 120,
    borderBottomWidth: 250,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(124, 58, 237, 0.5)',
  },
  mountain3: {
    position: 'absolute',
    bottom: 0,
    right: '5%',
    width: 0,
    height: 0,
    borderLeftWidth: 180,
    borderRightWidth: 180,
    borderBottomWidth: 350,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(168, 85, 247, 0.4)',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  headerSpacer: {
    width: 44,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    marginTop: 20,
    flex: 1,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
  },
  teamLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  mythlingsList: {
    gap: 12,
    width: '100%',
    alignItems: 'center',
  },
  mythlingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    width: 120,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  playerCard: {
    borderColor: 'rgba(99, 102, 241, 0.6)',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  enemyCard: {
    borderColor: 'rgba(239, 68, 68, 0.6)',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  targetCard: {
    borderColor: '#FBBF24',
    borderWidth: 3,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  currentTurnCard: {
    borderColor: '#10B981',
    borderWidth: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  defeatedCard: {
    opacity: 0.4,
  },
  mythlingImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mythlingEmoji: {
    fontSize: 48,
  },
  mythlingImage: {
    width: 48,
    height: 48,
  },
  turnIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mythlingInfo: {
    width: '100%',
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  mythlingName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Bungee_400Regular',
  },
  healthBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  healthBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  healthHigh: {
    backgroundColor: '#10B981',
  },
  healthLow: {
    backgroundColor: '#EF4444',
  },
  healthText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  vsText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  battleOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  winnerText: {
    fontSize: 56,
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
    textShadowColor: '#000000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  abilityPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 27, 75, 0.95)',
    borderTopWidth: 2,
    borderTopColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  abilityDetails: {
    marginBottom: 16,
  },
  abilityInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  abilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  abilityStats: {
    flexDirection: 'row',
    gap: 16,
  },
  abilityDamage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
    fontFamily: 'Bungee_400Regular',
  },
  abilityCooldown: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366F1',
    fontFamily: 'Bungee_400Regular',
  },
  abilityDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Bungee_400Regular',
  },
  selectAbilityText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Bungee_400Regular',
    textAlign: 'center',
    paddingVertical: 8,
  },
  abilityIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  abilityIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  selectedAbilityIcon: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  cooldownIcon: {
    opacity: 0.5,
    borderColor: '#9CA3AF',
  },
  abilityIconText: {
    fontSize: 40,
  },
  selectedRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: '#6366F1',
  },
  cooldownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cooldownText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  // Statistics Screen Styles
  statsGradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statsContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: 20,
    width: '90%',
  },
  statsWinnerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    marginBottom: 8,
  },
  statsSubtitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 24,
  },
  statsPanel: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 10,
    width: '100%',
    marginBottom: 20,
    flexShrink: 0,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  tableHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  tableHeaderIcon: {
    fontSize: 14,
    marginBottom: 1,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  tableBody: {
    gap: 3,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableAvatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  tableAvatarEmoji: {
    fontSize: 16,
  },
  tableCellText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    textAlign: 'center',
  },
  tableValueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    marginBottom: 2,
  },
  progressBarContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  damageProgressBar: {
    backgroundColor: '#EF4444',
  },
  defenseProgressBar: {
    backgroundColor: '#3B82F6',
  },
  healingProgressBar: {
    backgroundColor: '#10B981',
  },
  progressValueText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  characterComment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  characterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  characterAvatarEmoji: {
    fontSize: 32,
  },
  commentBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  commentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  doneButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#60A5FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 'auto',
  },
  doneButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
    fontFamily: 'Bungee_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Bungee_400Regular',
  },
  errorButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
});
