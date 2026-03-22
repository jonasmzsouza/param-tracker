/*! ParamTracker 4.0.0 | MIT License | (c) Jonas Souza 2023-2026 | https://github.com/jonasmzsouza/param-tracker */
(() => {
  // src/tracker.js
  var ParamTracker = class {
    /**
     * @param {Object} customConfig - Custom client configuration
     */
    constructor(customConfig = {}) {
      const defaults = {
        /**
         * FORM CONFIGURATION
         * Controls how parameters are propagated to HTML forms.
         */
        form: {
          /**
           * List of form element IDs that should receive UTM and custom parameters automatically.
           * Example: ["contactForm", "leadForm"]
           */
          acceptFormIds: []
        },
        /**
         * LINK CONFIGURATION
         * Defines how links (<a> elements) are filtered, ignored, and processed.
         */
        link: {
          /**
           * Accepted domains or subdomains for parameter propagation.
           * Any link whose hostname is not in this list will be ignored.
           * Default: current page hostname.
           * Example: ["example.com", "another.com"]
           * Note: subdomains are accepted automatically (e.g., *.example.com).
           */
          acceptOrigins: [window?.location?.hostname?.toLowerCase() || ""],
          /**
           * List of URL pathnames where tracking should be disabled.
           * Example: ["/admin", "/manage"]
           */
          ignorePathnames: [],
          /**
           * CSS class names to skip from tracking.
           * Any link containing one of these classes will be ignored.
           * Example: ["no-track", "external-link"]
           */
          ignoreClasses: [],
          /**
           * URL protocols that should not be tracked or modified.
           * These are typically non-web or unsafe links (e.g. downloads, mailto, file, blob, etc.).
           * Example: ["mailto:", "tel:", "ftp:"]
           */
          ignoreProtocols: [
            "mailto:",
            "tel:",
            "sms:",
            "file:",
            "blob:",
            "data:",
            "ftp:",
            "ftps:",
            "javascript:"
          ],
          /**
           * Values that, when matched, will cause a link to be ignored.
           * Used in conjunction with `manageAttributes` to check specific attributes.
           * Example:
           *   manageAttributes: ["role", "data-custom", "download"]
           *   ignoreAttrValues: ["button", "dropdown", "tab", "modal"]
           */
          ignoreAttrValues: [],
          /**
           * List of link attributes to inspect for matching values.
           * Typically used with `ignoreAttrValues` to skip links with certain patterns.
           * Example: ["role", "data-custom", "download"]
           */
          manageAttributes: [],
          /**
           * Parameters to preserve and propagate between links or forms.
           * Commonly used for marketing attribution (UTM parameters).
           * Example: ["utm_source", "utm_medium", "utm_campaign", "ref"]
           */
          includeParams: [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_id",
            "utm_term",
            "utm_content"
          ],
          /**
           * Parameters to remove from the URL before propagation.
           * Useful for cleaning up unnecessary or sensitive query parameters.
           * Example: ["s", "type", "category"]
           */
          excludeParams: []
        }
      };
      this.config = this.mergeConfig(defaults, customConfig);
      this._initialized = false;
      this._listeners = [];
      this._originCache = /* @__PURE__ */ new Map();
      this._observer = null;
    }
    /**
     * Initializes the tracker module
     * @returns {void}
     */
    init = () => {
      if (this._initialized) return this;
      this.sanitizeLinks();
      this.bindEvents();
      this.restoreScrollHash();
      this.observeDOM();
      this._initialized = true;
      return this;
    };
    /**
     * Clear internal origin cache and re-run link sanitization.
     * @returns {void}
     */
    refresh = () => {
      this._originCache.clear();
      this.sanitizeLinks();
    };
    /**
     * Gracefully destroys the tracker instance, releasing resources and resetting internal state.
     * The method is idempotent and safe to call multiple times.
     *
     * @returns {void}
     */
    destroy = () => {
      if (!this._initialized) return;
      this.removeAllListeners();
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
      this._originCache.clear();
      this._initialized = false;
    };
    /**
     * Observe the document body for added nodes and trigger link sanitization.
     * @returns {void}
     */
    observeDOM = () => {
      if (this._observer) return;
      this._observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            this.sanitizeLinks();
            break;
          }
        }
      });
      this._observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    };
    /**
     * Add an event listener to a target and record it for later cleanup.
     *
     * @param {EventTarget} target - The target to attach the event listener to.
     * @param {string} event - The event type to listen for (e.g., "click", "input").
     * @param {(EventListener|Function)} handler - The handler function to invoke when the event fires.
     * @param {(boolean|AddEventListenerOptions)=} [options] - Optional options or useCapture flag forwarded to addEventListener.
     * @returns {void}
     */
    addListener = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      this._listeners.push({ target, event, handler });
    };
    /**
     * Remove all event listeners that have been registered and tracked on this instance.
     * 
     * @returns {void}
     */
    removeAllListeners = () => {
      this._listeners.forEach(({ target, event, handler }) => {
        target.removeEventListener(event, handler);
      });
      this._listeners = [];
    };
    /**
     * Sanitizes string arrays: trims, lowercases, deduplicates, and optionally ensures `:` suffix.
     * 
     * @param {Array<any>} arr
     * @param {Object} [options]
     * @param {boolean} [options.lowercase=false]
     * @param {boolean} [options.ensureColon=false]
     * @returns {Array<string>}
     */
    sanitizeStringArray = (arr = [], options = {}) => {
      if (!Array.isArray(arr)) return [];
      const { lowercase = false, ensureColon = false } = options;
      const normalized = arr.filter((item) => typeof item === "string" && item.trim() !== "").map((item) => {
        let clean = item.trim();
        if (lowercase) clean = clean.toLowerCase();
        if (ensureColon && !clean.endsWith(":")) clean += ":";
        return clean;
      });
      return [...new Set(normalized)];
    };
    /**
     * Sanitizes and validates domain names.
     * @param {Array<string>} domains 
     * @returns {Array<string>}
    */
    sanitizeDomains = (domains = []) => {
      const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z]{2,}$/i;
      return domains.filter((d) => typeof d === "string" && d.trim() !== "").map((d) => d.trim().toLowerCase()).filter((d) => domainRegex.test(d));
    };
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
    mergeUnique = (defaultArr = [], customArr = [], options = {}) => {
      const safeDefault = Array.isArray(defaultArr) ? defaultArr : [];
      const safeCustom = Array.isArray(customArr) ? customArr : [];
      return this.sanitizeStringArray([...safeDefault, ...safeCustom], options);
    };
    /**
    * Deeply validates and merges configuration objects.
    * Ensures all expected arrays exist and are sanitized.
    * @param {object} defaults
    * @param {object} customConfig
    */
    mergeConfig = (defaults, customConfig = {}) => {
      const safeCustomForm = customConfig.form && typeof customConfig.form === "object" ? customConfig.form : {};
      const safeCustomLink = customConfig.link && typeof customConfig.link === "object" ? customConfig.link : {};
      const merged = {
        form: {
          acceptFormIds: this.mergeUnique(defaults.form?.acceptFormIds, safeCustomForm.acceptFormIds)
        },
        link: {
          acceptOrigins: this.mergeUnique(defaults.link?.acceptOrigins, safeCustomLink.acceptOrigins, { lowercase: true }),
          ignorePathnames: this.mergeUnique(defaults.link?.ignorePathnames, safeCustomLink.ignorePathnames, { lowercase: true }),
          ignoreClasses: this.mergeUnique(defaults.link?.ignoreClasses, safeCustomLink.ignoreClasses),
          ignoreProtocols: this.mergeUnique(defaults.link?.ignoreProtocols, safeCustomLink.ignoreProtocols, { lowercase: true, ensureColon: true }),
          ignoreAttrValues: this.mergeUnique(defaults.link?.ignoreAttrValues, safeCustomLink.ignoreAttrValues),
          manageAttributes: this.mergeUnique(defaults.link?.manageAttributes, safeCustomLink.manageAttributes, { lowercase: true }),
          includeParams: this.mergeUnique(defaults.link?.includeParams, safeCustomLink.includeParams, { lowercase: true }),
          excludeParams: this.mergeUnique(defaults.link?.excludeParams, safeCustomLink.excludeParams, { lowercase: true })
        }
      };
      merged.link.acceptOrigins = this.sanitizeDomains(merged.link.acceptOrigins);
      return merged;
    };
    /**
     * Sanitizes existing links in the HTML
     * @returns {void}
     */
    sanitizeLinks = () => {
      document.querySelectorAll("a[href]").forEach((link) => {
        if (!this.shouldHandleLink(link)) return;
        const url = new URL(link.href);
        const hash = url.hash || "";
        const sanitized = this.sanitizeAndMergeParams(
          url.origin + url.pathname,
          url.search,
          "",
          this.config.link.excludeParams
        );
        const finalHref = sanitized + hash;
        if (finalHref !== link.href) link.href = finalHref;
      });
    };
    /**
     * Check if the URL points to a file (based on extension).
     * Includes defensive checks and cached regex for better performance.
     * @param {string} url
     * @return {boolean}
     */
    isFileUrl = (() => {
      const extensions = [
        "pdf",
        "doc",
        "docx",
        "rtf",
        "txt",
        "md",
        "json",
        "xls",
        "xlsx",
        "csv",
        "ppt",
        "pptx",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "svg",
        "avif",
        "webp",
        "mp3",
        "wav",
        "aac",
        "mid",
        "midi",
        "flac",
        "ogg",
        "mp4",
        "avi",
        "mov",
        "wmv",
        "mkv",
        "webm",
        "zip",
        "rar",
        "7z",
        "tar",
        "gz",
        "bz2",
        "tar.gz",
        "tar.bz2",
        "exe",
        "msi",
        "dll",
        "sys",
        "bat",
        "sh",
        "css",
        "js",
        "php",
        "xml",
        "ts",
        "jsx",
        "tsx",
        "vue",
        "ini",
        "conf",
        "cfg",
        "env",
        "yaml",
        "yml"
      ];
      const fileRegex = new RegExp(`\\.(${extensions.join("|")})$`, "i");
      return function(url) {
        if (typeof url !== "string" || url.trim() === "") return false;
        try {
          const normalizedUrl = url.startsWith("http") ? url : `https://${url.replace(/^\/+/, "")}`;
          const { pathname } = new URL(normalizedUrl);
          return fileRegex.test(pathname);
        } catch {
          return false;
        }
      };
    })();
    /**
     * Check whether the link should be manipulated
     * @param {HTMLElement} linkElement
     * @return {bool}
     */
    shouldHandleLink = (linkElement) => {
      const {
        ignoreClasses,
        ignoreProtocols,
        ignoreAttrValues,
        manageAttributes
      } = this.config.link;
      const linkHref = linkElement.getAttribute("href") || "";
      if (ignoreClasses.some((cls) => linkElement.classList.contains(cls)))
        return false;
      if (ignoreProtocols.some((p) => linkHref.startsWith(p))) return false;
      if (this.isFileUrl(linkHref)) return false;
      for (const attr of manageAttributes) {
        const val = linkElement.getAttribute(attr);
        if (val && ignoreAttrValues.includes(val)) return false;
      }
      return true;
    };
    /**
     * Verify that the origin is accepted
     * Accepts both the main domain and subdomains (*.domain.com)
     * @param {String} origin 
     * @returns {bool}
     */
    isAcceptedOrigin = /* @__PURE__ */ (() => {
      return function(origin) {
        if (this._originCache.has(origin)) return this._originCache.get(origin);
        try {
          const normalizedOrigin = origin.startsWith("http") ? origin : `https://${origin}`;
          const { hostname } = new URL(normalizedOrigin);
          const allowedDomains = this.config?.link?.acceptOrigins ?? [];
          const isAccepted = allowedDomains.some(
            (baseDomain) => hostname === baseDomain || hostname.endsWith(`.${baseDomain}`)
          );
          this._originCache.set(origin, isAccepted);
          return isAccepted;
        } catch {
          this._originCache.set(origin, false);
          return false;
        }
      };
    })();
    /**
     * Handle clicks on links.
     * Useful for checking whether the element's link is to the source website.
     * Call functions with specific responsibilities and redirect the link.
     * @param {Event} event 
     * @param {HTMLElement} linkElement 
     */
    handleLinkClick = (event, linkElement) => {
      const origin = linkElement.origin;
      const pathname = linkElement.pathname;
      const target = linkElement.getAttribute("target");
      const hash = linkElement.hash;
      const page = origin + pathname;
      if (this.isAcceptedOrigin(origin) && !this.config.link.ignorePathnames.some((p) => pathname.includes(p))) {
        const { href, isHashSymbolPresent } = this.generateHref(
          linkElement,
          origin,
          pathname,
          hash
        );
        this.handleLinkRedirect(event, isHashSymbolPresent, href, page, hash, target);
      }
    };
    /**
     * Performs a safe merge between the current page and link parameters,
     * preserving page UTMs when they exist and normalizing malformed queries.
     * @param {string} baseUrl - e.g., ‘https://domain.com/page’
     * @param {string} rawLinkQuery - e.g., linkUrl.search (may be malformed)
     * @param {string} rawCurrentQuery - e.g.: window.location.search
     * @param {Array<string>} excludeParams - list of parameters to remove
     * @returns {string} final URL (baseUrl + ‘?’ + mergedParams) or baseUrl if empty
     */
    sanitizeAndMergeParams = (baseUrl, rawLinkQuery = "", rawCurrentQuery = "", excludeParams = []) => {
      try {
        const linkSearch = this.normalizeQueryString(rawLinkQuery);
        const currentSearch = new URLSearchParams(
          (rawCurrentQuery || "").replace(/^[?&]+/, "")
        );
        for (const [key, value] of linkSearch.entries()) {
          const lowerKey = key.toLowerCase();
          const isUtm = this.config.link.includeParams.includes(lowerKey);
          if (isUtm && currentSearch.has(key)) continue;
          currentSearch.set(key, value);
        }
        excludeParams.forEach((p) => currentSearch.delete(p));
        const finalQuery = currentSearch.toString();
        return finalQuery ? `${baseUrl}?${finalQuery}` : baseUrl;
      } catch (err) {
        console.error("[sanitizeAndMergeParams] erro:", err);
        return baseUrl;
      }
    };
    /**
     * Normalizes a potentially malformed query string that may contain
     * “??” or “&&”, params embedded in values (e.g., custom=example?utm_source=example), or %3F.
     * Returns a URLSearchParams with all pairs correctly extracted.
     * @param {string} rawQuery - e.g., “?custom=example?utm_source=example&utm_medium=example”
     * @returns {URLSearchParams}
     */
    normalizeQueryString = (rawQuery) => {
      let remaining = (rawQuery || "").replace(/^[?&]+/, "");
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
        if (v.includes("%3F") || v.includes("%3f")) {
          const decoded = decodeURIComponent(v);
          if (decoded.includes("?")) {
            const [valBefore, valAfter] = decoded.split(/\?(.+)/s);
            result.set(k, valBefore);
            const tail = new URLSearchParams(valAfter);
            for (const [tk, tv] of tail) if (!result.has(tk)) result.append(tk, tv);
          }
        }
      }
      return result;
    };
    /**
     * Updates generateHref to use sanitizeAndMergeParams,
     * preserving the hash (#) correctly.
     * @param {HTMLElement} linkElement
     * @param {String} origin
     * @param {String} pathname
     * @param {String} hash
     * @return {Object} { href: String, isHashSymbolPresent: bool }
     */
    generateHref = (linkElement, origin, pathname, hash) => {
      const { excludeParams } = this.config.link;
      const baseUrl = origin + pathname;
      const linkUrl = new URL(linkElement.href);
      const merged = this.sanitizeAndMergeParams(
        baseUrl,
        linkUrl.search,
        window.location.search,
        excludeParams
      );
      const hasHash = !!hash;
      return { href: merged + (hasHash ? hash : ""), isHashSymbolPresent: hasHash };
    };
    /**
     * Redirects the link to different scenarios
     * @param {Event} event
     * @param {bool} isHashSymbolPresent
     * @param {String} href
     * @param {String} page
     * @param {String} hash
     * @param {String} target
     */
    handleLinkRedirect = (event, isHashSymbolPresent, href, page, hash, target) => {
      event.preventDefault();
      const current = window.location.origin + window.location.pathname;
      if (isHashSymbolPresent && page === current && hash) {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      target === "_blank" ? window.open(href, "_blank") : window.location.href = href;
    };
    /**
     * Removes search parameters from the URL.
     * Useful for post-search navigation on the site.
     * @param {String} search
     * @return {String}
     */
    removeURLParams = (search) => {
      const urlParams = new URLSearchParams(search);
      this.config.link.excludeParams.forEach((param) => urlParams.delete(param));
      return urlParams.toString() ? "?" + urlParams.toString() : "";
    };
    /**
     * Adds UTM parameters to the form before submission, avoiding duplicates.
     * @param {HTMLFormElement} formElement
     * @returns {void}
     */
    addParamsToForm = (formElement) => {
      if (!(formElement instanceof HTMLFormElement)) return;
      const locationHash = window.location.hash;
      const locationSearch = locationHash.includes("?") ? "?" + locationHash.split("?")[1] : window.location.search;
      if (!locationSearch) return;
      const urlParams = new URLSearchParams(this.removeURLParams(locationSearch));
      for (const [key, value] of urlParams) {
        const existingInput = formElement.querySelector(
          `input[name="${CSS.escape(key)}"][value="${CSS.escape(value)}"]`
        );
        if (!existingInput) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          formElement.appendChild(input);
        }
      }
    };
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
    bindEvents = () => {
      this.addListener(document, "click", this.handleDocumentClick);
      this.addListener(document, "contextmenu", this.handleContextMenu);
    };
    /**
     * Handle a click event dispatched on the document and delegate to link/form handlers.
     * Note: This method performs side effects via `this.handleLinkClick` and
     * `this.addParamsToForm`.
     *
     * @private
     * @param {Event} event - The click event. The handler expects `event.target` to be an Element
     *                        (i.e. to implement `closest`) so it can locate ancestor anchors/forms.
     * @returns {void}
     *
     * @fires Tracker#handleLinkClick
     * @fires Tracker#addParamsToForm
     */
    handleDocumentClick = (event) => {
      if (event.defaultPrevented || !event.target.closest) return;
      const target = event.target;
      const linkElement = target.closest("a");
      const buttonElement = target.closest("button, input[type='submit']");
      if (linkElement && this.shouldHandleLink(linkElement)) {
        this.handleLinkClick(event, linkElement);
        return;
      }
      if (buttonElement) {
        const form = buttonElement.closest("form");
        if (!form) return;
        const isAcceptedForm = this.config.form.acceptFormIds.some(
          (id) => form.id.includes(id)
        );
        if (isAcceptedForm) {
          this.addParamsToForm(form);
        }
      }
    };
    /**
     * Contextmenu event handler that ensures anchor elements have an up-to-date href
     * before the browser context menu is shown (so actions like "Open in new tab" or
     * "Copy link" use the corrected URL).
     *
     * @param {Event} event - The contextmenu event (usually a MouseEvent) triggered by the user.
     * @returns {void}
     */
    handleContextMenu = (event) => {
      if (!event.target.closest) return;
      const linkElement = event.target.closest("a");
      if (!linkElement || !this.shouldHandleLink(linkElement)) return;
      try {
        const origin = linkElement.origin;
        const pathname = linkElement.pathname;
        const hash = linkElement.hash;
        if (!this.isAcceptedOrigin(origin) || this.config.link.ignorePathnames.some((p) => pathname.includes(p))) {
          return;
        }
        const { href } = this.generateHref(linkElement, origin, pathname, hash);
        if (href && href !== linkElement.href) {
          linkElement.href = href;
        }
      } catch (err) {
        console.warn("[ParamTracker] contextmenu propagation error:", err);
      }
    };
    /**
     * Attempt to smoothly scroll the element referenced by the current URL hash into view.
     *
     * If window.location.hash is empty, the function returns immediately. Otherwise it
     * treats the hash as a selector (e.g. "#someId") and repeatedly queries the DOM
     * with document.querySelector for up to a maximum number of attempts (10 by default).
     * When the element is found it calls element.scrollIntoView({ behavior: "smooth" })
     * and stops. If the element is not present after the maximum retries, the function
     * stops attempting. Retries are scheduled using requestAnimationFrame.
     *
     * Side effects:
     * - Reads window.location.hash
     * - Calls document.querySelector
     * - Calls element.scrollIntoView with smooth behavior (if element is found)
     *
     * @function restoreScrollHash
     * @returns {void}
     */
    restoreScrollHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      let attempts = 0;
      const maxAttempts = 10;
      const tryScroll = () => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
        if (attempts++ < maxAttempts) {
          requestAnimationFrame(tryScroll);
        }
      };
      tryScroll();
    };
  };
  var tracker_default = ParamTracker;

  // src/tracker.browser.js
  window.ParamTracker = tracker_default;
})();
