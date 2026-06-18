import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { parseMystSearchIndex } from '../src/index-source.js';

describe('parseMystSearchIndex', () => {
  it('parses version 1 indexes', async () => {
    const raw = await readFile(new URL('./fixture-myst.search.json', import.meta.url), 'utf8');

    expect(parseMystSearchIndex(raw).records).toHaveLength(6);
  });

  it('rejects unsupported versions', () => {
    expect(() => parseMystSearchIndex(JSON.stringify({ version: '2', records: [] }))).toThrow(/Expected version "1"/);
  });
});
