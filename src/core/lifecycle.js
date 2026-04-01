import { restoreScrollHash } from '../handlers/dom-utils.js';

export function createLifecycle(instance) {
  return {
    /**
     * Initializes the tracker module
     * @returns {void}
     */
    init() {
      if (instance._initialized) return instance;

      instance.sanitizeLinks();
      instance.bindEvents();
      restoreScrollHash();
      instance.observeDOM();

      instance._initialized = true;
      return instance;
    },

    /**
     * Gracefully destroys the tracker instance, releasing resources and resetting internal state.
     * The method is idempotent and safe to call multiple times.
     *
     * @returns {void}
     */
    destroy() {
      if (!instance._initialized) return;

      instance.removeAllListeners();
      instance.disconnectObserver();

      instance._originCache.clear();
      instance._initialized = false;
    },

    /**
     * Clear internal origin cache and re-run link sanitization.
     * @returns {void}
     */
    refresh() {
      instance._originCache.clear();
      instance.sanitizeLinks();
    },
  };
}
