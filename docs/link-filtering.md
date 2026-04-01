---
title: Link Filtering
---

# Link Filtering Rules

This document explains how **ParamTracker** decides whether a link should be processed or ignored.

Before propagating parameters, ParamTracker evaluates a set of filtering rules to ensure that only valid and safe links are modified.

These rules prevent unwanted behavior such as modifying download links, executable resources, or UI-trigger elements.

---

# Filtering Pipeline

When a link is detected, ParamTracker evaluates the following conditions in order:

1.  **File URL detection**
2.  **Protocol filtering** (`ignoreProtocols`)
3.  **Ignored CSS classes** (`ignoreClasses`)
4.  **Attribute filtering** (`manageAttributes` + `ignoreAttrValues`)
5.  **Origin validation** (`acceptOrigins`)
6.  **Ignored pathnames** (`ignorePathnames`)

Only links that pass all filters will receive propagated parameters.

---

# File URL Detection

ParamTracker automatically ignores links that point to **file resources**.

This prevents parameters from being appended to downloads, media files, or executable resources where query parameters could break the link or produce unexpected behavior.

The library detects file URLs based on their **file extension**.

Example:

```html
<a href="/downloads/guide.pdf">Download Guide</a>
```

The link above will **not be modified** by ParamTracker.

---

# Supported File Categories

ParamTracker ignores common file extensions across several categories.

| Category      | Examples                                                            |
| ------------- | ------------------------------------------------------------------- |
| Documents     | `.pdf`, `.doc`, `.docx`, `.rtf`, `.txt`, `.md`, `.json`             |
| Spreadsheets  | `.xls`, `.xlsx`, `.csv`                                             |
| Presentations | `.ppt`, `.pptx`                                                     |
| Images        | `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`, `.avif`, `.webp`   |
| Audio         | `.mp3`, `.wav`, `.aac`, `.mid`, `.midi`, `.flac`, `.ogg`            |
| Video         | `.mp4`, `.avi`, `.mov`, `.wmv`, `.mkv`, `.webm`                     |
| Archives      | `.zip`, `.rar`, `.7z`, `.tar`, `.gz`, `.bz2`, `.tar.gz`, `.tar.bz2` |
| Executables   | `.exe`, `.msi`, `.dll`, `.sys`, `.bat`, `.sh`                       |
| Source files  | `.css`, `.js`, `.php`, `.xml`, `.ts`, `.jsx`, `.tsx`, `.vue`        |
| Config files  | `.ini`, `.conf`, `.cfg`, `.env`, `.yaml`, `.yml`                    |

---

# Protocol Filtering

Links that use specific protocols are automatically ignored.

Examples include:

```
mailto:
tel:
sms:
file:
blob:
data:
ftp:
ftps:
javascript:
```

These protocols usually represent browser actions, downloads, or non‑HTTP navigation.

This behavior is configurable via:

```
link.ignoreProtocols
```

---

# CSS Class Filtering

Links containing specific CSS classes can be ignored.

Example:

```javascript
link: {
  ignoreClasses: ["no-track", "external-link"],
}
```

Any link containing one of these classes will be skipped.

---

# Attribute Filtering

ParamTracker can inspect link attributes and ignore links containing certain values.

These two configuration options work together:

- `manageAttributes`
- `ignoreAttrValues`

Example:

```javascript
link: {
  manageAttributes: ["role", "data-action"],
  ignoreAttrValues: ["button", "dropdown", "modal"]
}
```

In this case, links whose attributes contain one of the ignored values will be skipped.

---

# Origin Validation

To prevent parameter propagation to unrelated domains, ParamTracker validates the link origin.

Example:

```javascript
link: {
  acceptOrigins: ["example.com"],
}
```

Subdomains are automatically accepted.

---

# Pathname Filtering

Specific pathnames can be excluded from tracking.

Example:

```javascript
link: {
  ignorePathnames: ["/admin", "/dashboard"],
}
```

Links pointing to these paths will not receive propagated parameters.

---

# Summary

ParamTracker applies multiple layers of filtering to ensure safe and predictable behavior when propagating parameters across links.

This includes:

• Protocol validation  
• File URL detection  
• CSS class filtering  
• Pathname filtering  
• Attribute inspection  
• Domain validation

Only links that pass all filters will be modified.

---

For configuration details, see:

- 👉 [`configuration.md`](`configuration.md`)
- The **Configuration** section in the README.
