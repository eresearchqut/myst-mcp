import { readFile } from 'node:fs/promises';

import type { IndexSource, MystSearchIndex, SearchRecord } from './types.js';
import { resolveIndexLocation } from './url.js';

const indexCache = new Map<string, IndexSource>();

type RawSearchIndex = {
  version?: unknown;
  records?: unknown;
};

export async function loadIndexSource(input: string, options: { refresh?: boolean } = {}): Promise<IndexSource> {
  const location = resolveIndexLocation(input);

  if (!options.refresh) {
    const cached = indexCache.get(location.indexUrl);
    if (cached) return cached;
  }

  const raw = location.sourceType === 'remote' ? await fetchRemoteIndex(location.indexUrl) : await readFile(location.indexUrl, 'utf8');
  const index = parseMystSearchIndex(raw, location.indexUrl);
  const source = { ...location, index };

  indexCache.set(location.indexUrl, source);
  return source;
}

export function parseMystSearchIndex(raw: string, source = 'myst.search.json'): MystSearchIndex {
  let parsed: RawSearchIndex;

  try {
    parsed = JSON.parse(raw) as RawSearchIndex;
  } catch (error) {
    throw new Error(`Could not parse ${source} as JSON: ${errorMessage(error)}`);
  }

  if (parsed.version !== '1') {
    throw new Error(`Unsupported MyST search index version in ${source}. Expected version "1".`);
  }

  if (!Array.isArray(parsed.records)) {
    throw new Error(`Invalid MyST search index in ${source}: expected a records array.`);
  }

  return {
    version: '1',
    records: parsed.records.map((record, index) => normalizeRecord(record, index, source))
  };
}

async function fetchRemoteIndex(indexUrl: string): Promise<string> {
  let response: Response;

  try {
    response = await fetch(indexUrl, {
      headers: {
        accept: 'application/json'
      }
    });
  } catch (error) {
    throw new Error(`Could not fetch ${indexUrl}. Check the site URL and network access. ${errorMessage(error)}`);
  }

  if (!response.ok) {
    throw new Error(
      `Could not fetch ${indexUrl}. Received HTTP ${response.status}. Check that this is a MyST site with myst.search.json published.`
    );
  }

  return response.text();
}

function normalizeRecord(record: unknown, index: number, source: string): SearchRecord {
  if (!isRecordObject(record)) {
    throw new Error(`Invalid record ${index} in ${source}: expected an object.`);
  }

  if (!isRecordObject(record.hierarchy)) {
    throw new Error(`Invalid record ${index} in ${source}: expected hierarchy object.`);
  }

  if (typeof record.url !== 'string' || record.url.length === 0) {
    throw new Error(`Invalid record ${index} in ${source}: expected non-empty url.`);
  }

  if (typeof record.position !== 'number') {
    throw new Error(`Invalid record ${index} in ${source}: expected numeric position.`);
  }

  if (!isKnownRecordType(record.type)) {
    throw new Error(`Invalid record ${index} in ${source}: unsupported type ${String(record.type)}.`);
  }

  if (record.type === 'content' && typeof record.content !== 'string') {
    throw new Error(`Invalid record ${index} in ${source}: content records require content text.`);
  }

  return record as SearchRecord;
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isKnownRecordType(value: unknown): value is SearchRecord['type'] {
  return (
    value === 'content' ||
    value === 'lvl1' ||
    value === 'lvl2' ||
    value === 'lvl3' ||
    value === 'lvl4' ||
    value === 'lvl5' ||
    value === 'lvl6'
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
