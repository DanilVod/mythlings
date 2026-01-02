import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getGameProfile,
  updateGameProfile,
  type GameProfile,
} from '@/lib/game-storage';

interface GameDataContextType {
  profile: GameProfile | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<GameProfile>) => Promise<void>;
  addGold: (amount: number) => Promise<void>;
  addGems: (amount: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const GameDataContext = createContext<GameDataContextType | undefined>(
  undefined,
);

export function GameDataProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const gameProfile = await getGameProfile();

      // If no profile exists for authenticated user, create a default one
      if (!gameProfile && isAuthenticated && user) {
        // Create default profile with user's name
        await updateGameProfile({
          username: user.name || 'Player',
          characterType: 'fire',
          currentFloor: 1,
          totalFloors: 10,
          gold: 0,
          gems: 0,
        });
        // Reload to get the newly created profile
        const newProfile = await getGameProfile();
        setProfile(newProfile);
      } else {
        setProfile(gameProfile);
      }
    } catch (error) {
      console.error('Error loading game profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [isAuthenticated, user]);

  const updateProfile = async (updates: Partial<GameProfile>) => {
    try {
      if (!profile) {
        console.error('No profile to update');
        return;
      }

      const updatedProfile = { ...profile, ...updates };
      await updateGameProfile(updates);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const addGold = async (amount: number) => {
    if (!profile) {
      console.error('No profile to update gold');
      return;
    }

    const newGold = Math.max(0, profile.gold + amount);
    await updateProfile({ gold: newGold });
  };

  const addGems = async (amount: number) => {
    if (!profile) {
      console.error('No profile to update gems');
      return;
    }

    const newGems = Math.max(0, profile.gems + amount);
    await updateProfile({ gems: newGems });
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <GameDataContext.Provider
      value={{
        profile,
        isLoading,
        updateProfile,
        addGold,
        addGems,
        refreshProfile,
      }}>
      {children}
    </GameDataContext.Provider>
  );
}

export function useGameData() {
  const context = useContext(GameDataContext);
  if (context === undefined) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
}
