// Mythling types from server
export type MythlingType = 'fire' | 'water' | 'earth';

export interface Mythling {
  type: MythlingType;
  name: string;
  emoji: string;
  description: string;
}

export const MYTHLINGS: Mythling[] = [
  {
    type: 'fire',
    name: 'Ignis',
    emoji: '🔥',
    description: 'A fierce and passionate warrior',
  },
  {
    type: 'water',
    name: 'Aqua',
    emoji: '💧',
    description: 'A calm and wise protector',
  },
  {
    type: 'earth',
    name: 'Terra',
    emoji: '🌍',
    description: 'A strong and steadfast guardian',
  },
];

export function getMythlingByType(type: MythlingType): Mythling | undefined {
  return MYTHLINGS.find((m) => m.type === type);
}

export interface MythlingColorScheme {
  primary: string;
  secondary: string;
  backgroundGradient: [string, string];
  characterColor: string;
}

export const MYTHLING_SCHEMES: Record<MythlingType, MythlingColorScheme> = {
  fire: {
    primary: '#FF6B35',
    secondary: '#F7931E',
    backgroundGradient: ['#FF6B35', '#1E1B4B'],
    characterColor: '#FF6B35',
  },
  water: {
    primary: '#00B4D8',
    secondary: '#48CAE4',
    backgroundGradient: ['#00B4D8', '#1E1B4B'],
    characterColor: '#00B4D8',
  },
  earth: {
    primary: '#6B8E23',
    secondary: '#9ACD32',
    backgroundGradient: ['#6B8E23', '#1E1B4B'],
    characterColor: '#6B8E23',
  },
};

export function getMythlingScheme(type: MythlingType): MythlingColorScheme {
  return MYTHLING_SCHEMES[type];
}
