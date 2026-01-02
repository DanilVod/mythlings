import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/utils/trpc';
import { authClient } from '@/lib/auth-client';

// Storage keys
const STORAGE_KEYS = {
  USERNAME: '@mythlings:username',
  CHARACTER_TYPE: '@mythlings:character_type',
  CURRENT_FLOOR: '@mythlings:current_floor',
  TOTAL_FLOORS: '@mythlings:total_floors',
  GOLD: '@mythlings:gold',
  GEMS: '@mythlings:gems',
  INVENTORY: '@mythlings:inventory',
  COLLECTIONS: '@mythlings:collections',
  ONBOARDING_COMPLETED: '@mythlings:onboarding_completed',
};

// Game data types
export interface GameProfile {
  username: string;
  characterType: 'fire' | 'water' | 'earth';
  currentFloor: number;
  totalFloors: number;
  gold: number;
  gems: number;
}

export interface InventoryItem {
  itemType: string;
  itemId: string;
  itemName: string;
  quantity: number;
  rarity?: string | null;
}

export interface CollectionItem {
  collectionType: string;
  itemId: string;
}

// Check if user is authenticated
export const checkIsAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await authClient.getSession();
    return !!session.data?.session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Check if onboarding is completed
export const checkOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const profile = await getGameProfile();
    return profile !== null;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// Mark onboarding as completed
export const completeOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};

// Reset onboarding (for testing purposes)
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USERNAME,
      STORAGE_KEYS.CHARACTER_TYPE,
      STORAGE_KEYS.ONBOARDING_COMPLETED,
    ]);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    throw error;
  }
};

// Get game profile
export const getGameProfile = async (): Promise<GameProfile | null> => {
  try {
    const authenticated = await checkIsAuthenticated();

    if (authenticated) {
      // Fetch from database
      const profile = await trpcClient.game.getProfile.query();
      if (profile) {
        // Cache in AsyncStorage
        await cacheGameProfile(profile);
        return {
          username: profile.username,
          characterType: profile.characterType as 'fire' | 'water' | 'earth',
          currentFloor: profile.currentFloor,
          totalFloors: profile.totalFloors,
          gold: profile.gold,
          gems: profile.gems,
        };
      }
    }

    // Fallback to local storage
    const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
    const characterType = await AsyncStorage.getItem(
      STORAGE_KEYS.CHARACTER_TYPE,
    );
    const currentFloor = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_FLOOR);
    const totalFloors = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_FLOORS);
    const gold = await AsyncStorage.getItem(STORAGE_KEYS.GOLD);
    const gems = await AsyncStorage.getItem(STORAGE_KEYS.GEMS);

    if (username && characterType) {
      return {
        username,
        characterType: characterType as 'fire' | 'water' | 'earth',
        currentFloor: currentFloor ? parseInt(currentFloor, 10) : 1,
        totalFloors: totalFloors ? parseInt(totalFloors, 10) : 10,
        gold: gold ? parseInt(gold, 10) : 0,
        gems: gems ? parseInt(gems, 10) : 0,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting game profile:', error);
    return null;
  }
};

// Update game profile
export const updateGameProfile = async (
  updates: Partial<GameProfile>,
): Promise<void> => {
  try {
    const authenticated = await checkIsAuthenticated();

    if (authenticated) {
      // Update in database - server will create a new profile if it doesn't exist
      // Ensure username is provided (required for creating new profile)
      const currentProfile = await getGameProfile();
      const username = updates.username || currentProfile?.username || 'Player';

      await trpcClient.game.updateProfile.mutate({
        username,
        characterType: updates.characterType,
        currentFloor: updates.currentFloor,
        totalFloors: updates.totalFloors,
        gold: updates.gold,
        gems: updates.gems,
      });
    }

    // Update in local storage
    if (updates.username !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, updates.username);
    }
    if (updates.characterType !== undefined) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CHARACTER_TYPE,
        updates.characterType,
      );
    }
    if (updates.currentFloor !== undefined) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_FLOOR,
        updates.currentFloor.toString(),
      );
    }
    if (updates.totalFloors !== undefined) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TOTAL_FLOORS,
        updates.totalFloors.toString(),
      );
    }
    if (updates.gold !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.GOLD, updates.gold.toString());
    }
    if (updates.gems !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.GEMS, updates.gems.toString());
    }
  } catch (error) {
    console.error('Error updating game profile:', error);
    throw error;
  }
};

// Get inventory
export const getInventory = async (): Promise<InventoryItem[]> => {
  try {
    const authenticated = await checkIsAuthenticated();

    if (authenticated) {
      // Fetch from database
      const inventory = await trpcClient.game.getInventory.query();
      if (inventory) {
        // Cache in AsyncStorage
        await cacheInventory(inventory);
        return inventory;
      }
    }

    // Fallback to local storage
    const inventoryJson = await AsyncStorage.getItem(STORAGE_KEYS.INVENTORY);
    return inventoryJson ? JSON.parse(inventoryJson) : [];
  } catch (error) {
    console.error('Error getting inventory:', error);
    return [];
  }
};

// Get collections
export const getCollections = async (): Promise<CollectionItem[]> => {
  try {
    const authenticated = await checkIsAuthenticated();

    if (authenticated) {
      // Fetch from database
      const collections = await trpcClient.game.getCollections.query();
      if (collections) {
        // Cache in AsyncStorage
        await cacheCollections(collections);
        return collections;
      }
    }

    // Fallback to local storage
    const collectionsJson = await AsyncStorage.getItem(
      STORAGE_KEYS.COLLECTIONS,
    );
    return collectionsJson ? JSON.parse(collectionsJson) : [];
  } catch (error) {
    console.error('Error getting collections:', error);
    return [];
  }
};

// Sync local data to server (used when connecting account)
export const syncLocalDataToServer = async (): Promise<void> => {
  try {
    const profile = await getGameProfile();
    const inventory = await getInventory();
    const collections = await getCollections();

    if (profile) {
      await trpcClient.game.syncProfile.mutate({
        ...profile,
        inventory,
        collections,
      });
    }
  } catch (error) {
    console.error('Error syncing local data to server:', error);
    throw error;
  }
};

// Cache helpers
const cacheGameProfile = async (profile: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, profile.username);
    await AsyncStorage.setItem(
      STORAGE_KEYS.CHARACTER_TYPE,
      profile.characterType,
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_FLOOR,
      profile.currentFloor.toString(),
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.TOTAL_FLOORS,
      profile.totalFloors.toString(),
    );
    await AsyncStorage.setItem(STORAGE_KEYS.GOLD, profile.gold.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.GEMS, profile.gems.toString());
  } catch (error) {
    console.error('Error caching game profile:', error);
  }
};

const cacheInventory = async (inventory: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.INVENTORY,
      JSON.stringify(inventory),
    );
  } catch (error) {
    console.error('Error caching inventory:', error);
  }
};

const cacheCollections = async (collections: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.COLLECTIONS,
      JSON.stringify(collections),
    );
  } catch (error) {
    console.error('Error caching collections:', error);
  }
};
