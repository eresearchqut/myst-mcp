import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { parseMystSearchIndex } from '../src/index-source.js';
import { createDocsSearch } from '../src/search.js';
import type { IndexSource } from '../src/types.js';

describe('createDocsSearch', () => {
  it('returns useful search hits with absolute URLs', async () => {
    const search = createDocsSearch(await fixtureSource());
    const hits = await search.searchDocs('install', 3);

    expect(hits[0]).toMatchObject({
      title: 'Getting started with the demo package',
      section: 'Install the package',
      url: 'https://docs.example.org/getting-started/#install-the-package',
      type: 'lvl2'
    });
    expect(hits[0]?.snippet).toContain('Install the package');
  });
});

async function fixtureSource(): Promise<IndexSource> {
  const raw = await readFile(new URL('./fixture-myst.search.json', import.meta.url), 'utf8');

  return {
    base: 'https://docs.example.org',
    indexUrl: 'fixture',
    sourceType: 'remote',
    index: parseMystSearchIndex(raw)
  };
}
