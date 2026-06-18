import { type RankedSearchResult, rankResults, SEARCH_ATTRIBUTES_ORDERED } from '@myst-theme/search';
import { createSearch as createMiniSearch } from '@myst-theme/search-minisearch';
import type { Options as MiniSearchOptions } from 'minisearch';

import type { IndexSource, SearchDocsHit, SearchRecord } from './types.js';
import { absoluteRecordUrl } from './url.js';

export const DEFAULT_SEARCH_LIMIT = 10;

const searchOptions: MiniSearchOptions<SearchRecord> = {
  fields: SEARCH_ATTRIBUTES_ORDERED as unknown as string[],
  storeFields: ['hierarchy', 'content', 'url', 'type', 'id', 'position'],
  idField: 'id',
  searchOptions: {
    fuzzy: 0.2,
    prefix: true
  }
};

export type DocsSearch = {
  searchDocs(query: string, limit?: number): Promise<SearchDocsHit[]>;
};

export function createDocsSearch(source: IndexSource): DocsSearch {
  const search = createMiniSearch(source.index.records, searchOptions);

  return {
    async searchDocs(query, limit = DEFAULT_SEARCH_LIMIT) {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return [];

      const results = await search(trimmedQuery);
      if (!results) return [];

      return rankResults(results)
        .slice(0, normalizeLimit(limit))
        .map((result, index) => toSearchHit(source, result, index));
    }
  };
}

function toSearchHit(source: IndexSource, record: RankedSearchResult, index: number): SearchDocsHit {
  return {
    title: record.hierarchy.lvl1 ?? null,
    section: deepestHierarchyValue(record.hierarchy),
    breadcrumb: hierarchyValues(record.hierarchy),
    url: absoluteRecordUrl(source.base, record.url),
    snippet: snippetForRecord(record),
    type: record.type,
    score: scoreForRank(record, index)
  };
}

export function hierarchyValues(hierarchy: SearchRecord['hierarchy']): string[] {
  return ['lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5', 'lvl6']
    .map((level) => hierarchy[level as keyof SearchRecord['hierarchy']])
    .filter((value): value is string => Boolean(value));
}

export function deepestHierarchyValue(hierarchy: SearchRecord['hierarchy']): string | null {
  const values = hierarchyValues(hierarchy);
  return values.at(-1) ?? null;
}

function snippetForRecord(record: SearchRecord): string {
  if (record.type === 'content') return truncate(record.content.replace(/\s+/g, ' ').trim());
  const heading = record.hierarchy[record.type];
  return heading ? truncate(heading) : '';
}

function truncate(value: string, maxLength = 300): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) return DEFAULT_SEARCH_LIMIT;
  return Math.max(1, Math.min(50, Math.floor(limit)));
}

function scoreForRank(result: RankedSearchResult, index: number): number {
  const attributeIndex = SEARCH_ATTRIBUTES_ORDERED.indexOf(result.ranking.attribute);
  const score =
    1000 -
    index * 10 -
    result.ranking.typos * 100 -
    Math.max(0, attributeIndex) * 20 -
    result.ranking.proximity -
    result.ranking.appearance / 100;

  return Number(score.toFixed(3));
}
