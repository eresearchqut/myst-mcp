# myst-mcp

`myst-mcp` is an MCP server for searching any MyST Markdown or Jupyter Book documentation site that publishes `myst.search.json`. It consumes the static search index that MyST already builds, so it does not crawl pages, host a backend, or require embeddings.

MyST is the document engine and Jupyter Book is a distribution of it. The `myst.search.json` index is produced at the MyST engine layer, which means this package works across book-theme, article-theme, custom themes, Jupyter Book, and plain `mystmd` sites.

## Usage

```sh
npx -y myst-mcp <site-url-or-local-path> ["Human description of these docs"]
```

Examples:

```sh
npx -y myst-mcp https://your-myst-site.example "Example MyST docs"
```

```jsonc
{
  "mcpServers": {
    "my-docs": {
      "command": "npx",
      "args": ["-y", "myst-mcp", "https://your-myst-site.example", "Example MyST docs"]
    }
  }
}
```

Claude Code:

```sh
claude mcp add my-docs -- npx -y myst-mcp https://your-myst-site.example "Example MyST docs"
```

## Tools

### `search_docs`

Input:

```json
{ "query": "installation", "limit": 10 }
```

Returns search hits with title, section, breadcrumb, absolute URL, snippet, type, and score.

### `fetch_page`

Input:

```json
{ "url": "/getting-started/" }
```

Returns the page title and LLM-friendly Markdown reconstructed from all matching search index records in document order. Full URLs and anchor URLs are accepted.

## Supported sources

- Remote MyST sites, loaded from `<base>/myst.search.json`
- Local MyST site build directories containing `myst.search.json`
- A direct local path to `myst.search.json`

The server requires `MystSearchIndex` version `"1"` and fails clearly if the file is missing, invalid, or from an unsupported future version.

## Development

```sh
pnpm install
pnpm build
pnpm test
```
