import { z } from 'zod';
import { db, schema } from '../db/client.js';
import { generateSimpleEmbedding } from './simpleEmbedding.js';
import { getCurrentProject } from './manageProjects.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const createMemoryTool = {
  name: 'create_memory',
  description: 'Store a new memory with semantic embedding for later retrieval',
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'The content to store as a memory',
      },
      metadata: {
        type: 'string',
        description: 'Optional JSON metadata associated with this memory',
      },
    },
    required: ['content'],
  },
  handler: handleCreateMemory,
};

export async function handleCreateMemory(args: any) {
  try {
    const { content, metadata } = args;
    const currentProject = getCurrentProject();

    if (!content || typeof content !== 'string') {
      throw new Error('Content is required and must be a string');
    }

    // Generate embedding using simple local model
    console.log('🧠 Generating simple embedding for:', content.substring(0, 50) + '...');
    const embedding = generateSimpleEmbedding(content);

    // Add project to metadata
    let enrichedMetadata = metadata;
    if (currentProject !== 'default') {
      try {
        const metaObj = metadata ? JSON.parse(metadata) : {};
        metaObj.project = currentProject;
        enrichedMetadata = JSON.stringify(metaObj);
      } catch (e) {
        // If metadata is not valid JSON, create new object
        enrichedMetadata = JSON.stringify({ project: currentProject, originalMetadata: metadata });
      }
    }

    // Store memory in database
    const [newMemory] = await db
      .insert(schema.memories)
      .values({
        content,
        embedding, // Use the embedding array directly for vector type
        metadata: enrichedMetadata || null,
      })
      .returning();

    return {
      success: true,
      memory: {
        id: newMemory.id,
        content: newMemory.content,
        metadata: newMemory.metadata,
        createdAt: newMemory.createdAt,
      },
    };
  } catch (error) {
    console.error('Error creating memory:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}