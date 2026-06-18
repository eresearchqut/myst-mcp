import type { IndexSource, SearchDocsHit, SearchRecord } from './types.js';
export declare const DEFAULT_SEARCH_LIMIT = 10;
export type DocsSearch = {
    searchDocs(query: string, limit?: number): Promise<SearchDocsHit[]>;
};
export declare function createDocsSearch(source: IndexSource): DocsSearch;
export declare function hierarchyValues(hierarchy: SearchRecord['hierarchy']): string[];
export declare function deepestHierarchyValue(hierarchy: SearchRecord['hierarchy']): string | null;
//# sourceMappingURL=search.d.ts.map