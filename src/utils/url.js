/**
 * Normalizes a potentially malformed query string that may contain
 * “??” or “&&”, params embedded in values (e.g., custom=example?utm_source=example), or %3F.
 * Returns a URLSearchParams with all pairs correctly extracted.
 * @param {string} rawQuery - e.g., “?custom=example?utm_source=example&utm_medium=example”
 * @returns {URLSearchParams}
 */
export function normalizeQueryString(rawQuery = '') {
  let remaining = rawQuery.replace(/^[?&]+/, '');
  const result = new URLSearchParams();

  while (remaining) {
    const [firstPart, rest] = remaining.split(/\?(.+)/s);
    const firstParams = new URLSearchParams(firstPart);

    for (const [k, v] of firstParams) result.append(k, v);

    if (!rest) break;
    remaining = rest;
  }

  const entries = Array.from(result.entries());

  for (const [k, v] of entries) {
    if (v.includes('%3F') || v.includes('%3f')) {
      const decoded = decodeURIComponent(v);

      if (decoded.includes('?')) {
        const [valBefore, valAfter] = decoded.split(/\?(.+)/s);
        result.set(k, valBefore);

        const tail = new URLSearchParams(valAfter);
        for (const [tk, tv] of tail) {
          if (!result.has(tk)) result.append(tk, tv);
        }
      }
    }
  }

  return result;
}

/**
 * Check if the URL points to a file (based on extension).
 * Includes defensive checks and cached regex for better performance.
 * @param {string} url
 * @return {boolean}
 */
export const isFileUrl = (() => {
  const extensions = [
    'pdf',
    'doc',
    'docx',
    'rtf',
    'txt',
    'md',
    'json',
    'xls',
    'xlsx',
    'csv',
    'ppt',
    'pptx',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'svg',
    'avif',
    'webp',
    'mp3',
    'wav',
    'aac',
    'mid',
    'midi',
    'flac',
    'ogg',
    'mp4',
    'avi',
    'mov',
    'wmv',
    'mkv',
    'webm',
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
    'bz2',
    'tar.gz',
    'tar.bz2',
    'exe',
    'msi',
    'dll',
    'sys',
    'bat',
    'sh',
    'css',
    'js',
    'php',
    'xml',
    'ts',
    'jsx',
    'tsx',
    'vue',
    'ini',
    'conf',
    'cfg',
    'env',
    'yaml',
    'yml',
  ];

  // Precompile the regex for performance
  const fileRegex = new RegExp(`\\.(${extensions.join('|')})$`, 'i');

  // Returns the function that checks if a URL is a file link
  return function (url) {
    if (typeof url !== 'string' || url.trim() === '') return false;

    try {
      const normalizedUrl = url.startsWith('http')
        ? url
        : `https://${url.replace(/^\/+/, '')}`;

      const { pathname } = new URL(normalizedUrl);
      return fileRegex.test(pathname);
    } catch {
      return false;
    }
  };
})();
