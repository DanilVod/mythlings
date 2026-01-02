import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { protectedProcedure, router } from '../index';
import { db } from '@mythlings/db';
import {
  gameProfile,
  inventory as inventoryTable,
  collections as collectionsTable,
} from '@mythlings/db/schema/game';

const updateProfileSchema = z.object({
  username: z.string().min(2).max(20),
  characterType: z.enum(['fire', 'water', 'earth']).optional(),
  currentFloor: z.number().int().min(1).optional(),
  totalFloors: z.number().int().min(1).optional(),
  gold: z.number().int().min(0).optional(),
  gems: z.number().int().min(0).optional(),
});

const syncProfileSchema = z.object({
  username: z.string().min(2).max(20),
  characterType: z.enum(['fire', 'water', 'earth']),
  currentFloor: z.number().int().min(1),
  totalFloors: z.number().int().min(1),
  gold: z.number().int().min(0),
  gems: z.number().int().min(0),
  inventory: z
    .array(
      z.object({
        itemType: z.string(),
        itemId: z.string(),
        itemName: z.string(),
        quantity: z.number().int().min(1),
        rarity: z.string().nullable().optional(),
      }),
    )
    .optional(),
  collections: z
    .array(
      z.object({
        collectionType: z.string(),
        itemId: z.string(),
      }),
    )
    .optional(),
});

export const gameRouter = router({
  // Get user's game profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.query.gameProfile.findFirst({
      where: eq(gameProfile.userId, ctx.session.user.id),
    });

    if (!profile) {
      return null;
    }

    return profile;
  }),

  // Update game profile
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const existingProfile = await db.query.gameProfile.findFirst({
        where: eq(gameProfile.userId, ctx.session.user.id),
      });

      if (existingProfile) {
        // Update existing profile
        const [updatedProfile] = await db
          .update(gameProfile)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(gameProfile.userId, ctx.session.user.id))
          .returning();

        return updatedProfile;
      } else {
        // Create new profile
        const [newProfile] = await db
          .insert(gameProfile)
          .values({
            id: crypto.randomUUID(),
            userId: ctx.session.user.id,
            username: input.username,
            characterType: input.characterType || 'fire',
            currentFloor: input.currentFloor || 1,
            totalFloors: input.totalFloors || 10,
            gold: input.gold || 0,
            gems: input.gems || 0,
          })
          .returning();

        return newProfile;
      }
    }),

  // Sync local data to server (used when connecting account)
  syncProfile: protectedProcedure
    .input(syncProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if profile exists
      const existingProfile = await db.query.gameProfile.findFirst({
        where: eq(gameProfile.userId, userId),
      });

      if (existingProfile) {
        // Update existing profile
        await db
          .update(gameProfile)
          .set({
            username: input.username,
            characterType: input.characterType,
            currentFloor: input.currentFloor,
            totalFloors: input.totalFloors,
            gold: input.gold,
            gems: input.gems,
            updatedAt: new Date(),
          })
          .where(eq(gameProfile.userId, userId));
      } else {
        // Create new profile
        await db.insert(gameProfile).values({
          id: crypto.randomUUID(),
          userId,
          username: input.username,
          characterType: input.characterType,
          currentFloor: input.currentFloor,
          totalFloors: input.totalFloors,
          gold: input.gold,
          gems: input.gems,
        });
      }

      // Sync inventory if provided
      if (input.inventory && input.inventory.length > 0) {
        // Delete existing inventory items for this user
        await db
          .delete(inventoryTable)
          .where(eq(inventoryTable.userId, userId));

        // Insert new inventory items
        const inventoryItems = input.inventory.map((item) => ({
          id: crypto.randomUUID(),
          userId,
          itemType: item.itemType,
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          rarity: item.rarity,
        }));

        await db.insert(inventoryTable).values(inventoryItems);
      }

      // Sync collections if provided
      if (input.collections && input.collections.length > 0) {
        // Delete existing collections for this user
        await db
          .delete(collectionsTable)
          .where(eq(collectionsTable.userId, userId));

        // Insert new collections
        const collectionItems = input.collections.map((item) => ({
          id: crypto.randomUUID(),
          userId,
          collectionType: item.collectionType,
          itemId: item.itemId,
        }));

        await db.insert(collectionsTable).values(collectionItems);
      }

      return { success: true };
    }),

  // Get user's inventory
  getInventory: protectedProcedure.query(async ({ ctx }) => {
    const userInventory = await db.query.inventory.findMany({
      where: eq(inventoryTable.userId, ctx.session.user.id),
    });

    return userInventory;
  }),

  // Get user's collections
  getCollections: protectedProcedure.query(async ({ ctx }) => {
    const userCollections = await db.query.collections.findMany({
      where: eq(collectionsTable.userId, ctx.session.user.id),
    });

    return userCollections;
  }),
});
