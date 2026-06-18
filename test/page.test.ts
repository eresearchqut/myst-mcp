import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { parseMystSearchIndex } from '../src/index-source.js';
import { fetchPageFromIndex } from '../src/page.js';
import type { IndexSource } from '../src/types.js';

describe('fetchPageFromIndex', () => {
  it('reconstructs a page in position order and groups anchors together', async () => {
    const page = fetchPageFromIndex(await fixtureSource(), 'https://docs.example.org/scheduled-jobs/#checkpointing');

    expect(page.title).toBe('Running scheduled jobs');
    expect(page.url).toBe('https://docs.example.org/scheduled-jobs/#checkpointing');
    expect(page.markdown.indexOf('example CLI')).toBeLessThan(page.markdown.indexOf('checkpointing'));
  });

  it('accepts record-relative URLs', async () => {
    const page = fetchPageFromIndex(await fixtureSource(), '/getting-started/');

    expect(page.markdown).toContain('demo package');
  });

  it('accepts full URLs for sites served under a sub-path', async () => {
    const page = fetchPageFromIndex(
      await fixtureSource('https://docs.example.org/guide'),
      'https://docs.example.org/guide/getting-started/'
    );

    expect(page.url).toBe('https://docs.example.org/guide/getting-started/');
    expect(page.markdown).toContain('demo package');
  });
});

async function fixtureSource(base = 'https://docs.example.org'): Promise<IndexSource> {
  const raw = await readFile(new URL('./fixture-myst.search.json', import.meta.url), 'utf8');

  return {
    base,
    indexUrl: 'fixture',
    sourceType: 'remote',
    index: parseMystSearchIndex(raw)
  };
}
