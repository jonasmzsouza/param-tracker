/**
 * Sanitizes string arrays: trims, lowercases, deduplicates, and optionally ensures `:` suffix.
 * 
 * @param {Array<any>} arr
 * @param {Object} [options]
 * @param {boolean} [options.lowercase=false]
 * @param {boolean} [options.ensureColon=false]
 * @returns {Array<string>}
 */
export function sanitizeStringArray(arr = [], options = {}) {
  if (!Array.isArray(arr)) return [];

  const { lowercase = false, ensureColon = false } = options;

  const normalized = arr
    .filter((item) => typeof item === "string" && item.trim() !== "")
    .map((item) => {
      let clean = item.trim();
      if (lowercase) clean = clean.toLowerCase();
      if (ensureColon && !clean.endsWith(":")) clean += ":";
      return clean;
    });

  return [...new Set(normalized)];
}

/**
 * Sanitizes and validates domain names.
 * @param {Array<string>} domains 
 * @returns {Array<string>}
*/
export function sanitizeDomains(domains = []) {
  const domainRegex =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z]{2,}$/i;

  return domains
    .filter((d) => typeof d === "string" && d.trim() !== "")
    .map((d) => d.trim().toLowerCase())
    .filter((d) => domainRegex.test(d));
}

/**
 * Merges two arrays safely, removing invalid entries and duplicates.
 * Delegates normalization rules to `sanitizeStringArray`.
 * 
 * @param {Array<any>} defaultArr - Default configuration array
 * @param {Array<any>} customArr - Custom configuration array
 * @param {Object} [options] - Normalization options
 * @param {boolean} [options.lowercase=false] - Convert all strings to lowercase
 * @param {boolean} [options.ensureColon=false] - Ensure trailing colon at the end (useful for protocols)
 * @returns {Array<string>}
 */
export function mergeUnique(defaultArr = [], customArr = [], options = {}) {
  const safeDefault = Array.isArray(defaultArr) ? defaultArr : [];
  const safeCustom = Array.isArray(customArr) ? customArr : [];

  return sanitizeStringArray([...safeDefault, ...safeCustom], options);
}