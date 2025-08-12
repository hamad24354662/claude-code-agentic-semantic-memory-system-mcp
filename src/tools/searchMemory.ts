import { db, schema } from '../db/client.js';
import { sql } from 'drizzle-orm';
import { generateSimpleEmbedding } from './simpleEmbedding.js';
import { getCurrentProject } from './manageProjects.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const searchMemoryTool = {
  name: 'search_memory',
  description: 'Search through stored memories using semantic similarity',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to find relevant memories',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 5)',
        default: 5,
      },
      threshold: {
        type: 'number',
        description: 'Similarity threshold (0-1, default: 0.7)',
        default: 0.7,
      },
    },
    required: ['query'],
  },
  handler: handleSearchMemory,
};

export async function handleSearchMemory(args: any) {
  try {
    const { query, limit = 5, threshold = 0.7 } = args;
    const currentProject = getCurrentProject();

    if (!query || typeof query !== 'string') {
      throw new Error('Query is required and must be a string');
    }

    // Generate embedding for the search query using simple model
    console.log('🔍 Generating simple embedding for query:', query);
    const queryEmbedding = generateSimpleEmbedding(query);

    // Build where clause based on project
    const projectFilter = currentProject === 'default' 
      ? sql`${schema.memories.metadata}->>'project' IS NULL`
      : sql`${schema.memories.metadata}->>'project' = ${currentProject}`;

    // Search for similar memories using cosine similarity
    const results = await db
      .select({
        id: schema.memories.id,
        content: schema.memories.content,
        metadata: schema.memories.metadata,
        createdAt: schema.memories.createdAt,
        similarity: sql`1 - (${schema.memories.embedding} <=> ${JSON.stringify(queryEmbedding)})`,
      })
      .from(schema.memories)
      .where(sql`${projectFilter} AND 1 - (${schema.memories.embedding} <=> ${JSON.stringify(queryEmbedding)}) > ${threshold}`)
      .orderBy(sql`${schema.memories.embedding} <=> ${JSON.stringify(queryEmbedding)}`)
      .limit(limit);

    return {
      success: true,
      results: results.map(result => ({
        id: result.id,
        content: result.content,
        metadata: result.metadata,
        createdAt: result.createdAt,
        similarity: result.similarity,
      })),
      query,
      totalResults: results.length,
    };
  } catch (error) {
    console.error('Error searching memories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}