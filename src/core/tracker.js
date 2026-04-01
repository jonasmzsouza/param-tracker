import { createDOMObserverHandler } from '../handlers/dom-observer-handler.js';
import { createEventHandler } from '../handlers/event-handler.js';
import { createFormHandler } from '../handlers/form-handler.js';
import { createLinkHandler } from '../handlers/link-handler.js';
import { buildConfig } from './config.js';
import { createLifecycle } from './lifecycle.js';

class ParamTracker {
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
        acceptFormIds: [],
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
        acceptOrigins: [window?.location?.hostname?.toLowerCase() || ''],

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
          'mailto:',
          'tel:',
          'sms:',
          'file:',
          'blob:',
          'data:',
          'ftp:',
          'ftps:',
          'javascript:',
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
          'utm_source',
          'utm_medium',
          'utm_campaign',
          'utm_id',
          'utm_term',
          'utm_content',
        ],

        /**
         * Parameters to remove from the URL before propagation.
         * Useful for cleaning up unnecessary or sensitive query parameters.
         * Example: ["s", "type", "category"]
         */
        excludeParams: [],
      },
    };

    // Merges default and custom configurations
    this.config = buildConfig(defaults, customConfig);

    // Lifecycle state
    this._initialized = false;

    // Event manager
    this._listeners = [];

    // Cache per instance
    this._originCache = new Map();

    // Observer
    this._observer = null;

    Object.assign(this, createLifecycle(this));
    Object.assign(this, createLinkHandler(this));
    Object.assign(this, createFormHandler(this));
    Object.assign(this, createEventHandler(this));
    Object.assign(this, createDOMObserverHandler(this));
  }
}

export { ParamTracker };
export default ParamTracker;
