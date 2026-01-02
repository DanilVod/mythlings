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
