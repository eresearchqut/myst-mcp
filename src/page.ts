import { deepestHierarchyValue, hierarchyValues } from './search.js';
import type { FetchPageResult, IndexSource, SearchRecord } from './types.js';
import { absoluteRecordUrl, normalizeRecordPath } from './url.js';

export function fetchPageFromIndex(source: IndexSource, url: string): FetchPageResult {
  const targetPath = normalizeRecordPath(url, source.base);
  const records = source.index.records.filter((record: SearchRecord) => normalizeRecordPath(record.url, source.base) === targetPath);
  records.sort((left: SearchRecord, right: SearchRecord) => left.position - right.position);

  if (records.length === 0) {
    throw new Error(`No page matching ${url} was found in the MyST search index.`);
  }

  const title = records.find((record: SearchRecord) => record.hierarchy.lvl1)?.hierarchy.lvl1 ?? null;
  const pageUrl = absoluteRecordUrl(source.base, records[0]?.url ?? targetPath);

  return {
    url: pageUrl,
    title,
    markdown: records.map(recordToMarkdown).filter(Boolean).join('\n\n')
  };
}

function recordToMarkdown(record: SearchRecord): string {
  if (record.type === 'content') {
    const prefix = contentPrefix(record);
    const content = record.content.trim();
    return prefix ? `${prefix}\n\n${content}` : content;
  }

  const level = Number(record.type.replace('lvl', ''));
  const text = record.hierarchy[record.type]?.trim();
  if (!text) return '';

  return `${'#'.repeat(Math.max(1, Math.min(6, level)))} ${text}`;
}

function contentPrefix(record: SearchRecord): string {
  const section = deepestHierarchyValue(record.hierarchy);
  const breadcrumb = hierarchyValues(record.hierarchy);

  if (!section || breadcrumb.at(-1) !== section) return '';
  return `Section: ${breadcrumb.join(' > ')}`;
}
