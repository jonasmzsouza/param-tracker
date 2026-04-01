export function createDOMObserverHandler(instance) {
  return {
    /**
     * Observe the document body for added nodes and trigger link sanitization.
     * @returns {void}
     */
    observeDOM() {
      if (instance._observer) return;

      instance._observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            instance.sanitizeLinks();
            break;
          }
        }
      });

      instance._observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    },

    disconnectObserver() {
      if (!instance._observer) return;

      instance._observer.disconnect();
      instance._observer = null;
    },
  };
}
