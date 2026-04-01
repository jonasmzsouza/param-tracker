import { resolveRootDomain } from '../domain/resolve-root-domain.js';
import { mergeUnique, sanitizeDomains } from '../utils/sanitize.js';

/**
 * Deeply validates and merges configuration objects.
 * Ensures all expected arrays exist and are sanitized.
 * @param
 * @param {object} defaults
 * @param {object} customConfig
 */
export function buildConfig(defaults, customConfig = {}) {
  // =========================
  // VALIDATE DEFAULTS (strict)
  // =========================
  if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) {
    throw new Error(
      '[ParamTracker] buildConfig: defaults must be a valid object'
    );
  }

  if (!defaults.form || !defaults.link) {
    throw new Error('[ParamTracker] Invalid defaults structure');
  }

  // =========================
  // VALIDATE CUSTOM CONFIG (lenient)
  // =========================
  const safeCustom =
    typeof customConfig === 'object' &&
    customConfig !== null &&
    !Array.isArray(customConfig)
      ? customConfig
      : {};

  const safeCustomForm =
    typeof safeCustom.form === 'object' &&
    safeCustom.form !== null &&
    !Array.isArray(safeCustom.form)
      ? safeCustom.form
      : {};

  const safeCustomLink =
    typeof safeCustom.link === 'object' &&
    safeCustom.link !== null &&
    !Array.isArray(safeCustom.link)
      ? safeCustom.link
      : {};

  // =========================
  // HELPERS (type guards)
  // =========================
  const ensureArray = (value) => (Array.isArray(value) ? value : []);

  // =========================
  // MERGE CONFIG
  // =========================
  const merged = {
    form: {
      acceptFormIds: mergeUnique(
        defaults.form.acceptFormIds,
        ensureArray(safeCustomForm.acceptFormIds)
      ),
    },

    link: {
      acceptOrigins: mergeUnique(
        defaults.link.acceptOrigins,
        ensureArray(safeCustomLink.acceptOrigins),
        { lowercase: true }
      ),

      ignorePathnames: mergeUnique(
        defaults.link.ignorePathnames,
        ensureArray(safeCustomLink.ignorePathnames),
        { lowercase: true }
      ),

      ignoreClasses: mergeUnique(
        defaults.link.ignoreClasses,
        ensureArray(safeCustomLink.ignoreClasses)
      ),

      ignoreProtocols: mergeUnique(
        defaults.link.ignoreProtocols,
        ensureArray(safeCustomLink.ignoreProtocols),
        { lowercase: true, ensureColon: true }
      ),

      ignoreAttrValues: mergeUnique(
        defaults.link.ignoreAttrValues,
        ensureArray(safeCustomLink.ignoreAttrValues)
      ),

      manageAttributes: mergeUnique(
        defaults.link.manageAttributes,
        ensureArray(safeCustomLink.manageAttributes),
        { lowercase: true }
      ),

      includeParams: mergeUnique(
        defaults.link.includeParams,
        ensureArray(safeCustomLink.includeParams),
        { lowercase: true }
      ),

      excludeParams: mergeUnique(
        defaults.link.excludeParams,
        ensureArray(safeCustomLink.excludeParams),
        { lowercase: true }
      ),
    },
  };

  // =========================
  // DOMAIN NORMALIZATION
  // =========================
  merged.link.acceptOrigins = sanitizeDomains(merged.link.acceptOrigins);

  merged.link.acceptOrigins = merged.link.acceptOrigins.map(resolveRootDomain);

  merged.link.acceptOrigins = [...new Set(merged.link.acceptOrigins)];

  return merged;
}
