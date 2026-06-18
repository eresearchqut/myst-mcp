#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadIndexSource } from './index-source.js';
import { createMystMcpServer } from './server.js';
const USAGE = 'Usage: myst-mcp <site-url-or-local-path> ["Human description of these docs"]';
async function main() {
    const [sourceInput, ...descriptionParts] = process.argv.slice(2);
    const description = descriptionParts.join(' ').trim() || undefined;
    if (!sourceInput || sourceInput === '--help' || sourceInput === '-h') {
        process.stderr.write(`${USAGE}\n`);
        process.exit(sourceInput ? 0 : 1);
    }
    const source = await loadIndexSource(sourceInput);
    const server = createMystMcpServer(source, description);
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`myst-mcp failed: ${message}\n${USAGE}\n`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map