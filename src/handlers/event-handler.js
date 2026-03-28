export function createEventHandler(instance) {
  return {
    // =========================
    // LISTENER MANAGEMENT
    // =========================

    /**
     * Add an event listener to a target and record it for later cleanup.
     *
     * @param {EventTarget} target - The target to attach the event listener to.
     * @param {string} event - The event type to listen for (e.g., "click", "input").
     * @param {(EventListener|Function)} handler - The handler function to invoke when the event fires.
     * @param {(boolean|AddEventListenerOptions)=} [options] - Optional options or useCapture flag forwarded to addEventListener.
     * @returns {void}
     */
    addListener(target, event, handler, options) {
      target.addEventListener(event, handler, options);
      instance._listeners.push({ target, event, handler });
    },

    /**
     * Remove all event listeners that have been registered and tracked on this instance.
     * 
     * @returns {void}
     */
    removeAllListeners() {
      instance._listeners.forEach(({ target, event, handler }) => {
        target.removeEventListener(event, handler);
      });
      instance._listeners = [];
    },

    // =========================
    // BIND EVENTS
    // =========================

    /**
     * Bind document-level event listeners used by the tracker.
     *
     * Registers handlers for user interactions on the document:
     * - "click" -> this.handleDocumentClick
     * - "contextmenu" -> this.handleContextMenu
     *
     * Uses this.addListener to attach the handlers. Intended to be called during
     * initialization to ensure the tracker receives document-level events.
     *
     * @returns {void}
     */
    bindEvents() {
      this.addListener(document, "click", this.handleDocumentClick);
      this.addListener(document, "contextmenu", this.handleContextMenu);
    },

    // =========================
    // EVENT HANDLERS
    // =========================

    /**
     * Handle a click event dispatched on the document and delegate to link/form handlers.
     * Note: This method performs side effects via `instance.handleLinkClick` and
     * `instance.addParamsToForm`.
     *
     * @private
     * @param {Event} event - The click event. The handler expects `event.target` to be an Element
     *                        (i.e. to implement `closest`) so it can locate ancestor anchors/forms.
     * @returns {void}
     *
     * @fires Tracker#handleLinkClick
     * @fires Tracker#addParamsToForm
     */
    handleDocumentClick(event) {
      if (event.defaultPrevented || !event.target.closest) return;

      const target = event.target;

      const linkElement = target.closest("a");
      const buttonElement = target.closest("button, input[type='submit']");

      // LINK (priority)
      if (linkElement && instance.shouldHandleLink(linkElement)) {
        instance.handleLinkClick(event, linkElement);
        return;
      }

      // FORM
      if (buttonElement) {
        const form = buttonElement.closest("form");
        if (!form) return;

        const isAcceptedForm = instance.config.form.acceptFormIds.some((id) =>
          form.id.includes(id)
        );

        if (isAcceptedForm) {
          instance.addParamsToForm(form);
        }
      }
    },

    /**
     * Contextmenu event handler that ensures anchor elements have an up-to-date href
     * before the browser context menu is shown (so actions like "Open in new tab" or
     * "Copy link" use the corrected URL).
     *
     * @param {Event} event - The contextmenu event (usually a MouseEvent) triggered by the user.
     * @returns {void}
     */
    handleContextMenu(event) {
      if (!event.target.closest) return;

      const linkElement = event.target.closest("a");
      if (!linkElement || !instance.shouldHandleLink(linkElement)) return;

      try {
        const origin = linkElement.origin;
        const pathname = linkElement.pathname;
        const hash = linkElement.hash;

        // Only handle accepted origins
        if (
          !instance.isAcceptedOrigin(origin) ||
          instance.config.link.ignorePathnames.some((p) =>
            pathname.includes(p)
          )
        ) {
          return;
        }

        const { href } = instance.generateHref(
          linkElement,
          origin,
          pathname,
          hash
        );

        // Preventively update the link href before the context menu opens
        // So "Open in new tab", "Copy link" etc will use the correct href
        if (href && href !== linkElement.href) {
          linkElement.href = href;
        }
      } catch (err) {
        console.warn("[ParamTracker] contextmenu error:", err);
      }
    },
  };
}