import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function removeHash(value: string): string {
  const hashIndex = value.indexOf('#');
  return hashIndex === -1 ? value : value.slice(0, hashIndex);
}

export function normalizePagePath(value: string): string {
  if (!value) return '/';

  try {
    if (isHttpUrl(value)) {
      const parsed = new URL(value);
      return removeHash(`${parsed.pathname}${parsed.search}`) || '/';
    }
  } catch {
    return removeHash(value);
  }

  const withoutHash = removeHash(value);
  return withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`;
}

export function normalizeRecordPath(value: string, base?: string): string {
  const pagePath = normalizePagePath(value);

  if (!base || !isHttpUrl(value) || !isHttpUrl(base)) {
    return pagePath;
  }

  const inputUrl = new URL(value);
  const baseUrl = new URL(`${stripTrailingSlash(base)}/`);
  const basePath = stripTrailingSlash(baseUrl.pathname);

  if (!basePath || inputUrl.origin !== baseUrl.origin) {
    return pagePath;
  }

  if (pagePath === basePath) {
    return '/';
  }

  if (pagePath.startsWith(`${basePath}/`)) {
    const strippedPath = pagePath.slice(basePath.length);
    return strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`;
  }

  return pagePath;
}

export function resolveIndexLocation(input: string): { base: string; indexUrl: string; sourceType: 'remote' | 'local' } {
  if (isHttpUrl(input)) {
    const base = stripTrailingSlash(input);
    return {
      base,
      indexUrl: new URL('myst.search.json', `${base}/`).toString(),
      sourceType: 'remote'
    };
  }

  const resolved = path.resolve(input);
  const indexPath = resolved.endsWith('myst.search.json') ? resolved : path.join(resolved, 'myst.search.json');

  return {
    base: pathToFileURL(path.dirname(indexPath)).toString().replace(/\/+$/, ''),
    indexUrl: indexPath,
    sourceType: 'local'
  };
}

export function absoluteRecordUrl(base: string, recordUrl: string): string {
  if (isHttpUrl(recordUrl)) return recordUrl;
  return new URL(recordUrl.replace(/^\/+/, ''), `${stripTrailingSlash(base)}/`).toString();
}
