import { pgTable, text, timestamp, vector } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const memories = pgTable('memories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  metadata: text('metadata'), // JSON string for flexible metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const memoryRelations = pgTable('memory_relations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  fromMemoryId: text('from_memory_id')
    .notNull()
    .references(() => memories.id, { onDelete: 'cascade' }),
  toMemoryId: text('to_memory_id')
    .notNull()
    .references(() => memories.id, { onDelete: 'cascade' }),
  relationType: text('relation_type').notNull(), // e.g., 'builds_on', 'contradicts', 'related_to'
  strength: text('strength').notNull().default('medium'), // weak, medium, strong
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Memory = typeof memories.$inferSelect;
export type NewMemory = typeof memories.$inferInsert;
export type MemoryRelation = typeof memoryRelations.$inferSelect;
export type NewMemoryRelation = typeof memoryRelations.$inferInsert;