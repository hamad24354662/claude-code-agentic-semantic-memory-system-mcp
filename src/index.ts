import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// 1. Import the tool definitions you created
import { createMemoryTool } from './tools/createMemory.js';
import { searchMemoryTool } from './tools/searchMemory.js';
import { deleteMemoryTool } from './tools/deleteMemory.js';
import { listMemoriesTool } from './tools/listMemories.js';
import { updateMemoryTool } from './tools/updateMemory.js';
import { 
  switchProjectTool, 
  listProjectsTool, 
  getCurrentProjectTool, 
  deleteProjectTool 
} from './tools/manageProjects.js';

console.log('MCP server process started. Initializing server...');

// 2. Create a list of all available tools
const tools = [
  createMemoryTool, 
  searchMemoryTool,
  deleteMemoryTool,
  listMemoriesTool,
  updateMemoryTool,
  switchProjectTool,
  listProjectsTool,
  getCurrentProjectTool,
  deleteProjectTool
];

// 3. Create the server instance
const server = new Server(
  {
    name: 'agentic-memory-server',
    version: '2.0.0', // Updated version
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// 4. CORRECTED: Handle the request for the list of tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log('Received ListTools request. Announcing available tools.');
  // Return the full definition of each tool
  return {
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// 5. NEW: Handle the actual call to a tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.log(`Received CallTool request for tool: ${name}`);

  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    console.error(`Error: Unknown tool called: ${name}`);
    throw new Error(`Unknown tool: ${name}`);
  }

  // Find and run the correct tool's handler function
  return await tool.handler(args || {});
});

console.log('SUCCESS: Server is initialized and ready to handle tool requests.');

// 6. Start the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('MCP server running on stdio');
}

runServer().catch((error) => {
  console.error('Failed to run server:', error);
  process.exit(1);
});