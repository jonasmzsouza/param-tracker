---
title: Configuration
---

# ParamTracker Configuration

This document describes all configuration options available in **ParamTracker**, including their default values and behavior.

---

# Configuration Merge Behavior

ParamTracker performs a **deep merge** between the internal default configuration and the user-provided configuration.

This means:

• Default values are always preserved  
• Only the properties explicitly provided by the user are merged into the configuration  
• Any option not specified continues using the default value

Example:

```javascript
new ParamTracker({
  link: {
    excludeParams: ['s'],
  },
});
```

Resulting configuration:

```javascript
{
  link: {
    includeParams: [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_id",
      "utm_term",
      "utm_content"
    ],
    excludeParams: ["s"]
  }
}
```

The configuration merge is **deep**, meaning nested objects are merged rather than replaced.

---

# Default Configuration

ParamTracker uses the following defaults:

```javascript
{
  form: {
    acceptFormIds: []
  },

  link: {
    acceptOrigins: [window.location.hostname.toLowerCase()],

    ignorePathnames: [],

    ignoreClasses: [],

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

    ignoreAttrValues: [],

    manageAttributes: [],

    includeParams: [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_id",
      "utm_term",
      "utm_content"
    ],

    excludeParams: []
  }
}
```

---

# Configuration Options

## form.acceptFormIds

Defines which forms should automatically receive URL parameters as hidden inputs.

**Default**

```
[]
```

**Example**

```javascript
new ParamTracker({
  form: {
    acceptFormIds: ['contactForm', 'leadForm'],
  },
});
```

---

## link.acceptOrigins

Defines which domains are allowed to receive propagated parameters.
Useful for **cross-domain** functionality.

**Default**

```
[current hostname]
```

**Example**

```javascript
link: {
  acceptOrigins: ["example.com", "landing.another.com"],
}
```

Subdomains are accepted automatically, but **root domains** are resolved during domain merging and normalization

---

## link.ignorePathnames

Prevents tracking on specific paths.

**Default**

```
[]
```

**Example**

```javascript
link: {
  ignorePathnames: ["/admin", "/dashboard"],
}
```

---

## link.ignoreClasses

Links containing these classes will be ignored.

**Default**

```
[]
```

**Example**

```javascript
link: {
  ignoreClasses: ["no-track", "load-more", "page-numbers", "filter-button"],
}
```

---

## link.ignoreProtocols

Protocols that should never be modified.

**Default**

```
[
  "mailto:",
  "tel:",
  "sms:",
  "file:",
  "blob:",
  "data:",
  "ftp:",
  "ftps:",
  "javascript:"
]
```

These protocols are commonly associated with non‑HTTP navigation or browser‑specific actions.

---

## link.manageAttributes + link.ignoreAttrValues

These options work **together** to ignore links that contain certain attribute values.

**Default**

```
manageAttributes: []
ignoreAttrValues: []
```

**Example**

```javascript
link: {
  manageAttributes: ["role", "data-action"],
  ignoreAttrValues: ["button", "dropdown", "tab", "modal"]
}
```

In this example, any link whose `role` or `data-action` attribute contains one of the ignored values will not be processed by ParamTracker.

---

## link.includeParams

Parameters that should always be preserved and propagated across links and forms.

**Default**

```
[
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content"
]
```

**Example**

```javascript
link: {
  includeParams: ["promo", "ref"],
}
```

This option is typically used for **marketing attribution parameters**.

---

## link.excludeParams

Parameters that should be removed from URLs before propagation.

**Default**

```
[]
```

**Example**

```javascript
link: {
  excludeParams: ["s", "type", "category"],
}
```

This is useful for removing **search parameters, filters, or other non‑tracking query values**.

---

# Configuration Merge Behavior

ParamTracker merges your configuration with the internal defaults.

This means:

- You **only need to specify the options you want to change**
- Any option not provided will fall back to the **default configuration**

Example:

```javascript
new ParamTracker({
  link: {
    includeParams: ['promo', 'ref'],
  },
});
```

In this case, **all other configuration options remain unchanged** and continue using the default values.

---

# Best Practices

• Always define `acceptOrigins` when tracking across multiple domains.  
• Use `excludeParams` to clean unnecessary query parameters.  
• Combine `manageAttributes` with `ignoreAttrValues` to prevent tracking UI elements such as buttons, dropdown triggers, or modal links.

---

# Related Documentation

• Link filtering behavior is documented here:

👉 [`link-filtering.md`](link-filtering.md)

---

For a quick overview of the configuration options, see the
**Configuration section in the README.md**.
