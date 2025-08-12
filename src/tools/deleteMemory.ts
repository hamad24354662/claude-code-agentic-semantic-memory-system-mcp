import { db, schema } from '../db/client.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const deleteMemoryTool = {
  name: 'delete_memory',
  description: 'Delete a memory by its ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The ID of the memory to delete',
      },
    },
    required: ['id'],
  },
  handler: handleDeleteMemory,
};

export async function handleDeleteMemory(args: any) {
  try {
    const { id } = args;

    if (!id || typeof id !== 'string') {
      throw new Error('Memory ID is required and must be a string');
    }

    // Delete the memory
    const deletedMemories = await db
      .delete(schema.memories)
      .where(eq(schema.memories.id, id))
      .returning();

    if (deletedMemories.length === 0) {
      return {
        success: false,
        error: `Memory with ID ${id} not found`,
      };
    }

    return {
      success: true,
      deletedMemory: {
        id: deletedMemories[0].id,
        content: deletedMemories[0].content,
        metadata: deletedMemories[0].metadata,
        createdAt: deletedMemories[0].createdAt,
      },
      message: `Successfully deleted memory with ID ${id}`,
    };
  } catch (error) {
    console.error('Error deleting memory:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}