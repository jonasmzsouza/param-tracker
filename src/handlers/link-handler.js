import { sanitizeAndMergeParams } from "../utils/params.js";
import { isFileUrl } from "../utils/url.js";

export function createLinkHandler(instance) {
  return {

    /**
     * Sanitizes existing links in the HTML
     * @returns {void}
     */
    sanitizeLinks() {
      document.querySelectorAll("a[href]").forEach((link) => {
        if (!this.shouldHandleLink(link)) return;

        const url = new URL(link.href);
        const hash = url.hash || "";

        const sanitized = sanitizeAndMergeParams(
          instance.config,
          url.origin + url.pathname,
          url.search,
          ""
        );

        const finalHref = sanitized + hash;

        if (finalHref !== link.href) link.href = finalHref;
      });
    },

    /**
     * Check whether the link should be manipulated
     * @param {HTMLElement} linkElement
     * @return {bool}
     */
    shouldHandleLink(linkElement) {
      const {
        ignoreClasses,
        ignoreProtocols,
        ignoreAttrValues,
        manageAttributes,
      } = instance.config.link;

      const linkHref = linkElement.getAttribute("href") || "";

      // Ignore file links
      if (isFileUrl(linkHref)) return false;

      // Ignore links with specific protocols (mailto:, tel:, etc.)
      if (ignoreProtocols.some((p) => linkHref.startsWith(p))) return false;

      // Ignore links with specified classes
      if (ignoreClasses.some((cls) => linkElement.classList.contains(cls)))
        return false;      

      // Ignore links that have specific manageAttributes with values in ignoreAttrValues
      for (const attr of manageAttributes) {
        const val = linkElement.getAttribute(attr);
        if (val && ignoreAttrValues.includes(val)) return false;
      }

      return true;
    },


    /**
     * Verify that the origin is accepted
     * Accepts both the main domain and subdomains (*.domain.com)
     * @param {String} origin 
     * @returns {bool}
     */
    isAcceptedOrigin(origin) {
      if (instance._originCache.has(origin)) {
        return instance._originCache.get(origin);
      }

      try {
        const normalizedOrigin = origin.startsWith("http")
          ? origin
          : `https://${origin}`;

        const { hostname } = new URL(normalizedOrigin);
        const allowedDomains = instance.config.link.acceptOrigins ?? [];

        const isAccepted = allowedDomains.some(
          (baseDomain) =>
            hostname === baseDomain ||
            hostname.endsWith(`.${baseDomain}`)
        );

        instance._originCache.set(origin, isAccepted);
        return isAccepted;
      } catch {
        instance._originCache.set(origin, false);
        return false;
      }
    },

    /**
     * Handle clicks on links.
     * Useful for checking whether the element's link is to the source website.
     * Call functions with specific responsibilities and redirect the link.
     * @param {Event} event 
     * @param {HTMLElement} linkElement 
     */
    handleLinkClick(event, linkElement) {
      const origin = linkElement.origin;
      const pathname = linkElement.pathname;
      const target = linkElement.getAttribute("target");
      const hash = linkElement.hash;
      const page = origin + pathname;

      if (
        this.isAcceptedOrigin(origin) &&
        !this.config.link.ignorePathnames.some((p) =>
          pathname.includes(p)
        )
      ) {
        const { href, isHashSymbolPresent } = this.generateHref(
          linkElement,
          origin,
          pathname,
          hash
        );

        this.handleLinkRedirect(
          event,
          isHashSymbolPresent,
          href,
          page,
          hash,
          target
        );
      }
    },

    /**
     * Updates generateHref to use sanitizeAndMergeParams,
     * preserving the hash (#) correctly.
     * @param {HTMLElement} linkElement
     * @param {String} origin
     * @param {String} pathname
     * @param {String} hash
     * @return {Object} { href: String, isHashSymbolPresent: bool }
     */
    generateHref(linkElement, origin, pathname, hash) {
      const baseUrl = origin + pathname;
      const linkUrl = new URL(linkElement.href);

      const merged = sanitizeAndMergeParams(
        instance.config,
        baseUrl,
        linkUrl.search,
        window.location.search,
      );

      // Ensures that the hash is maintained (if it exists)
      const hasHash = !!hash;

      return {
        href: merged + (hasHash ? hash : ""),
        isHashSymbolPresent: hasHash,
      };
    },

    /**
     * Redirects the link to different scenarios
     * @param {Event} event
     * @param {bool} isHashSymbolPresent
     * @param {String} href
     * @param {String} page
     * @param {String} hash
     * @param {String} target
     */
    handleLinkRedirect(event, isHashSymbolPresent, href, page, hash, target) {
      event.preventDefault();

      const current =
        window.location.origin + window.location.pathname;

      if (isHashSymbolPresent && page === current && hash) {
        document.querySelector(hash)?.scrollIntoView({
          behavior: "smooth",
        });
        return;
      }

      target === "_blank"
        ? window.open(href, "_blank")
        : (window.location.href = href);
    },
  };
}