# @stackzero-labs/mcp

MCP (Model Context Protocol) server for stackzero-labs/ui components.

## Installation

```bash
npm install @stackzero-labs/mcp
```

## Usage

### As a standalone server

```bash
npx @stackzero-labs/mcp
```

### In Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "@stackzero-labs/mcp": {
      "command": "npx",
      "args": ["-y", "@stackzero-labs/mcp@latest"]
    }
  }
}
```

### Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in development mode
pnpm dev

# Inspect the MCP server
pnpm inspect
```

## License

MIT
