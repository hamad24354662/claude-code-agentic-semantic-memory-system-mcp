# CLAUDE.md Orchestration Pattern

## Overview

The `CLAUDE.md` file acts as a **quasi-orchestrator** for Claude Code, providing high-level instructions and context that shape how Claude interacts with your codebase and MCP servers. Think of it as a "constitution" or "operating manual" that Claude Code reads and follows throughout the session.

## How CLAUDE.md Works as an Orchestrator

### 1. Context Loading
When Claude Code starts or enters a project, it reads `CLAUDE.md` to understand:
- Project-specific rules and conventions
- Available capabilities (like memory systems)
- Behavioral guidelines
- Key commands and workflows

### 2. Implicit Agent Activation
Rather than explicitly calling agents, CLAUDE.md enables **intent-based activation**:
```markdown
## Key Capabilities
- **Semantic Memory**: This project has long-term memory
- **Specialist Agents**: Dedicated agents for memory operations

// Claude interprets: "I should use memory tools when appropriate"
```

### 3. Behavioral Shaping
CLAUDE.md shapes Claude's behavior through principles:
```markdown
## Core Principles
- **Immutable Memories**: Once created, never alter
- **High-Signal Only**: Store only reusable information
- **No Secrets**: Never store API keys or passwords

// Claude interprets: "Follow these rules when using memory"
```

## Template for CLAUDE.md Orchestration

```markdown
---
name: project_context
description: High-level context and orchestration rules for Claude Code
---

# Project Context: [Your Project Name]

This project uses advanced MCP capabilities for [purpose].

## System Architecture
Brief description of how the system works and key components.

## Available Capabilities

### 1. Semantic Memory System
- **Purpose**: Long-term information storage across sessions
- **Activation**: Use phrases like "remember this", "search for", "what do we know about"
- **Tools**: Automatically invoked based on intent
  - `create_memory` - Triggered by "remember", "store", "save for later"
  - `search_memory` - Triggered by "search", "find", "recall", "what do we know"
  - `list_memories` - Triggered by "show all", "list memories"
  - `delete_memory` - Triggered by "forget", "remove memory"

### 2. Project Management
- **Purpose**: Organize memories into separate contexts
- **Activation**: "switch to project X", "create new context"
- **Current Project**: [project_name]

## Orchestration Rules

### Memory Creation Rules
1. **Automatic Capture**: Store important decisions, user preferences, and key insights
2. **Quality Filter**: Only store non-obvious, reusable information
3. **Metadata Enrichment**: Always add context (type, category, source)

### Memory Search Rules
1. **Proactive Retrieval**: Search memories when starting related tasks
2. **Context Building**: Load relevant memories before making decisions
3. **Cross-Reference**: Check for contradictions or updates

### Project Switching Rules
1. **Context Preservation**: Save current context before switching
2. **Auto-Switch**: Detect when user changes domains (work vs personal)
3. **Memory Isolation**: Keep project memories separate

## Key Commands

### Memory Operations
- **Store**: `Remember that [information]`
- **Search**: `What do we know about [topic]?`
- **List**: `Show all memories about [topic]`
- **Delete**: `Forget about [topic]`

### Project Operations
- **Switch**: `Switch to [project] context`
- **Create**: `Create new project for [purpose]`
- **Status**: `What project are we in?`

## Behavioral Guidelines

### DO
✅ Proactively store important information
✅ Search memories before answering questions
✅ Create project namespaces for different contexts
✅ Update memories when information changes
✅ Build memory relationships for complex topics

### DON'T
❌ Store trivial or temporary information
❌ Duplicate existing memories
❌ Store sensitive data (passwords, keys, PII)
❌ Modify memories after creation (create new ones instead)
❌ Mix unrelated contexts in same project

## Agent Interaction Patterns

### Intent-Based Invocation
Instead of explicit tool calls, use natural language:
- "I need to remember that..." → Invokes memory creation
- "Let me check what we know..." → Invokes memory search
- "We should work in a different context..." → Invokes project switch

### Chained Operations
Combine multiple operations naturally:
1. Search for existing knowledge
2. Create new memories with relationships
3. Update project metadata
4. Generate summary

## Error Handling

### Memory Failures
- If memory creation fails → Log locally and retry
- If search returns nothing → Expand search terms
- If project switch fails → Stay in current context

### Conflict Resolution
- Contradicting memories → Create new memory noting the conflict
- Duplicate information → Link memories with relationships
- Project confusion → List all projects and clarify

## Performance Optimization

### Caching Strategy
- Recent searches are cached for 1 hour
- Frequently accessed memories prioritized
- Project metadata cached per session

### Batch Operations
- Group related memory creations
- Bulk search when starting tasks
- Preload project context on switch

## Monitoring and Maintenance

### Health Checks
- Verify memory system connectivity on startup
- Check embedding model availability
- Monitor database connection pool

### Cleanup Tasks
- Remove orphaned memories weekly
- Consolidate related memories monthly
- Archive old projects quarterly

## Extension Points

### Custom Agents
Add new capabilities by creating agents for:
- Memory analytics and insights
- Export/import operations
- Relationship mapping
- Duplicate detection

### Integration Hooks
- Pre-memory creation validation
- Post-search enrichment
- Project switch notifications
- Memory lifecycle events

---

## Quick Reference

| Intent | Triggers Memory Tool |
|--------|---------------------|
| "Remember..." | create_memory |
| "Store..." | create_memory |
| "Search for..." | search_memory |
| "What do we know..." | search_memory |
| "Show all..." | list_memories |
| "Forget..." | delete_memory |
| "Switch to..." | switch_project |

## Important Notes

- This file overrides default Claude behavior
- Updates here affect all Claude interactions
- Keep instructions clear and unambiguous
- Test changes in isolated environment first
```

## Best Practices for CLAUDE.md Orchestration

### 1. Layer Your Instructions
```
High-Level Context → Capabilities → Rules → Commands → Examples
```

### 2. Use Clear Trigger Phrases
Define specific phrases that should trigger agent activation:
- Explicit: "Remember that..." 
- Implicit: "It's worth noting that..." (also triggers memory)

### 3. Provide Fallback Behaviors
Always define what Claude should do when:
- Tools are unavailable
- Operations fail
- Ambiguous requests occur

### 4. Version Your Orchestration
Track changes to CLAUDE.md:
```markdown
## Version History
- v2.0: Added memory relations support
- v1.5: Introduced project namespaces
- v1.0: Basic memory operations
```

### 5. Test Orchestration Patterns
Create test scenarios:
```markdown
## Test Scenarios
1. User says "I prefer TypeScript" → Should create memory
2. User asks "What language do I prefer?" → Should search memory
3. User says "Let's work on personal stuff" → Should switch project
```

## Integration with MCP Servers

The CLAUDE.md orchestration pattern works seamlessly with MCP because:

1. **Tool Discovery**: Claude reads available MCP tools
2. **Intent Mapping**: CLAUDE.md maps intents to tools
3. **Automatic Invocation**: Natural language triggers tool calls
4. **Result Integration**: Tool outputs inform Claude's responses

## Example: Complete Orchestration Flow

1. **User**: "I'm working on a React app with TypeScript"
2. **CLAUDE.md**: Recognizes this as important context
3. **Orchestration**: Triggers memory creation
4. **MCP Tool**: `create_memory` stores the information
5. **User**: "What framework am I using?"
6. **CLAUDE.md**: Recognizes this as a search query
7. **Orchestration**: Triggers memory search
8. **MCP Tool**: `search_memory` retrieves "React with TypeScript"
9. **Claude**: "You're working on a React app with TypeScript"

This orchestration pattern makes Claude Code feel more intelligent and context-aware without requiring explicit tool invocations.