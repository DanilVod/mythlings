import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const gameProfile = pgTable(
  'game_profile',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    username: text('username').notNull(),
    characterType: text('character_type').notNull(), // 'fire', 'water', 'earth'
    currentFloor: integer('current_floor').notNull().default(1),
    totalFloors: integer('total_floors').notNull().default(10),
    gold: integer('gold').notNull().default(0),
    gems: integer('gems').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('game_profile_userId_idx').on(table.userId)],
);

export const inventory = pgTable(
  'inventory',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    itemType: text('item_type').notNull(), // 'mythling', 'equipment', 'consumable'
    itemId: text('item_id').notNull(),
    itemName: text('item_name').notNull(),
    quantity: integer('quantity').notNull().default(1),
    rarity: text('rarity'), // 'common', 'rare', 'epic', 'legendary'
    obtainedAt: timestamp('obtained_at').defaultNow().notNull(),
  },
  (table) => [index('inventory_userId_idx').on(table.userId)],
);

export const collections = pgTable(
  'collections',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    collectionType: text('collection_type').notNull(), // 'mythlings', 'equipment', etc.
    itemId: text('item_id').notNull(),
    collectedAt: timestamp('collected_at').defaultNow().notNull(),
  },
  (table) => [index('collections_userId_idx').on(table.userId)],
);

export const gameProfileRelations = relations(gameProfile, ({ one }) => ({
  user: one(user, {
    fields: [gameProfile.userId],
    references: [user.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  user: one(user, {
    fields: [inventory.userId],
    references: [user.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ one }) => ({
  user: one(user, {
    fields: [collections.userId],
    references: [user.id],
  }),
}));

// Floors table
export const floors = pgTable(
  'floors',
  {
    id: text('id').primaryKey(),
    floorNumber: integer('floor_number').notNull().unique(),
    difficulty: integer('difficulty').notNull().default(1),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('floors_floorNumber_idx').on(table.floorNumber)],
);

// Mythlings table
export const mythlings = pgTable(
  'mythlings',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull(), // 'fire', 'water', 'earth'
    description: text('description'),
    icon: text('icon').notNull(), // URL or path to icon image
    basePower: integer('base_power').notNull().default(10),
    baseHealth: integer('base_health').notNull().default(100),
    rarity: text('rarity').notNull().default('common'), // 'common', 'rare', 'epic', 'legendary'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('mythlings_type_idx').on(table.type)],
);

// Abilities table
export const abilities = pgTable('abilities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  damage: integer('damage').notNull().default(0),
  cooldown: integer('cooldown').notNull().default(1),
  description: text('description'),
  icon: text('icon').notNull(), // emoji or icon URL
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
});

// Mythling-Ability junction table (Many-to-Many)
export const mythlingAbilities = pgTable(
  'mythling_abilities',
  {
    id: text('id').primaryKey(),
    mythlingId: text('mythling_id')
      .notNull()
      .references(() => mythlings.id, { onDelete: 'cascade' }),
    abilityId: text('ability_id')
      .notNull()
      .references(() => abilities.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('mythling_abilities_mythlingId_idx').on(table.mythlingId),
    index('mythling_abilities_abilityId_idx').on(table.abilityId),
  ],
);

// Floor-Mythling junction table (Many-to-Many)
export const floorMonsters = pgTable(
  'floor_monsters',
  {
    id: text('id').primaryKey(),
    floorId: text('floor_id')
      .notNull()
      .references(() => floors.id, { onDelete: 'cascade' }),
    mythlingId: text('mythling_id')
      .notNull()
      .references(() => mythlings.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    position: integer('position').notNull(), // Order in the battle team
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('floor_monsters_floorId_idx').on(table.floorId),
    index('floor_monsters_mythlingId_idx').on(table.mythlingId),
  ],
);

// Floor Rewards table
export const floorRewards = pgTable(
  'floor_rewards',
  {
    id: text('id').primaryKey(),
    floorId: text('floor_id')
      .notNull()
      .references(() => floors.id, { onDelete: 'cascade' }),
    rewardType: text('reward_type').notNull(), // 'gold', 'gems', 'mythling', 'equipment'
    rewardId: text('reward_id'), // ID of mythling/equipment if applicable
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('floor_rewards_floorId_idx').on(table.floorId)],
);

// Relations for new tables
export const floorsRelations = relations(floors, ({ many }) => ({
  monsters: many(floorMonsters),
  rewards: many(floorRewards),
}));

export const mythlingsRelations = relations(mythlings, ({ many }) => ({
  abilities: many(mythlingAbilities),
  floorMonsters: many(floorMonsters),
}));

export const abilitiesRelations = relations(abilities, ({ many }) => ({
  mythlings: many(mythlingAbilities),
}));

export const mythlingAbilitiesRelations = relations(
  mythlingAbilities,
  ({ one }) => ({
    mythling: one(mythlings, {
      fields: [mythlingAbilities.mythlingId],
      references: [mythlings.id],
    }),
    ability: one(abilities, {
      fields: [mythlingAbilities.abilityId],
      references: [abilities.id],
    }),
  }),
);

export const floorMonstersRelations = relations(floorMonsters, ({ one }) => ({
  floor: one(floors, {
    fields: [floorMonsters.floorId],
    references: [floors.id],
  }),
  mythling: one(mythlings, {
    fields: [floorMonsters.mythlingId],
    references: [mythlings.id],
  }),
}));

export const floorRewardsRelations = relations(floorRewards, ({ one }) => ({
  floor: one(floors, {
    fields: [floorRewards.floorId],
    references: [floors.id],
  }),
}));
