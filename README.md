# Claude Code Agentic Semantic Memory System (MCP)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Version](https://img.shields.io/badge/MCP-v0.6.2-blue)](https://github.com/anthropics/model-context-protocol)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org)

A sophisticated Model Context Protocol (MCP) server that provides Claude Code with persistent semantic memory capabilities, enabling long-term information storage and retrieval across sessions. This system allows Claude to remember context, preferences, and important information between conversations.

## 🌟 Key Features

- **🧠 Persistent Memory**: Information survives across Claude Code sessions
- **🔍 Semantic Search**: Retrieve memories based on meaning, not just keywords  
- **📁 Project Namespaces**: Organize memories into separate contexts/projects
- **🌐 Local Embeddings**: Works offline without external API dependencies
- **🔗 Memory Relations**: Create knowledge graphs with connected memories
- **🚀 Intent-Based Activation**: Natural language triggers automatic tool invocation
- **📊 Full CRUD Operations**: Create, read, update, and delete memories
- **🔐 Privacy-First**: All data stored in your own PostgreSQL database

## 🏗️ Architecture

### Core Components

```
agentic-memory/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── db/
│   │   ├── client.ts      # Database connection (Neon PostgreSQL)
│   │   └── schema.ts      # Drizzle ORM schema (memories, relations)
│   └── tools/
│       ├── createMemory.ts    # Store new memories
│       ├── searchMemory.ts    # Semantic search
│       ├── listMemories.ts    # List and filter memories
│       ├── deleteMemory.ts    # Remove memories
│       ├── updateMemory.ts    # Modify existing memories
│       ├── manageProjects.ts  # Project namespace management
│       └── simpleEmbedding.ts # Local embedding generation
├── run-server.sh          # Server startup script
└── .env                   # Environment configuration
```

### How It Works

1. **Claude Code** sends requests to the MCP server via stdio
2. **MCP Server** processes tool requests (create, search, delete memories)
3. **Embeddings** are generated locally using mathematical algorithms
4. **PostgreSQL** (Neon) stores memories with pgvector for semantic search
5. **Drizzle ORM** manages database operations and migrations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database with pgvector extension (Neon recommended)
- Claude Code CLI installed

### Installation

1. **Clone or copy this MCP server to your project:**
```bash
cp -r /path/to/agentic-memory /your/project/.claude/mcp-servers/
```

2. **Install dependencies:**
```bash
cd /your/project/.claude/mcp-servers/agentic-memory
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your database URL
```

4. **Run database migrations:**
```bash
npm run db:migrate
```

5. **Add to Claude Code:**
```bash
claude mcp add agentic-memory ./run-server.sh
```

6. **Verify connection:**
```bash
claude mcp list
# Should show: agentic-memory - ✓ Connected
```

## 📖 Usage

### Available MCP Tools

| Tool | Description | Example Use |
|------|-------------|-------------|
| `create_memory` | Store new information | "Remember that the user prefers TypeScript" |
| `search_memory` | Find relevant memories | "What do we know about the user's preferences?" |
| `list_memories` | View all memories | "Show all memories in current project" |
| `delete_memory` | Remove specific memory | "Delete memory with ID xyz" |
| `update_memory` | Modify existing memory | "Update the location information" |
| `switch_project` | Change memory namespace | "Switch to project 'work'" |
| `list_projects` | Show all projects | "What projects exist?" |
| `delete_project` | Remove entire project | "Delete the 'test' project" |

### Using with CLAUDE.md Orchestration

The `CLAUDE.md` file acts as a quasi-orchestrator, providing:
- **Context Instructions**: High-level rules for memory usage
- **Specialist Agents**: Memory agents that Claude Code can invoke
- **Immutability Principles**: Memories should be append-only
- **Quality Guidelines**: Only store high-signal, reusable information

Example CLAUDE.md pattern:
```markdown
# Project Context: [Your Project Name]

This project uses an advanced semantic memory system to learn and improve over time.

## Key Capabilities
- **Semantic Memory**: Long-term memory storage and retrieval
- **Specialist Agents**: Dedicated agents for memory operations

## Core Principles
- **Immutable Memories**: Once created, memories should not be altered
- **High-Signal Only**: Store only reusable, non-obvious information
- **No Secrets**: Never store API keys, passwords, or PII
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:
```env
# PostgreSQL connection (required)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Optional: Embedding configuration
EMBEDDING_MODEL=simple  # or 'llama' for advanced
EMBEDDING_DIMENSIONS=1536

# Optional: Default project
DEFAULT_PROJECT=default
```

### Database Schema

The system uses two main tables:
- `memories`: Stores content, embeddings, metadata, and timestamps
- `memory_relations`: Links related memories (parent-child relationships)

## 🧠 Embedding Systems

### Simple Embeddings (Default)
- **Pros**: No external dependencies, works offline, fast
- **Cons**: Less semantic accuracy
- **Use Case**: Development, restricted networks, testing

### Llama CPP Embeddings (Advanced)
- **Pros**: Higher semantic accuracy
- **Cons**: Requires model download, more resources
- **Use Case**: Production environments with good connectivity

## 🎭 Agent Architecture

### Current Agents
✅ **Memory CRUD Agents**: Create, read, update, delete operations
✅ **Project Management Agents**: Namespace organization
✅ **Search Agent**: Semantic similarity search

### Recommended Additional Agents

1. **Memory Relations Agent**
   - Create parent-child relationships
   - Build knowledge graphs
   - Track memory evolution

2. **Memory Analytics Agent**
   - Usage statistics
   - Memory patterns
   - Optimization recommendations

3. **Export/Import Agent**
   - Backup memories
   - Transfer between projects
   - Migration tools

4. **Deduplication Agent**
   - Detect similar memories
   - Merge duplicates
   - Maintain consistency

## 🚨 Common Issues & Solutions

### Issue: "Failed to connect" in MCP list
**Solution**: Check `.env` file exists and DATABASE_URL is correct

### Issue: Embedding dimension mismatch
**Solution**: Ensure EMBEDDING_DIMENSIONS matches your database vector size

### Issue: Memories not persisting across sessions
**Solution**: Verify database connection and that migrations have run

## 📝 Development

### Running TypeScript directly:
```bash
npm run dev
```

### Building for production:
```bash
npm run build
```

### Running tests:
```bash
npm test
```

## 🔄 Replication Guide

To replicate this setup in another codebase:

1. **Copy the MCP server directory**
2. **Set up a PostgreSQL database with pgvector**
3. **Configure environment variables**
4. **Run migrations**
5. **Add to Claude Code configuration**
6. **Create a CLAUDE.md file with memory instructions**
7. **Test with simple memory operations**

## 📊 Production Considerations

- **Database Scaling**: Consider connection pooling for heavy usage
- **Embedding Cache**: Implement caching for frequently accessed memories
- **Backup Strategy**: Regular database backups are essential
- **Security**: Never store sensitive information in memories
- **Monitoring**: Track memory usage and search performance

## 🤝 Contributing

This is a custom MCP implementation. To contribute:
1. Improve embedding algorithms
2. Add new memory management tools
3. Enhance search capabilities
4. Optimize database queries

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Contribution
- Improve embedding algorithms
- Add new memory management tools
- Enhance search capabilities
- Create visualization tools
- Optimize database queries
- Add support for more embedding models

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for Claude and the MCP protocol
- [Neon](https://neon.tech) for serverless PostgreSQL
- [Drizzle ORM](https://orm.drizzle.team) for database management
- The Claude Code community for feedback and suggestions

## 📧 Contact

**Tristan McInnis**
- GitHub: [@tristan-mcinnis](https://github.com/tristan-mcinnis)
- Project: [claude-code-agentic-semantic-memory-system-mcp](https://github.com/tristan-mcinnis/claude-code-agentic-semantic-memory-system-mcp)

---

**Built for Claude Code** - Enabling persistent, semantic memory across AI coding sessions.

⭐ If you find this project useful, please consider giving it a star on GitHub!