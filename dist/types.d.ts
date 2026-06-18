import type { MystSearchIndex as ThemeMystSearchIndex, SearchRecord as ThemeSearchRecord } from '@myst-theme/search';
export type SearchRecord = ThemeSearchRecord;
export type ContentRecord = Extract<SearchRecord, {
    type: 'content';
}>;
export type MystSearchIndex = ThemeMystSearchIndex & {
    version: '1';
    records: SearchRecord[];
};
export type IndexSource = {
    base: string;
    indexUrl: string;
    sourceType: 'remote' | 'local';
    index: MystSearchIndex;
};
export type SearchDocsInput = {
    query: string;
    limit?: number;
};
export type SearchDocsHit = {
    title: string | null;
    section: string | null;
    breadcrumb: string[];
    url: string;
    snippet: string;
    type: SearchRecord['type'];
    score: number;
};
export type FetchPageInput = {
    url: string;
};
export type FetchPageResult = {
    url: string;
    title: string | null;
    markdown: string;
};
//# sourceMappingURL=types.d.ts.map