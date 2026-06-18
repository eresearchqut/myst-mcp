export declare function isHttpUrl(value: string): boolean;
export declare function stripTrailingSlash(value: string): string;
export declare function removeHash(value: string): string;
export declare function normalizePagePath(value: string): string;
export declare function normalizeRecordPath(value: string, base?: string): string;
export declare function resolveIndexLocation(input: string): {
    base: string;
    indexUrl: string;
    sourceType: 'remote' | 'local';
};
export declare function absoluteRecordUrl(base: string, recordUrl: string): string;
//# sourceMappingURL=url.d.ts.map