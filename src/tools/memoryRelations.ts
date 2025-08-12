import { db, schema } from '../db/client.js';
import { eq, and, or } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Tool for creating relationships between memories
 */
export const createMemoryRelationTool = {
  name: 'create_memory_relation',
  description: 'Create a relationship between two memories (parent-child, related, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      parentId: {
        type: 'string',
        description: 'ID of the parent/source memory',
      },
      childId: {
        type: 'string',
        description: 'ID of the child/related memory',
      },
      relationType: {
        type: 'string',
        description: 'Type of relationship',
        enum: ['parent-child', 'related', 'follows-from', 'contradicts', 'updates', 'supports'],
        default: 'related',
      },
      metadata: {
        type: 'string',
        description: 'Optional JSON metadata about the relationship',
      },
    },
    required: ['parentId', 'childId'],
  },
  handler: handleCreateMemoryRelation,
};

/**
 * Tool for finding memory relationships
 */
export const getMemoryRelationsTool = {
  name: 'get_memory_relations',
  description: 'Get all relationships for a specific memory',
  inputSchema: {
    type: 'object',
    properties: {
      memoryId: {
        type: 'string',
        description: 'ID of the memory to find relationships for',
      },
      direction: {
        type: 'string',
        description: 'Direction of relationships to retrieve',
        enum: ['parents', 'children', 'both'],
        default: 'both',
      },
    },
    required: ['memoryId'],
  },
  handler: handleGetMemoryRelations,
};

/**
 * Tool for building a memory graph
 */
export const getMemoryGraphTool = {
  name: 'get_memory_graph',
  description: 'Build a graph of related memories starting from a root memory',
  inputSchema: {
    type: 'object',
    properties: {
      rootMemoryId: {
        type: 'string',
        description: 'ID of the root memory to start from',
      },
      depth: {
        type: 'number',
        description: 'Maximum depth to traverse (default: 2)',
        default: 2,
      },
      includeContent: {
        type: 'boolean',
        description: 'Whether to include full memory content',
        default: false,
      },
    },
    required: ['rootMemoryId'],
  },
  handler: handleGetMemoryGraph,
};

/**
 * Tool for removing memory relationships
 */
export const deleteMemoryRelationTool = {
  name: 'delete_memory_relation',
  description: 'Delete a relationship between two memories',
  inputSchema: {
    type: 'object',
    properties: {
      relationId: {
        type: 'string',
        description: 'ID of the relationship to delete',
      },
    },
    required: ['relationId'],
  },
  handler: handleDeleteMemoryRelation,
};

// Handler functions

export async function handleCreateMemoryRelation(args: any) {
  try {
    const { parentId, childId, relationType = 'related', metadata } = args;

    // Verify both memories exist
    const [parentMemory] = await db
      .select()
      .from(schema.memories)
      .where(eq(schema.memories.id, parentId))
      .limit(1);

    const [childMemory] = await db
      .select()
      .from(schema.memories)
      .where(eq(schema.memories.id, childId))
      .limit(1);

    if (!parentMemory) {
      return {
        success: false,
        error: `Parent memory with ID ${parentId} not found`,
      };
    }

    if (!childMemory) {
      return {
        success: false,
        error: `Child memory with ID ${childId} not found`,
      };
    }

    // Check if relationship already exists
    const existingRelation = await db
      .select()
      .from(schema.memoryRelations)
      .where(
        and(
          eq(schema.memoryRelations.parentId, parentId),
          eq(schema.memoryRelations.childId, childId)
        )
      )
      .limit(1);

    if (existingRelation.length > 0) {
      return {
        success: false,
        error: 'Relationship already exists between these memories',
      };
    }

    // Create the relationship
    const [newRelation] = await db
      .insert(schema.memoryRelations)
      .values({
        parentId,
        childId,
        metadata: metadata ? JSON.parse(metadata) : { relationType },
      })
      .returning();

    return {
      success: true,
      relation: {
        id: newRelation.id,
        parentId: newRelation.parentId,
        childId: newRelation.childId,
        metadata: newRelation.metadata,
        createdAt: newRelation.createdAt,
      },
      message: `Created ${relationType} relationship between memories`,
    };
  } catch (error) {
    console.error('Error creating memory relation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function handleGetMemoryRelations(args: any) {
  try {
    const { memoryId, direction = 'both' } = args;

    const results: any = {
      parents: [],
      children: [],
    };

    // Get parent relationships
    if (direction === 'parents' || direction === 'both') {
      const parentRelations = await db
        .select({
          relationId: schema.memoryRelations.id,
          memoryId: schema.memories.id,
          content: schema.memories.content,
          metadata: schema.memoryRelations.metadata,
          createdAt: schema.memoryRelations.createdAt,
        })
        .from(schema.memoryRelations)
        .innerJoin(
          schema.memories,
          eq(schema.memories.id, schema.memoryRelations.parentId)
        )
        .where(eq(schema.memoryRelations.childId, memoryId));

      results.parents = parentRelations;
    }

    // Get child relationships
    if (direction === 'children' || direction === 'both') {
      const childRelations = await db
        .select({
          relationId: schema.memoryRelations.id,
          memoryId: schema.memories.id,
          content: schema.memories.content,
          metadata: schema.memoryRelations.metadata,
          createdAt: schema.memoryRelations.createdAt,
        })
        .from(schema.memoryRelations)
        .innerJoin(
          schema.memories,
          eq(schema.memories.id, schema.memoryRelations.childId)
        )
        .where(eq(schema.memoryRelations.parentId, memoryId));

      results.children = childRelations;
    }

    return {
      success: true,
      memoryId,
      relations: results,
      totalRelations: results.parents.length + results.children.length,
    };
  } catch (error) {
    console.error('Error getting memory relations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function handleGetMemoryGraph(args: any) {
  try {
    const { rootMemoryId, depth = 2, includeContent = false } = args;

    // Recursive function to build the graph
    async function buildGraph(memoryId: string, currentDepth: number, visited: Set<string>): Promise<any> {
      if (currentDepth > depth || visited.has(memoryId)) {
        return null;
      }

      visited.add(memoryId);

      // Get the memory
      const [memory] = await db
        .select({
          id: schema.memories.id,
          content: includeContent ? schema.memories.content : schema.memories.id,
          metadata: schema.memories.metadata,
          createdAt: schema.memories.createdAt,
        })
        .from(schema.memories)
        .where(eq(schema.memories.id, memoryId))
        .limit(1);

      if (!memory) {
        return null;
      }

      // Get all relationships for this memory
      const relations = await db
        .select({
          id: schema.memoryRelations.id,
          parentId: schema.memoryRelations.parentId,
          childId: schema.memoryRelations.childId,
          metadata: schema.memoryRelations.metadata,
        })
        .from(schema.memoryRelations)
        .where(
          or(
            eq(schema.memoryRelations.parentId, memoryId),
            eq(schema.memoryRelations.childId, memoryId)
          )
        );

      // Build child nodes recursively
      const children = [];
      for (const relation of relations) {
        const childId = relation.parentId === memoryId ? relation.childId : relation.parentId;
        const childNode = await buildGraph(childId, currentDepth + 1, visited);
        if (childNode) {
          children.push({
            ...childNode,
            relationMetadata: relation.metadata,
          });
        }
      }

      return {
        id: memory.id,
        content: includeContent ? memory.content : undefined,
        metadata: memory.metadata,
        createdAt: memory.createdAt,
        children,
      };
    }

    const visited = new Set<string>();
    const graph = await buildGraph(rootMemoryId, 0, visited);

    if (!graph) {
      return {
        success: false,
        error: `Memory with ID ${rootMemoryId} not found`,
      };
    }

    return {
      success: true,
      graph,
      nodesVisited: visited.size,
      maxDepth: depth,
    };
  } catch (error) {
    console.error('Error building memory graph:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function handleDeleteMemoryRelation(args: any) {
  try {
    const { relationId } = args;

    const deletedRelations = await db
      .delete(schema.memoryRelations)
      .where(eq(schema.memoryRelations.id, relationId))
      .returning();

    if (deletedRelations.length === 0) {
      return {
        success: false,
        error: `Relationship with ID ${relationId} not found`,
      };
    }

    return {
      success: true,
      deletedRelation: deletedRelations[0],
      message: `Successfully deleted relationship ${relationId}`,
    };
  } catch (error) {
    console.error('Error deleting memory relation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}