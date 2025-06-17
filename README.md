<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/stackzero-labs/ui">
    <img src="public/logo.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">@stackzero-labs/mcp</h3>

  <p align="center">
    Official MCP (Model Context Protocol) server for stackzero-labs/ui.
    <br />
    <a href="https://ui.stackzero.co"><strong>Official Docs »</strong></a>
    <br />
    <br />
    <a href="https://ui.stackzero.co/get-started">Get started</a>
    &middot;
    <a href="https://github.com/stackzero-labs/mcp/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/stackzero-labs/mcp/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

## Overview

This package allows you to run a model context server for stackzero-labs/ui components, enabling you to use the MCP protocol with your applications.

## 1-click install in Cursor

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=%40stackzero-labs%2Fmcp&config=eyJjb21tYW5kIjoibnB4IC15IEBzdGFja3plcm8tbGFicy9tY3BAbGF0ZXN0In0%3D)

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

### In Cursor (manual setup)

Go to Cursor settings, select `MCP`. Add to your Cursor configuration:

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

See [LICENSE](LICENSE) for details.
