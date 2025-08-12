#!/bin/bash
# Wrapper script to run the MCP server with proper environment

# Change to the MCP server directory
cd "$(dirname "$0")"

# Run the TypeScript server
exec node /Users/tristanmcinnis/Documents/L_Code/ClaudeCodeTest/node_modules/.bin/tsx src/index.ts