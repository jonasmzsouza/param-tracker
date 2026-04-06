import { normalizeQueryString } from './url.js';

/**
 * Performs a safe merge between the current page and link parameters,
 * preserving page UTMs when they exist and normalizing malformed queries.
 * @param {string} baseUrl - e.g., ‘https://domain.com/page’
 * @param {string} rawLinkQuery - e.g., linkUrl.search (may be malformed)
 * @param {string} rawCurrentQuery - e.g.: window.location.search
 * @param {Array<string>} excludeParams - list of parameters to remove
 * @returns {string} final URL (baseUrl + ‘?’ + mergedParams) or baseUrl if empty
 */
export function sanitizeAndMergeParams(
  config,
  baseUrl,
  rawLinkQuery = '',
  rawCurrentQuery = ''
) {
  try {
    const linkSearch = normalizeQueryString(rawLinkQuery);

    const currentSearch = new URLSearchParams(
      (rawCurrentQuery || '').replace(/^[?&]+/, '')
    );

    // First, add the link parameters to currentSearch,
    // but DO NOT overwrite UTMs that already exist in currentSearch.
    for (const [key, value] of linkSearch.entries()) {
      const lowerKey = key.toLowerCase();
      const isUtm = config.link.includeParams.includes(lowerKey);

      if (isUtm && currentSearch.has(key)) continue; // preserves currentSearch (does not overwrite)

      currentSearch.set(key, value); // otherwise, set (overwrites or adds)
    }

    // Remove unwanted parameters
    config.link.excludeParams.forEach((p) => currentSearch.delete(p));

    const finalQuery = currentSearch.toString();
    return finalQuery ? `${baseUrl}?${finalQuery}` : baseUrl;
  } catch {
    return baseUrl;
  }
}

/**
 * Removes search parameters from the URL.
 * Useful for post-search navigation on the site.
 * @param {String} search
 * @return {String}
 */
export function removeURLParams(config, search) {
  const urlParams = new URLSearchParams(search);

  config.link.excludeParams.forEach((param) => urlParams.delete(param));

  return urlParams.toString() ? '?' + urlParams.toString() : '';
}
