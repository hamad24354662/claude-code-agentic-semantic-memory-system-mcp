import { db, schema } from '../db/client.js';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Current active project (stored in memory for this session)
let currentProject: string = 'default';

export const switchProjectTool = {
  name: 'switch_project',
  description: 'Switch to a different project/namespace for memory storage',
  inputSchema: {
    type: 'object',
    properties: {
      projectName: {
        type: 'string',
        description: 'Name of the project to switch to (will be created if it doesn\'t exist)',
      },
    },
    required: ['projectName'],
  },
  handler: handleSwitchProject,
};

export const listProjectsTool = {
  name: 'list_projects',
  description: 'List all available projects/namespaces',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: handleListProjects,
};

export const getCurrentProjectTool = {
  name: 'get_current_project',
  description: 'Get the name of the currently active project',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: handleGetCurrentProject,
};

export const deleteProjectTool = {
  name: 'delete_project',
  description: 'Delete a project and all its associated memories',
  inputSchema: {
    type: 'object',
    properties: {
      projectName: {
        type: 'string',
        description: 'Name of the project to delete',
      },
      confirmDelete: {
        type: 'boolean',
        description: 'Must be true to confirm deletion (safety check)',
      },
    },
    required: ['projectName', 'confirmDelete'],
  },
  handler: handleDeleteProject,
};

export async function handleSwitchProject(args: any) {
  try {
    const { projectName } = args;

    if (!projectName || typeof projectName !== 'string') {
      throw new Error('Project name is required and must be a string');
    }

    // Validate project name (alphanumeric, dash, underscore only)
    if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
      throw new Error('Project name must contain only letters, numbers, dashes, and underscores');
    }

    currentProject = projectName;

    // Check if project exists by looking for any memories with this project
    const existingMemories = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.memories)
      .where(sql`${schema.memories.metadata}->>'project' = ${projectName}`);

    const exists = Number(existingMemories[0].count) > 0;

    return {
      success: true,
      project: projectName,
      message: exists 
        ? `Switched to existing project: ${projectName}` 
        : `Switched to new project: ${projectName}`,
      isNew: !exists,
    };
  } catch (error) {
    console.error('Error switching project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function handleListProjects(args: any) {
  try {
    // Get distinct project names from metadata
    const projectsResult = await db.execute(
      sql`SELECT DISTINCT ${schema.memories.metadata}->>'project' as project_name,
          COUNT(*) as memory_count,
          MIN(${schema.memories.createdAt}) as first_created,
          MAX(${schema.memories.createdAt}) as last_updated
          FROM ${schema.memories}
          WHERE ${schema.memories.metadata}->>'project' IS NOT NULL
          GROUP BY ${schema.memories.metadata}->>'project'
          ORDER BY last_updated DESC`
    );

    // Also check for memories without a project (default project)
    const defaultProjectResult = await db
      .select({ 
        count: sql<number>`count(*)`,
        firstCreated: sql`MIN(${schema.memories.createdAt})`,
        lastUpdated: sql`MAX(${schema.memories.createdAt})`
      })
      .from(schema.memories)
      .where(sql`${schema.memories.metadata}->>'project' IS NULL`);

    const projects = [];

    // Add default project if it has memories
    if (Number(defaultProjectResult[0].count) > 0) {
      projects.push({
        name: 'default',
        memoryCount: Number(defaultProjectResult[0].count),
        firstCreated: defaultProjectResult[0].firstCreated,
        lastUpdated: defaultProjectResult[0].lastUpdated,
        isCurrent: currentProject === 'default',
      });
    }

    // Add named projects
    for (const row of projectsResult.rows as any[]) {
      projects.push({
        name: row.project_name,
        memoryCount: Number(row.memory_count),
        firstCreated: row.first_created,
        lastUpdated: row.last_updated,
        isCurrent: currentProject === row.project_name,
      });
    }

    return {
      success: true,
      projects,
      currentProject,
      totalProjects: projects.length,
    };
  } catch (error) {
    console.error('Error listing projects:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function handleGetCurrentProject(args: any) {
  return {
    success: true,
    currentProject,
  };
}

export async function handleDeleteProject(args: any) {
  try {
    const { projectName, confirmDelete } = args;

    if (!projectName || typeof projectName !== 'string') {
      throw new Error('Project name is required and must be a string');
    }

    if (confirmDelete !== true) {
      throw new Error('confirmDelete must be true to delete a project');
    }

    // Delete all memories for this project
    const deletedMemories = await db
      .delete(schema.memories)
      .where(
        projectName === 'default' 
          ? sql`${schema.memories.metadata}->>'project' IS NULL`
          : sql`${schema.memories.metadata}->>'project' = ${projectName}`
      )
      .returning();

    // If we deleted the current project, switch to default
    if (currentProject === projectName) {
      currentProject = 'default';
    }

    return {
      success: true,
      deletedProject: projectName,
      deletedMemoryCount: deletedMemories.length,
      message: `Successfully deleted project "${projectName}" and ${deletedMemories.length} associated memories`,
      currentProject,
    };
  } catch (error) {
    console.error('Error deleting project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Export function to get current project (for use by other tools)
export function getCurrentProject(): string {
  return currentProject;
}