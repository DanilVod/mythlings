import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { protectedProcedure, router } from '../index';
import { db } from '@mythlings/db';
import {
  gameProfile,
  inventory as inventoryTable,
  collections as collectionsTable,
  floors,
  mythlings,
  abilities,
  mythlingAbilities,
  floorMonsters,
  floorRewards,
} from '@mythlings/db/schema/game';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

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

  // ============ ADMIN PROCEDURES ============

  // Floors CRUD
  floors: router({
    getAll: protectedProcedure.query(async () => {
      const allFloors = await db.query.floors.findMany({
        orderBy: (floors, { asc }) => [asc(floors.floorNumber)],
        with: {
          monsters: {
            with: {
              mythling: true,
            },
          },
          rewards: true,
        },
      });
      return allFloors;
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const floor = await db.query.floors.findFirst({
          where: eq(floors.id, input.id),
          with: {
            monsters: {
              with: {
                mythling: true,
              },
              orderBy: (floorMonsters, { asc }) => [
                asc(floorMonsters.position),
              ],
            },
            rewards: true,
          },
        });
        return floor;
      }),

    create: protectedProcedure
      .input(
        z.object({
          floorNumber: z.number().int().min(1),
          difficulty: z.number().int().min(1).max(10).default(1),
          description: z.string().optional(),
          monsters: z
            .array(
              z.object({
                mythlingId: z.string(),
                quantity: z.number().int().min(1).default(1),
                position: z.number().int().min(0),
              }),
            )
            .default([]),
          rewards: z
            .array(
              z.object({
                rewardType: z.enum(['gold', 'gems', 'mythling', 'equipment']),
                rewardId: z.string().optional(),
                quantity: z.number().int().min(1).default(1),
              }),
            )
            .default([]),
        }),
      )
      .mutation(async ({ input }) => {
        const [newFloor] = await db
          .insert(floors)
          .values({
            id: crypto.randomUUID(),
            floorNumber: input.floorNumber,
            difficulty: input.difficulty,
            description: input.description,
          })
          .returning();

        if (!newFloor) {
          throw new Error('Failed to create floor');
        }

        // Add monsters
        if (input.monsters.length > 0) {
          const monsterData = input.monsters.map((monster) => ({
            id: crypto.randomUUID(),
            floorId: newFloor.id,
            mythlingId: monster.mythlingId,
            quantity: monster.quantity,
            position: monster.position,
          }));
          await db.insert(floorMonsters).values(monsterData);
        }

        // Add rewards
        if (input.rewards.length > 0) {
          const rewardData = input.rewards.map((reward) => ({
            id: crypto.randomUUID(),
            floorId: newFloor.id,
            rewardType: reward.rewardType,
            rewardId: reward.rewardId,
            quantity: reward.quantity,
          }));
          await db.insert(floorRewards).values(rewardData);
        }

        return newFloor;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          floorNumber: z.number().int().min(1).optional(),
          difficulty: z.number().int().min(1).max(10).optional(),
          description: z.string().optional(),
          monsters: z
            .array(
              z.object({
                mythlingId: z.string(),
                quantity: z.number().int().min(1).default(1),
                position: z.number().int().min(0),
              }),
            )
            .optional(),
          rewards: z
            .array(
              z.object({
                rewardType: z.enum(['gold', 'gems', 'mythling', 'equipment']),
                rewardId: z.string().optional(),
                quantity: z.number().int().min(1).default(1),
              }),
            )
            .optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, monsters, rewards, ...floorData } = input;

        // Update floor
        const [updatedFloor] = await db
          .update(floors)
          .set({
            ...floorData,
            updatedAt: new Date(),
          })
          .where(eq(floors.id, id))
          .returning();

        // Update monsters if provided
        if (monsters !== undefined) {
          // Delete existing monsters
          await db.delete(floorMonsters).where(eq(floorMonsters.floorId, id));

          // Insert new monsters
          if (monsters.length > 0) {
            const monsterData = monsters.map((monster) => ({
              id: crypto.randomUUID(),
              floorId: id,
              mythlingId: monster.mythlingId,
              quantity: monster.quantity,
              position: monster.position,
            }));
            await db.insert(floorMonsters).values(monsterData);
          }
        }

        // Update rewards if provided
        if (rewards !== undefined) {
          // Delete existing rewards
          await db.delete(floorRewards).where(eq(floorRewards.floorId, id));

          // Insert new rewards
          if (rewards.length > 0) {
            const rewardData = rewards.map((reward) => ({
              id: crypto.randomUUID(),
              floorId: id,
              rewardType: reward.rewardType,
              rewardId: reward.rewardId,
              quantity: reward.quantity,
            }));
            await db.insert(floorRewards).values(rewardData);
          }
        }

        return updatedFloor;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.delete(floors).where(eq(floors.id, input.id));
        return { success: true };
      }),
  }),

  // Mythlings CRUD
  mythlings: router({
    getAll: protectedProcedure.query(async () => {
      const allMythlings = await db.query.mythlings.findMany({
        with: {
          abilities: {
            with: {
              ability: true,
            },
          },
        },
      });
      return allMythlings;
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const mythling = await db.query.mythlings.findFirst({
          where: eq(mythlings.id, input.id),
          with: {
            abilities: {
              with: {
                ability: true,
              },
            },
          },
        });
        return mythling;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          type: z.enum(['fire', 'water', 'earth']),
          description: z.string().optional(),
          icon: z.string().optional(),
          basePower: z.number().int().min(1).default(10),
          baseHealth: z.number().int().min(1).default(100),
          rarity: z
            .enum(['common', 'rare', 'epic', 'legendary'])
            .default('common'),
          abilityIds: z.array(z.string()).default([]),
        }),
      )
      .mutation(async ({ input }) => {
        const { abilityIds, icon, ...mythlingData } = input;

        // Provide default icon if none provided
        const iconUrl =
          icon && icon.trim() !== '' ? icon : 'https://via.placeholder.com/150';

        const [newMythling] = await db
          .insert(mythlings)
          .values({
            id: crypto.randomUUID(),
            ...mythlingData,
            icon: iconUrl,
          })
          .returning();

        if (!newMythling) {
          throw new Error('Failed to create mythling');
        }

        // Add abilities
        if (abilityIds.length > 0) {
          const abilityData = abilityIds.map((abilityId) => ({
            id: crypto.randomUUID(),
            mythlingId: newMythling.id,
            abilityId,
          }));
          await db.insert(mythlingAbilities).values(abilityData);
        }

        return newMythling;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).max(100).optional(),
          type: z.enum(['fire', 'water', 'earth']).optional(),
          description: z.string().optional(),
          icon: z.string().optional(),
          basePower: z.number().int().min(1).optional(),
          baseHealth: z.number().int().min(1).optional(),
          rarity: z.enum(['common', 'rare', 'epic', 'legendary']).optional(),
          abilityIds: z.array(z.string()).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, abilityIds, icon, ...mythlingData } = input;

        // Only update icon if provided
        const updateData: any = {
          ...mythlingData,
          updatedAt: new Date(),
        };

        if (icon !== undefined) {
          updateData.icon =
            icon && icon.trim() !== ''
              ? icon
              : 'https://via.placeholder.com/150';
        }

        // Update mythling
        const [updatedMythling] = await db
          .update(mythlings)
          .set(updateData)
          .where(eq(mythlings.id, id))
          .returning();

        // Update abilities if provided
        if (abilityIds !== undefined) {
          // Delete existing abilities
          await db
            .delete(mythlingAbilities)
            .where(eq(mythlingAbilities.mythlingId, id));

          // Insert new abilities
          if (abilityIds.length > 0) {
            const abilityData = abilityIds.map((abilityId) => ({
              id: crypto.randomUUID(),
              mythlingId: id,
              abilityId,
            }));
            await db.insert(mythlingAbilities).values(abilityData);
          }
        }

        return updatedMythling;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.delete(mythlings).where(eq(mythlings.id, input.id));
        return { success: true };
      }),

    uploadIcon: protectedProcedure
      .input(
        z.object({
          fileBase64: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const { fileBase64, fileName, mimeType } = input;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(mimeType)) {
          throw new Error(
            'Invalid file type. Only PNG, JPEG, and WebP are allowed.',
          );
        }

        // Convert base64 to buffer
        const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (buffer.length > maxSize) {
          throw new Error('File too large. Maximum size is 2MB.');
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const ext = fileName.split('.').pop();
        const filename = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${ext}`;
        const filepath = join(uploadsDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        // Return the relative path
        const url = `/uploads/${filename}`;
        return { url, filename };
      }),
  }),

  // Abilities CRUD
  abilities: router({
    getAll: protectedProcedure.query(async () => {
      const allAbilities = await db.query.abilities.findMany();
      return allAbilities;
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const ability = await db.query.abilities.findFirst({
          where: eq(abilities.id, input.id),
        });
        return ability;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          damage: z.number().int().min(0).default(0),
          cooldown: z.number().int().min(0).default(1),
          description: z.string().optional(),
          icon: z.string().min(1).max(10),
        }),
      )
      .mutation(async ({ input }) => {
        const [newAbility] = await db
          .insert(abilities)
          .values({
            id: crypto.randomUUID(),
            ...input,
          })
          .returning();
        return newAbility;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).max(100).optional(),
          damage: z.number().int().min(0).optional(),
          cooldown: z.number().int().min(0).optional(),
          description: z.string().optional(),
          icon: z.string().min(1).max(10).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...abilityData } = input;

        const [updatedAbility] = await db
          .update(abilities)
          .set({
            ...abilityData,
            updatedAt: new Date(),
          })
          .where(eq(abilities.id, id))
          .returning();

        return updatedAbility;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.delete(abilities).where(eq(abilities.id, input.id));
        return { success: true };
      }),
  }),

  // ============ PUBLIC PROCEDURES (for native app) ============

  // Get all floors for gameplay
  getFloors: protectedProcedure.query(async () => {
    const allFloors = await db.query.floors.findMany({
      orderBy: (floors, { asc }) => [asc(floors.floorNumber)],
      with: {
        monsters: {
          with: {
            mythling: {
              with: {
                abilities: {
                  with: {
                    ability: true,
                  },
                },
              },
            },
          },
          orderBy: (floorMonsters, { asc }) => [asc(floorMonsters.position)],
        },
        rewards: true,
      },
    });

    // Cast mythling types to proper enum
    const typedFloors = allFloors.map((floor) => ({
      ...floor,
      monsters: floor.monsters.map((monster) => ({
        ...monster,
        mythling: {
          ...monster.mythling,
          type: monster.mythling.type as 'fire' | 'water' | 'earth',
        },
      })),
    }));

    return typedFloors;
  }),

  // Get all mythlings for gameplay
  getMythlings: protectedProcedure.query(async () => {
    const allMythlings = await db.query.mythlings.findMany({
      with: {
        abilities: {
          with: {
            ability: true,
          },
        },
      },
    });

    // Cast mythling types to proper enum
    const typedMythlings = allMythlings.map((mythling) => ({
      ...mythling,
      type: mythling.type as 'fire' | 'water' | 'earth',
    }));

    return typedMythlings;
  }),

  // Get all abilities for gameplay
  getAbilities: protectedProcedure.query(async () => {
    const allAbilities = await db.query.abilities.findMany();
    return allAbilities;
  }),
  // Get starter mythlings for character selection (3 random common mythlings, one of each type)
  getStarterMythlings: protectedProcedure.query(async () => {
    // Get one random common mythling of each type
    const types: ('fire' | 'water' | 'earth')[] = ['fire', 'water', 'earth'];
    const starterMythlings = [];

    for (const type of types) {
      // Get all common mythlings of this type
      const mythlingsOfType = await db.query.mythlings.findMany({
        where: (mythlings, { eq, and }) =>
          and(eq(mythlings.type, type), eq(mythlings.rarity, 'common')),
        with: {
          abilities: {
            with: {
              ability: true,
            },
          },
        },
      });

      // If we have common mythlings of this type, pick one randomly
      if (mythlingsOfType.length > 0) {
        const randomIndex = Math.floor(Math.random() * mythlingsOfType.length);
        const selectedMythling = mythlingsOfType[randomIndex];
        if (selectedMythling) {
          starterMythlings.push({
            ...selectedMythling,
            type: selectedMythling.type as 'fire' | 'water' | 'earth',
            rarity: selectedMythling.rarity as
              | 'common'
              | 'rare'
              | 'epic'
              | 'legendary',
          });
        }
      }
    }

    return starterMythlings;
  }),
});
