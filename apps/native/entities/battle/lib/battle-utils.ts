import type { GameFloor, GameMythling } from '@features/game-data/lib/game-api';
import type { MythlingType } from '@entities/mythling/model/types';
import type { Ability, BattleMythling, BattleTeam } from '../model/types';

// Default fallback abilities for each mythling type (used when no server data available)
const DEFAULT_ABILITIES: Record<MythlingType, Ability[]> = {
  fire: [
    {
      id: 'fireball',
      name: 'Fireball',
      damage: 25,
      cooldown: 2,
      description: 'Launch a powerful fireball at enemy',
      icon: '🔥',
    },
    {
      id: 'flame_burst',
      name: 'Flame Burst',
      damage: 15,
      cooldown: 1,
      description: 'Quick burst of flames',
      icon: '💥',
    },
    {
      id: 'inferno',
      name: 'Inferno',
      damage: 40,
      cooldown: 3,
      description: 'Devastating inferno attack',
      icon: '🌋',
    },
  ],
  water: [
    {
      id: 'water_jet',
      name: 'Water Jet',
      damage: 20,
      cooldown: 2,
      description: 'High-pressure water blast',
      icon: '💧',
    },
    {
      id: 'tidal_wave',
      name: 'Tidal Wave',
      damage: 30,
      cooldown: 3,
      description: 'Massive wave of water',
      icon: '🌊',
    },
    {
      id: 'healing_rain',
      name: 'Healing Rain',
      damage: 0,
      cooldown: 4,
      description: 'Restore health to ally',
      icon: '🌧️',
    },
  ],
  earth: [
    {
      id: 'rock_throw',
      name: 'Rock Throw',
      damage: 20,
      cooldown: 1,
      description: 'Throw a rock at enemy',
      icon: '🪨',
    },
    {
      id: 'earthquake',
      name: 'Earthquake',
      damage: 35,
      cooldown: 3,
      description: 'Shake the ground',
      icon: '🌍',
    },
    {
      id: 'stone_wall',
      name: 'Stone Wall',
      damage: 0,
      cooldown: 4,
      description: 'Create a defensive barrier',
      icon: '🧱',
    },
  ],
};

// Get abilities for a mythling type from server data
export function getAbilitiesForMythlingType(
  type: MythlingType,
  mythlings: GameMythling[],
): Ability[] {
  const mythling = mythlings.find((m) => m.type === type);
  if (mythling && mythling.abilities && mythling.abilities.length > 0) {
    return mythling.abilities.map((abilityData) => ({
      id: abilityData.ability.id,
      name: abilityData.ability.name,
      damage: abilityData.ability.damage,
      cooldown: abilityData.ability.cooldown,
      description: abilityData.ability.description || '',
      icon: abilityData.ability.icon,
    }));
  }
  return DEFAULT_ABILITIES[type];
}

// Generate random enemy team
export function generateEnemyTeam(difficulty: number = 1): BattleTeam {
  const types: MythlingType[] = ['fire', 'water', 'earth'];
  const mythlings: BattleMythling[] = [];
  const teamSize = Math.min(4, 2 + Math.floor(difficulty / 2));

  for (let i = 0; i < teamSize; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const power = 10 + difficulty * 5 + Math.floor(Math.random() * 10);
    const maxHealth = 100 + difficulty * 20;

    mythlings.push({
      id: `enemy-${i}`,
      type,
      name: `Enemy ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      emoji: type === 'fire' ? '🔥' : type === 'water' ? '💧' : '🌍',
      power,
      maxHealth,
      currentHealth: maxHealth,
      abilities: DEFAULT_ABILITIES[type],
      isPlayer: false,
      damageDealt: 0,
      damageReceived: 0,
      healingDone: 0,
    });
  }

  const totalPower = mythlings.reduce((sum, m) => sum + m.power, 0);

  return {
    mythlings,
    totalPower,
  };
}

// Create enemy team from floor data
export function createEnemyTeamFromFloor(floor: GameFloor): BattleTeam {
  const mythlings: BattleMythling[] = floor.monsters.map((monster, index) => {
    const mythlingData = monster.mythling;
    const type = mythlingData.type as MythlingType;

    // Convert server abilities to battle abilities
    const abilities: Ability[] = mythlingData.abilities?.map((abilityData) => ({
      id: abilityData.ability.id,
      name: abilityData.ability.name,
      damage: abilityData.ability.damage,
      cooldown: abilityData.ability.cooldown,
      description: abilityData.ability.description || '',
      icon: abilityData.ability.icon,
    }));

    // Use base power and health from server, adjusted by floor difficulty
    const difficultyMultiplier = 1 + (floor.difficulty - 1) * 0.2;
    const power = Math.floor(mythlingData.basePower * difficultyMultiplier);
    const maxHealth = Math.floor(
      mythlingData.baseHealth * difficultyMultiplier,
    );

    return {
      id: `enemy-${index}`,
      type,
      name: mythlingData.name,
      emoji: mythlingData.icon || '👾',
      power,
      maxHealth,
      currentHealth: maxHealth,
      abilities,
      isPlayer: false,
      damageDealt: 0,
      damageReceived: 0,
      healingDone: 0,
    };
  });

  const totalPower = mythlings.reduce((sum, m) => sum + m.power, 0);

  return {
    mythlings,
    totalPower,
  };
}

// Create player team from selected mythlings
export function createPlayerTeam(
  selectedTypes: MythlingType[],
  mythlings: GameMythling[],
): BattleTeam {
  const battleMythlings: BattleMythling[] = selectedTypes.map((type, index) => {
    const mythlingData = mythlings.find((m) => m.type === type);

    // Use server data if available, otherwise use defaults
    const power =
      mythlingData?.basePower || 15 + Math.floor(Math.random() * 10);
    const maxHealth = mythlingData?.baseHealth || 100;
    const icon =
      mythlingData?.icon ||
      (type === 'fire' ? '🔥' : type === 'water' ? '💧' : '🌍');
    const name =
      mythlingData?.name || type.charAt(0).toUpperCase() + type.slice(1);

    // Get abilities from server data or use defaults
    const abilities = getAbilitiesForMythlingType(type, mythlings);

    return {
      id: `player-${index}`,
      type,
      name,
      emoji: icon,
      power,
      maxHealth,
      currentHealth: maxHealth,
      abilities,
      isPlayer: true,
      damageDealt: 0,
      damageReceived: 0,
      healingDone: 0,
    };
  });

  const totalPower = battleMythlings.reduce((sum, m) => sum + m.power, 0);

  return {
    mythlings: battleMythlings,
    totalPower,
  };
}
