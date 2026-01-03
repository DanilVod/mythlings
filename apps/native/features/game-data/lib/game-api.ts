import { queryClient, trpc } from '@/shared/api/trpc';

export interface GameFloor {
  id: string;
  floorNumber: number;
  difficulty: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  monsters: Array<{
    id: string;
    floorId: string;
    mythlingId: string;
    quantity: number;
    position: number;
    createdAt: string;
    mythling: {
      id: string;
      name: string;
      type: 'fire' | 'water' | 'earth';
      description: string | null;
      icon: string;
      basePower: number;
      baseHealth: number;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
      createdAt: string;
      updatedAt: string;
      abilities: Array<{
        id: string;
        mythlingId: string;
        abilityId: string;
        createdAt: string;
        ability: {
          id: string;
          name: string;
          damage: number;
          cooldown: number;
          description: string | null;
          icon: string;
          createdAt: string;
          updatedAt: string;
        };
      }>;
    };
  }>;
  rewards: Array<{
    id: string;
    floorId: string;
    rewardType: 'gold' | 'gems' | 'mythling' | 'equipment';
    rewardId: string | null;
    quantity: number;
    createdAt: string;
  }>;
}

export interface GameMythling {
  id: string;
  name: string;
  type: 'fire' | 'water' | 'earth';
  description: string | null;
  icon: string;
  basePower: number;
  baseHealth: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt: string;
  updatedAt: string;
  abilities: Array<{
    id: string;
    mythlingId: string;
    abilityId: string;
    createdAt: string;
    ability: {
      id: string;
      name: string;
      damage: number;
      cooldown: number;
      description: string | null;
      icon: string;
      createdAt: string;
      updatedAt: string;
    };
  }>;
}

export interface GameAbility {
  id: string;
  name: string;
  damage: number;
  cooldown: number;
  description: string | null;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

// Fetch all floors from server
export async function fetchFloors(): Promise<GameFloor[]> {
  try {
    const result = await queryClient.fetchQuery({
      ...trpc.game.floors.getAll.queryOptions(),
    });
    console.log(result);
    return result;
  } catch (error) {
    console.error('Failed to fetch floors:', error);
    return [];
  }
}

// Fetch all mythlings from server
export async function fetchMythlings(): Promise<GameMythling[]> {
  try {
    const result = await queryClient.fetchQuery({
      ...trpc.game.mythlings.getAll.queryOptions(),
    });
    return result;
  } catch (error) {
    console.error('Failed to fetch mythlings:', error);
    return [];
  }
}

// Fetch all abilities from server
export async function fetchAbilities(): Promise<GameAbility[]> {
  try {
    const result = await queryClient.fetchQuery({
      ...trpc.game.abilities.getAll.queryOptions(),
    });
    return result;
  } catch (error) {
    console.error('Failed to fetch abilities:', error);
    return [];
  }
}

// Fetch specific floor by number
export async function fetchFloorByNumber(
  floorNumber: number,
): Promise<GameFloor | null> {
  try {
    const floors = await fetchFloors();
    return floors.find((f) => f.floorNumber === floorNumber) || null;
  } catch (error) {
    console.error('Failed to fetch floor:', error);
    return null;
  }
}

// Fetch starter mythlings for character selection (3 random common mythlings, one of each type)
export async function fetchStarterMythlings(): Promise<GameMythling[]> {
  try {
    const result = await queryClient.fetchQuery({
      ...trpc.game.mythlings.getStarterMythlings.queryOptions(),
    });
    return result as GameMythling[];
  } catch (error) {
    console.error('Failed to fetch starter mythlings:', error);
    return [];
  }
}
