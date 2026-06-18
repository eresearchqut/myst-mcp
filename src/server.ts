import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { fetchPageFromIndex } from './page.js';
import { createDocsSearch } from './search.js';
import type { IndexSource } from './types.js';

export function createMystMcpServer(source: IndexSource, description?: string): McpServer {
  const docsTarget = description ? `${description} at ${source.base}` : `the MyST site at ${source.base}`;
  const server = new McpServer({
    name: 'myst-mcp',
    version: '0.1.0'
  });
  const docsSearch = createDocsSearch(source);

  server.registerTool(
    'search_docs',
    {
      title: 'Search pages',
      description: `Search pages in ${docsTarget}. Use this when the user asks about information that may be in this documentation site, or when you need to discover the right page URL before reading details. It searches the site's MyST myst.search.json index and returns ranked hits with title, section, breadcrumb, URL, snippet, type, and score. Search results are summaries from the index, not the complete page. After finding a relevant result, call fetch_page with that result's url to read the full page before answering detailed questions.`,
      inputSchema: {
        query: z.string().min(1).describe('Search query.'),
        limit: z.number().int().min(1).max(50).optional().describe('Maximum number of hits to return. Defaults to 10.')
      }
    },
    async ({ query, limit }) => {
      const results = await docsSearch.searchDocs(query, limit);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'fetch_page',
    {
      title: 'Fetch page',
      description: `Fetch a full page from ${docsTarget}. Use this after search_docs returns a relevant hit, or when the user provides a page URL from this site. It accepts either a full URL from search_docs or a record-relative URL, groups all index records for that page, and returns the title, canonical URL, and page text in document order. Prefer this over relying only on search snippets when answering because it returns the full reconstructed page content.`,
      inputSchema: {
        url: z.string().min(1).describe('Full or record-relative page URL.')
      }
    },
    async ({ url }) => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify(fetchPageFromIndex(source, url), null, 2)
        }
      ]
    })
  );

  return server;
}
