#!/bin/bash

# Cleanup script for agentic-memory MCP server
# Removes redundant JS files, test scripts, and temporary files

echo "🧹 Cleaning up agentic-memory MCP server..."

# Remove compiled JavaScript files (we'll use TypeScript directly)
echo "Removing compiled JS files..."
find src -name "*.js" -type f -delete
find src -name "*.js.map" -type f -delete
find src -name "*.d.ts" -type f -delete
find src -name "*.d.ts.map" -type f -delete

# Remove test and utility scripts
echo "Removing test scripts..."
rm -f test-*.ts test-*.mjs test-*.js
rm -f add-*.ts add-*.js
rm -f delete-*.ts delete-*.js
rm -f verify-*.ts verify-*.js
rm -f check-*.ts check-*.js
rm -f fix-*.ts fix-*.js
rm -f db-test.ts db-test.js
rm -f simple-test.ts simple-test.js
rm -f simple.ts simple.js

# Remove build artifacts
echo "Removing build artifacts..."
rm -rf dist/
rm -f .tsbuildinfo

# Remove node_modules if requested
if [ "$1" = "--full" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules/
fi

# Count remaining files
echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Remaining structure:"
find . -type f -name "*.ts" -o -name "*.md" -o -name "*.json" -o -name "*.sh" -o -name ".env*" -o -name ".gitignore" | grep -v node_modules | sort

echo ""
echo "💡 Run 'npm install' to reinstall dependencies if needed"
echo "💡 Run 'npm run build' to compile TypeScript files"