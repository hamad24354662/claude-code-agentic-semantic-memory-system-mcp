import { db, schema } from '../db/client.js';
import { desc, asc, sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const listMemoriesTool = {
  name: 'list_memories',
  description: 'List all memories with optional pagination and sorting',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of memories to return (default: 50)',
        default: 50,
      },
      offset: {
        type: 'number',
        description: 'Number of memories to skip (for pagination)',
        default: 0,
      },
      sortBy: {
        type: 'string',
        description: 'Field to sort by (createdAt or content)',
        enum: ['createdAt', 'content'],
        default: 'createdAt',
      },
      sortOrder: {
        type: 'string',
        description: 'Sort order (asc or desc)',
        enum: ['asc', 'desc'],
        default: 'desc',
      },
      metadataFilter: {
        type: 'string',
        description: 'JSON string of metadata filters to apply',
      },
    },
    required: [],
  },
  handler: handleListMemories,
};

export async function handleListMemories(args: any) {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      metadataFilter 
    } = args;

    // Build the query
    let query = db.select({
      id: schema.memories.id,
      content: schema.memories.content,
      metadata: schema.memories.metadata,
      createdAt: schema.memories.createdAt,
    }).from(schema.memories);

    // Apply metadata filter if provided
    if (metadataFilter) {
      try {
        const filters = JSON.parse(metadataFilter);
        // Apply JSON containment query for metadata
        query = query.where(sql`${schema.memories.metadata} @> ${JSON.stringify(filters)}`);
      } catch (e) {
        console.warn('Invalid metadata filter JSON:', e);
      }
    }

    // Apply sorting
    const orderByColumn = sortBy === 'content' ? schema.memories.content : schema.memories.createdAt;
    const orderByFunc = sortOrder === 'asc' ? asc : desc;
    query = query.orderBy(orderByFunc(orderByColumn));

    // Apply pagination
    query = query.limit(limit).offset(offset);

    const memories = await query;

    // Get total count for pagination info
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.memories);
    const totalCount = Number(totalCountResult[0].count);

    return {
      success: true,
      memories: memories.map(memory => ({
        id: memory.id,
        content: memory.content,
        metadata: memory.metadata,
        createdAt: memory.createdAt,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + memories.length < totalCount,
      },
    };
  } catch (error) {
    console.error('Error listing memories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}