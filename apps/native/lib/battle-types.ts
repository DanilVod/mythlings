import { MythlingType } from './mythling-types';

export interface Ability {
  id: string;
  name: string;
  damage: number;
  cooldown: number;
  description: string;
  icon: string;
}

export interface BattleMythling {
  id: string;
  type: MythlingType;
  name: string;
  emoji: string;
  power: number;
  maxHealth: number;
  currentHealth: number;
  abilities: Ability[];
  isPlayer: boolean;
  damageDealt: number;
  damageReceived: number;
  healingDone: number;
}

export interface BattleTeam {
  mythlings: BattleMythling[];
  totalPower: number;
}

export interface BattleState {
  playerTeam: BattleTeam;
  enemyTeam: BattleTeam;
  currentTurn: 'player' | 'enemy';
  selectedAbility: Ability | null;
  selectedTarget: string | null;
  battleLog: string[];
  isBattleOver: boolean;
  winner: 'player' | 'enemy' | null;
}

// Predefined abilities for each mythling type
export const ABILITIES: Record<MythlingType, Ability[]> = {
  [MythlingType.FIRE]: [
    {
      id: 'fireball',
      name: 'Fireball',
      damage: 25,
      cooldown: 2,
      description: 'Launch a powerful fireball at the enemy',
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
  [MythlingType.WATER]: [
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
  [MythlingType.EARTH]: [
    {
      id: 'rock_throw',
      name: 'Rock Throw',
      damage: 20,
      cooldown: 1,
      description: 'Throw a rock at the enemy',
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

// Generate random enemy team
export function generateEnemyTeam(difficulty: number = 1): BattleTeam {
  const types = Object.values(MythlingType);
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
      emoji:
        type === MythlingType.FIRE
          ? '🔥'
          : type === MythlingType.WATER
          ? '💧'
          : '🌍',
      power,
      maxHealth,
      currentHealth: maxHealth,
      abilities: ABILITIES[type],
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

// Create player team from selected mythlings
export function createPlayerTeam(selectedTypes: MythlingType[]): BattleTeam {
  const mythlings: BattleMythling[] = selectedTypes.map((type, index) => {
    const power = 15 + Math.floor(Math.random() * 10);
    const maxHealth = 100;

    return {
      id: `player-${index}`,
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      emoji:
        type === MythlingType.FIRE
          ? '🔥'
          : type === MythlingType.WATER
          ? '💧'
          : '🌍',
      power,
      maxHealth,
      currentHealth: maxHealth,
      abilities: ABILITIES[type],
      isPlayer: true,
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
