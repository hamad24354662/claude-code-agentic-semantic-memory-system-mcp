import { db, schema } from '../db/client.js';
import { eq } from 'drizzle-orm';
import { generateSimpleEmbedding } from './simpleEmbedding.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const updateMemoryTool = {
  name: 'update_memory',
  description: 'Update an existing memory content or metadata',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The ID of the memory to update',
      },
      content: {
        type: 'string',
        description: 'New content for the memory (if provided, will regenerate embedding)',
      },
      metadata: {
        type: 'string',
        description: 'New JSON metadata for the memory',
      },
    },
    required: ['id'],
  },
  handler: handleUpdateMemory,
};

export async function handleUpdateMemory(args: any) {
  try {
    const { id, content, metadata } = args;

    if (!id || typeof id !== 'string') {
      throw new Error('Memory ID is required and must be a string');
    }

    if (!content && !metadata) {
      throw new Error('At least one of content or metadata must be provided for update');
    }

    // Build update object
    const updateData: any = {};
    
    if (content) {
      updateData.content = content;
      // Regenerate embedding if content changes
      console.log('🧠 Generating new embedding for updated content...');
      updateData.embedding = generateSimpleEmbedding(content);
    }
    
    if (metadata) {
      updateData.metadata = metadata;
    }

    // Update the memory
    const updatedMemories = await db
      .update(schema.memories)
      .set(updateData)
      .where(eq(schema.memories.id, id))
      .returning();

    if (updatedMemories.length === 0) {
      return {
        success: false,
        error: `Memory with ID ${id} not found`,
      };
    }

    return {
      success: true,
      updatedMemory: {
        id: updatedMemories[0].id,
        content: updatedMemories[0].content,
        metadata: updatedMemories[0].metadata,
        createdAt: updatedMemories[0].createdAt,
      },
      message: `Successfully updated memory with ID ${id}`,
    };
  } catch (error) {
    console.error('Error updating memory:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}