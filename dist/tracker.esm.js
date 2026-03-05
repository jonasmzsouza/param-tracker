/*! ParamTracker 3.1.1 | MIT License | (c) Jonas Souza 2025 | https://github.com/jonasmzsouza/param-tracker */

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
    document.addEventListener("DOMContentLoaded", () => this.init());
  }
  /**
   * Initializes the tracker module
   * @returns {void}
   */
  init = () => {
    this.sanitizeLinks();
    this.bindLinkEvents();
    this.bindButtonEvents();
    this.bindContextMenuEvents();
    this.restoreScrollHash();
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
    const cache = /* @__PURE__ */ new Map();
    return function(origin) {
      if (cache.has(origin)) return cache.get(origin);
      try {
        const normalizedOrigin = origin.startsWith("http") ? origin : `https://${origin}`;
        const { hostname } = new URL(normalizedOrigin);
        const allowedDomains = this.config?.link?.acceptOrigins ?? [];
        const isAccepted = allowedDomains.some(
          (baseDomain) => hostname === baseDomain || hostname.endsWith(`.${baseDomain}`)
        );
        cache.set(origin, isAccepted);
        return isAccepted;
      } catch {
        cache.set(origin, false);
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
   * Binds click events to links for tracking and manipulation
   * @returns {void}
   */
  bindLinkEvents = () => {
    document.addEventListener("click", (event) => {
      const linkElement = event.target.closest("a");
      if (!linkElement || !this.shouldHandleLink(linkElement)) return;
      this.handleLinkClick(event, linkElement);
    });
  };
  /**
   * Binds click events to buttons for form submission handling
   * @returns {void}
   */
  bindButtonEvents = () => {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("button, input[type='submit']");
      if (!button) return;
      const form = button.closest("form");
      if (!form) return;
      const isAcceptedForm = this.config.form.acceptFormIds.some(
        (id) => form.id.includes(id)
      );
      if (isAcceptedForm) {
        this.addParamsToForm(form);
      }
    });
  };
  /**
   * Binds contextmenu (right-click) events to links.
   * This ensures that when the user right-clicks a link and chooses
   * “Open link in new tab/window” or “Copy link address”,
   * the link has already been sanitized and has the propagated parameters.
   */
  bindContextMenuEvents = () => {
    document.addEventListener("contextmenu", (event) => {
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
    });
  };
  /**
   * Restores scroll position for hash links on page load.
   * @returns {void}
   */
  restoreScrollHash = () => {
    if (window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };
};
(function(global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    global.ParamTracker = factory().ParamTracker;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : void 0,
  function() {
    return { ParamTracker };
  }
);
export {
  ParamTracker
};
