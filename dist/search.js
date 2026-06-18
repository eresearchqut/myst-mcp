import { rankResults, SEARCH_ATTRIBUTES_ORDERED } from '@myst-theme/search';
import { createSearch as createMiniSearch } from '@myst-theme/search-minisearch';
import { absoluteRecordUrl } from './url.js';
export const DEFAULT_SEARCH_LIMIT = 10;
const searchOptions = {
    fields: SEARCH_ATTRIBUTES_ORDERED,
    storeFields: ['hierarchy', 'content', 'url', 'type', 'id', 'position'],
    idField: 'id',
    searchOptions: {
        fuzzy: 0.2,
        prefix: true
    }
};
export function createDocsSearch(source) {
    const search = createMiniSearch(source.index.records, searchOptions);
    return {
        async searchDocs(query, limit = DEFAULT_SEARCH_LIMIT) {
            const trimmedQuery = query.trim();
            if (!trimmedQuery)
                return [];
            const results = await search(trimmedQuery);
            if (!results)
                return [];
            return rankResults(results)
                .slice(0, normalizeLimit(limit))
                .map((result, index) => toSearchHit(source, result, index));
        }
    };
}
function toSearchHit(source, record, index) {
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
export function hierarchyValues(hierarchy) {
    return ['lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5', 'lvl6']
        .map((level) => hierarchy[level])
        .filter((value) => Boolean(value));
}
export function deepestHierarchyValue(hierarchy) {
    const values = hierarchyValues(hierarchy);
    return values.at(-1) ?? null;
}
function snippetForRecord(record) {
    if (record.type === 'content')
        return truncate(record.content.replace(/\s+/g, ' ').trim());
    const heading = record.hierarchy[record.type];
    return heading ? truncate(heading) : '';
}
function truncate(value, maxLength = 300) {
    if (value.length <= maxLength)
        return value;
    return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}
function normalizeLimit(limit) {
    if (!Number.isFinite(limit))
        return DEFAULT_SEARCH_LIMIT;
    return Math.max(1, Math.min(50, Math.floor(limit)));
}
function scoreForRank(result, index) {
    const attributeIndex = SEARCH_ATTRIBUTES_ORDERED.indexOf(result.ranking.attribute);
    const score = 1000 -
        index * 10 -
        result.ranking.typos * 100 -
        Math.max(0, attributeIndex) * 20 -
        result.ranking.proximity -
        result.ranking.appearance / 100;
    return Number(score.toFixed(3));
}
//# sourceMappingURL=search.js.map