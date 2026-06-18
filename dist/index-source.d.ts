import type { IndexSource, MystSearchIndex } from './types.js';
export declare function loadIndexSource(input: string, options?: {
    refresh?: boolean;
}): Promise<IndexSource>;
export declare function parseMystSearchIndex(raw: string, source?: string): MystSearchIndex;
//# sourceMappingURL=index-source.d.ts.map