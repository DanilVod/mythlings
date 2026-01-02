import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  BattleMythling,
  BattleTeam,
  BattleState,
  Ability,
} from '@/lib/battle-types';
import { MythlingType } from '@/lib/mythling-types';

export default function BattleScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();

  // Track cooldowns for abilities: { abilityId: remainingTurns }
  const [abilityCooldowns, setAbilityCooldowns] = useState<
    Record<string, number>
  >({});

  // Initialize with default teams
  const [battleState, setBattleState] = useState<BattleState>(() => {
    const playerTeam: BattleTeam = {
      mythlings: [
        {
          id: 'player-1',
          name: 'Phoenix',
          emoji: '🔥',
          type: MythlingType.FIRE,
          power: 120,
          maxHealth: 100,
          currentHealth: 100,
          isPlayer: true,
          damageDealt: 0,
          damageReceived: 0,
          healingDone: 0,
          abilities: [
            {
              id: 'fireball',
              name: 'Fireball',
              icon: '🔥',
              damage: 25,
              cooldown: 1,
              description: 'Launch a powerful fireball at the enemy',
            },
            {
              id: 'flame-charge',
              name: 'Flame Charge',
              icon: '⚡',
              damage: 35,
              cooldown: 2,
              description: 'Charge forward with burning flames',
            },
            {
              id: 'inferno',
              name: 'Inferno',
              icon: '💥',
              damage: 50,
              cooldown: 3,
              description: 'Unleash devastating inferno damage',
            },
          ],
        },
        {
          id: 'player-2',
          name: 'Aqua',
          emoji: '💧',
          type: MythlingType.WATER,
          power: 115,
          maxHealth: 90,
          currentHealth: 90,
          isPlayer: true,
          damageDealt: 0,
          damageReceived: 0,
          healingDone: 0,
          abilities: [
            {
              id: 'water-jet',
              name: 'Water Jet',
              icon: '💧',
              damage: 20,
              cooldown: 1,
              description: 'Quick water strike',
            },
            {
              id: 'tidal-wave',
              name: 'Tidal Wave',
              icon: '🌊',
              damage: 30,
              cooldown: 2,
              description: 'Powerful tidal wave attack',
            },
            {
              id: 'healing-rain',
              name: 'Healing Rain',
              icon: '🌧️',
              damage: 45,
              cooldown: 3,
              description: 'Summon healing rain',
            },
          ],
        },
      ],
      totalPower: 235,
    };
    const enemyTeam: BattleTeam = {
      mythlings: [
        {
          id: 'enemy-1',
          name: 'Terra',
          emoji: '🌍',
          type: MythlingType.EARTH,
          power: 110,
          maxHealth: 95,
          currentHealth: 95,
          isPlayer: false,
          damageDealt: 0,
          damageReceived: 0,
          healingDone: 0,
          abilities: [
            {
              id: 'rock-throw',
              name: 'Rock Throw',
              icon: '🪨',
              damage: 22,
              cooldown: 1,
              description: 'Throw a rock at the enemy',
            },
            {
              id: 'earthquake',
              name: 'Earthquake',
              icon: '🌍',
              damage: 32,
              cooldown: 2,
              description: 'Shake the ground',
            },
            {
              id: 'stone-wall',
              name: 'Stone Wall',
              icon: '🧱',
              damage: 48,
              cooldown: 3,
              description: 'Create a defensive barrier',
            },
          ],
        },
        {
          id: 'enemy-2',
          name: 'Ignis',
          emoji: '🔥',
          type: MythlingType.FIRE,
          power: 125,
          maxHealth: 100,
          currentHealth: 100,
          isPlayer: false,
          damageDealt: 0,
          damageReceived: 0,
          healingDone: 0,
          abilities: [
            {
              id: 'fireball',
              name: 'Fireball',
              icon: '🔥',
              damage: 20,
              cooldown: 1,
              description: 'Launch a fireball',
            },
            {
              id: 'flame-burst',
              name: 'Flame Burst',
              icon: '💥',
              damage: 35,
              cooldown: 2,
              description: 'Quick burst of flames',
            },
            {
              id: 'inferno',
              name: 'Inferno',
              icon: '🌋',
              damage: 55,
              cooldown: 3,
              description: 'Devastating inferno attack',
            },
          ],
        },
      ],
      totalPower: 235,
    };
    return {
      playerTeam,
      enemyTeam,
      currentTurn: 'player',
      selectedAbility: null,
      selectedTarget: null,
      battleLog: ['Battle started!'],
      isBattleOver: false,
      winner: null,
    };
  });

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

    // Track statistics - preserve all mythling health values
    const updatedPlayerTeam = {
      ...battleState.playerTeam,
      mythlings: battleState.playerTeam.mythlings.map((m) => {
        if (m.id === currentPlayerMythling.id) {
          return {
            ...m,
            damageDealt: m.damageDealt + damage,
            currentHealth: m.currentHealth, // Explicitly preserve health
          };
        }
        // Explicitly preserve all properties for other player mythlings
        return {
          ...m,
          currentHealth: m.currentHealth, // Explicitly preserve health
        };
      }),
    };

    const updatedEnemyTeam = {
      ...battleState.enemyTeam,
      mythlings: battleState.enemyTeam.mythlings.map((m) => {
        if (m.id === targetId) {
          return {
            ...m,
            currentHealth: newEnemyHealth,
            damageReceived: m.damageReceived + damage,
          };
        }
        // Explicitly preserve health for other enemy mythlings
        return {
          ...m,
          currentHealth: m.currentHealth, // Explicitly preserve health
        };
      }),
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
    const aliveEnemies = battleState.enemyTeam.mythlings.filter(
      (m) => m.currentHealth > 0,
    );
    const alivePlayers = battleState.playerTeam.mythlings.filter(
      (m) => m.currentHealth > 0,
    );

    if (aliveEnemies.length === 0 || alivePlayers.length === 0) return;

    // Select a random alive enemy to attack
    const attacker =
      aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    const target =
      alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    const ability =
      attacker.abilities[Math.floor(Math.random() * attacker.abilities.length)];
    const damage = ability.damage;
    const newPlayerHealth = Math.max(0, target.currentHealth - damage);

    // Track statistics - preserve all enemy mythling health values
    const updatedEnemyTeam = {
      ...battleState.enemyTeam,
      mythlings: battleState.enemyTeam.mythlings.map((m) => {
        if (m.id === attacker.id) {
          // Update attacker's damageDealt but preserve currentHealth
          return {
            ...m,
            damageDealt: m.damageDealt + damage,
            currentHealth: m.currentHealth, // Explicitly preserve health
          };
        }
        // Explicitly preserve all properties for other enemy mythlings
        return {
          ...m,
          currentHealth: m.currentHealth, // Explicitly preserve health
        };
      }),
    };

    const updatedPlayerTeam = {
      ...battleState.playerTeam,
      mythlings: battleState.playerTeam.mythlings.map((m) =>
        m.id === target.id
          ? {
              ...m,
              currentHealth: newPlayerHealth,
              damageReceived: m.damageReceived + damage,
            }
          : {
              ...m,
              currentHealth: m.currentHealth, // Preserve health for other player mythlings
            },
      ),
    };

    const newLog = [
      ...battleState.battleLog,
      `${attacker.name} used ${ability.name}!`,
      `Dealt ${damage} damage to ${target.name}!`,
    ];

    const alivePlayersAfter = updatedPlayerTeam.mythlings.filter(
      (m) => m.currentHealth > 0,
    );
    const isEnemyWinner = alivePlayersAfter.length === 0;

    setBattleState((prev) => ({
      ...prev,
      enemyTeam: updatedEnemyTeam,
      playerTeam: updatedPlayerTeam,
      battleLog: newLog,
      isBattleOver: isEnemyWinner,
      winner: isEnemyWinner ? 'enemy' : null,
      currentTurn: isEnemyWinner ? 'enemy' : 'player',
    }));

    // Update currentEnemyIndex to the attacker for visual consistency
    const attackerIndex = battleState.enemyTeam.mythlings.indexOf(attacker);
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
        const currentPlayerIdx = battleState.playerTeam.mythlings.indexOf(
          currentPlayerMythling!,
        );
        let nextPlayerIndex =
          (currentPlayerIdx + 1) % battleState.playerTeam.mythlings.length;

        // Skip dead mythlings
        let attempts = 0;
        while (
          battleState.playerTeam.mythlings[nextPlayerIndex].currentHealth <=
            0 &&
          attempts < battleState.playerTeam.mythlings.length
        ) {
          nextPlayerIndex =
            (nextPlayerIndex + 1) % battleState.playerTeam.mythlings.length;
          attempts++;
        }

        setCurrentPlayerIndex(nextPlayerIndex);
      }
    } else {
      // Show statistics screen after defeat (don't navigate yet)
    }
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
          <Text style={styles.mythlingEmoji}>{mythling.emoji}</Text>
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

        {/* Teams Container */}
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
              {/* Column Headers */}
              <View style={styles.statsHeaderRow}>
                <View style={styles.statHeaderItem}>
                  <Text style={styles.statHeaderIcon}>⚔️</Text>
                  <Text style={styles.statHeaderText}>DMG</Text>
                </View>
                <View style={styles.statHeaderItem}>
                  <Text style={styles.statHeaderIcon}>🛡️</Text>
                  <Text style={styles.statHeaderText}>DEF</Text>
                </View>
                <View style={styles.statHeaderItem}>
                  <Text style={styles.statHeaderIcon}>❤️</Text>
                  <Text style={styles.statHeaderText}>HP</Text>
                </View>
              </View>

              {/* Player Team Statistics */}
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionLabel}>YOUR TEAM</Text>
                {battleState.playerTeam.mythlings.map((mythling) => (
                  <View key={mythling.id} style={styles.statRow}>
                    <View style={styles.statAvatarContainer}>
                      <Text style={styles.statAvatarEmoji}>
                        {mythling.emoji}
                      </Text>
                    </View>
                    <View style={styles.statBarsContainer}>
                      <View style={styles.statBarRow}>
                        <View style={styles.statBarBackground}>
                          <View
                            style={[
                              styles.statBarFill,
                              styles.damageBar,
                              {
                                width: `${Math.min(
                                  100,
                                  (mythling.damageDealt / 100) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.statValue}>
                          {mythling.damageDealt}
                        </Text>
                      </View>
                      <View style={styles.statBarRow}>
                        <View style={styles.statBarBackground}>
                          <View
                            style={[
                              styles.statBarFill,
                              styles.defenseBar,
                              {
                                width: `${Math.min(
                                  100,
                                  (mythling.damageReceived / 100) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.statValue}>
                          {mythling.damageReceived}
                        </Text>
                      </View>
                      <View style={styles.statBarRow}>
                        <View style={styles.statBarBackground}>
                          <View
                            style={[
                              styles.statBarFill,
                              styles.healingBar,
                              {
                                width: `${Math.min(
                                  100,
                                  (mythling.healingDone / 100) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.statValue}>
                          {mythling.healingDone}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Enemy Team Statistics */}
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionLabel}>ENEMY TEAM</Text>
                {battleState.enemyTeam.mythlings.map((mythling) => (
                  <View key={mythling.id} style={styles.statRow}>
                    <View style={styles.statAvatarContainer}>
                      <Text style={styles.statAvatarEmoji}>
                        {mythling.emoji}
                      </Text>
                    </View>
                    <View style={styles.statBarsContainer}>
                      <View style={styles.statBarRow}>
                        <View style={styles.statBarBackground}>
                          <View
                            style={[
                              styles.statBarFill,
                              styles.damageBar,
                              {
                                width: `${Math.min(
                                  100,
                                  (mythling.damageDealt / 100) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.statValue}>
                          {mythling.damageDealt}
                        </Text>
                      </View>
                      <View style={styles.statBarRow}>
                        <View style={styles.statBarBackground}>
                          <View
                            style={[
                              styles.statBarFill,
                              styles.defenseBar,
                              {
                                width: `${Math.min(
                                  100,
                                  (mythling.damageReceived / 100) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.statValue}>
                          {mythling.damageReceived}
                        </Text>
                      </View>
                      <View style={styles.statBarRow}>
                        <View style={styles.statBarBackground}>
                          <View
                            style={[
                              styles.statBarFill,
                              styles.healingBar,
                              {
                                width: `${Math.min(
                                  100,
                                  (mythling.healingDone / 100) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.statValue}>
                          {mythling.healingDone}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Character Comment */}
            <View style={styles.characterComment}>
              <View style={styles.characterAvatar}>
                <Text style={styles.characterAvatarEmoji}>🔥</Text>
              </View>
              <View style={styles.commentBubble}>
                <Text style={styles.commentText}>Awww yeah!</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
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
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeaderItem: {
    alignItems: 'center',
  },
  statHeaderIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  statsSection: {
    marginBottom: 20,
  },
  statsSectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  statAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statAvatarEmoji: {
    fontSize: 28,
  },
  statBarsContainer: {
    flex: 1,
    gap: 6,
  },
  statBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 8,
  },
  statBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  damageBar: {
    backgroundColor: '#EF4444',
  },
  defenseBar: {
    backgroundColor: '#3B82F6',
  },
  healingBar: {
    backgroundColor: '#10B981',
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    minWidth: 30,
    textAlign: 'right',
  },
  characterComment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
});
