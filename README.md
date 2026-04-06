# 🧭 ParamTracker

[![param-tracker (latest_)](https://img.shields.io/npm/v/param-tracker/latest.svg)](https://img.shields.io/npm/v/param-tracker)
[![param-tracker (donwloads)](https://img.shields.io/npm/dy/param-tracker.svg)](https://img.shields.io/npm/dm/param-tracker)
[![](https://data.jsdelivr.com/v1/package/npm/param-tracker/badge)](https://www.jsdelivr.com/package/npm/param-tracker)
![bundle size](https://img.shields.io/bundlejs/size/param-tracker)
![license](https://img.shields.io/npm/l/param-tracker)
![build](https://img.shields.io/github/actions/workflow/status/jonasmzsouza/param-tracker/create-and-publish.yml)

**ParamTracker** is a lightweight JavaScript library for intelligent manipulation of **links and forms**, preserving **UTM parameters** and removing irrelevant search parameters.  
It now supports **ES Modules**, **CommonJS**, and **browser global (UMD)** environments — perfect for WordPress, landing pages, or any website that relies on campaign tracking.

Now available for **ES Modules** _and_ **global browser usage (UMD/IIFE)** — no build tools required.

---

## 📚 Table of Contents

- [Why ParamTracker](#-why-paramtracker)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
- [Lifecycle](#-lifecycle-control)
- [Architecture](#-architecture)
- [Configuration](#-configuration)
- [Advanced Usage](#-advanced-usage)
- [Build Outputs](#️-build-outputs)
- [License](#-license)

---

## ❓ Why ParamTracker?

Modern websites often rely on marketing attribution parameters such as UTM tags.

However, these parameters are frequently lost when users navigate through internal links or submit forms.

ParamTracker solves this by automatically:

• preserving tracking parameters across links  
• injecting parameters into configured forms  
• removing irrelevant query parameters  
• working with dynamic DOM environments (SPA frameworks)

This ensures consistent campaign tracking without requiring manual URL management.

---

## 🚀 Features

✅ Maintains UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, etc.).  
✅ Keeps **custom parameters** defined in the configuration (`includeParams`)  
✅ Removes unnecessary or unwanted search parameters (`excludeParams` such as `s`, `type`, `category`, etc.)  
✅ Cleans malformed URLs (`??`, `%3F`, etc.)  
✅ Preserves` #hash` anchors for smooth navigation  
✅ Automatically injects UTM and **custom parameters** into configured forms (`acceptFormIds`)  
✅ Compatible with multiple domains and subdomains (`acceptOrigins`)  
✅ Ignores **file URLs** and links with specific **protocols** (`mailto:`, `tel:`, etc.)  
✅ Ignores links containing **specific CSS classes** (`ignoreClasses`)  
✅ Skips links located in **specific pathnames** (`ignorePathnames`)  
✅ Dynamically manages and validates custom link attributes (`manageAttributes`)  
✅ Skips links whose **attribute values** match ignored patterns (`ignoreAttrValues`) —  
&nbsp;&nbsp;&nbsp;🔹 Used together with `manageAttributes` to filter links by attribute content.  
✅ Fully supports ES Modules (`import`/`export`), CommonJS, AMD, and browser globals (UMD)  
✅ Full lifecycle control (`init`, `refresh`, `destroy`)  
✅ SPA-ready with DOM observation (MutationObserver)

---

## ⚙️ Installation

### via NPM

```bash
npm install param-tracker
```

### Or Via CDN (UMD ready):

```html
<script src="https://cdn.jsdelivr.net/npm/param-tracker@latest/dist/tracker.min.js"></script>
```

### Or manual download

Download one the latest [releases](https://github.com/jonasmzsouza/param-tracker/releases). The files you need are inside the dist.

---

## ⚡ Quick Start

A simple example of how to use **ParamTracker** on a website with links and forms.

For more practical examples, including advanced use cases with all configuration options, check out the [`/demos`](./demos) folder — it contains multiple `.html` files demonstrating different tracking scenarios.

### Basic Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>ParamTracker Quick Start</title>
  </head>
  <body>
    <!-- Example Links -->
    <a href="https://example.com/page1?custom=example">Page 1</a>
    <a href="https://example.com/page2">Page 2</a>

    <!-- Example Form -->
    <form id="registrationForm">
      <input type="text" name="name" placeholder="Name" />
      <input type="email" name="email" placeholder="Email" />
      <button type="submit">Submit</button>
    </form>

    <script src="https://cdn.jsdelivr.net/npm/param-tracker@latest/dist/tracker.min.js"></script>
    <script>
      // Initialize ParamTracker with configuration
      const tracker = new ParamTracker({
        form: {
          acceptFormIds: ['registrationForm'],
        },
        link: {
          acceptOrigins: ['example.com'], //cross-domain
        },
      }).init();
    </script>
  </body>
</html>
```

When your page is visited with UTM parameters such as `?utm_source=tracker&utm_medium=demo`
and you click a link like `Page 1` or `Page 2`. While the current page contains UTM parameters,
ParamTracker will automatically append them to the target URL:

```bash
# Page 1
https://example.com/page1?utm_source=tracker&utm_medium=demo&custom=example

# Page 2
https://example.com/page2?utm_source=tracker&utm_medium=demo
```

And when you submit a form with an accepted ID, the library automatically injects hidden inputs containing the same UTM parameters (and any additional parameters defined in the configuration).

### 🔍 Learn More with Demos

The [`/demos`](./demos) directory includes multiple examples to help you understand how each configuration option behaves, such as:

- Ignoring specific pathnames (ignorePathnames)
- Ignoring links by class (ignoreClasses)
- Ignoring attributes by value (ignoreAttrValues)
- Managing extra attributes (manageAttributes)
- Handling includeParams and excludeParams in links and forms
- Demonstrating form behavior using event.preventDefault() to show how UTMs and custom parameters are injected before submission.

These demos illustrate how ParamTracker keeps, merges, or ignores parameters based on your configuration — ensuring consistent tracking even when users navigate across different domains or pages.

---

## 🧠 Usage

#### 🧩 Option 1 — Browser (Global Usage)

```html
<script src="https://cdn.jsdelivr.net/npm/param-tracker@latest/dist/tracker.min.js"></script>
<script>
  const tracker = new ParamTracker({
    // Your custom settings go here
  }).init();
</script>
```

#### 📦 Option 2 — ES Module (Modern Apps)

```js
import { ParamTracker } from 'param-tracker';

const tracker = new ParamTracker({
  // Your custom settings go here
}).init();
```

#### 💻 Option 3 — Node.js / CommonJS

```js
const { ParamTracker } = require('param-tracker');

const tracker = new ParamTracker({
  // Your custom settings go here
}).init();
```

---

## 🔄 Lifecycle Control

ParamTracker now provides full lifecycle control, allowing you to initialize, refresh, and destroy the instance when needed — especially useful for SPA (React, Vue, Angular) or dynamic environments.

### Methods

```js
// Config (Optional)
const config = {};

// Instance
const tracker = new ParamTracker(config);

// Initialize
tracker.init();

// Re-run link sanitization and clear internal cache
tracker.refresh();

// Remove all listeners and observers (cleanup)
tracker.destroy();
```

**Notes**

- `init()` is idempotent (safe to call multiple times)
- `destroy()` removes all event listeners and stops DOM observation
- `refresh()` is useful when URL parameters or DOM state changes dynamically

---

## 🏗 Architecture

ParamTracker uses a **micro-kernel architecture with specialized handlers** to keep the core lightweight and extensible.

The core orchestrates lifecycle and configuration while dedicated handlers manage:

• event delegation  
• DOM observation  
• link processing  
• form parameter propagation

This modular design improves maintainability, testability, and extensibility.

Learn more:

👉 [./docs/architecture/](./docs/architecture/)

---

## 🧩 Configuration

ParamTracker provides a flexible configuration system for controlling how parameters propagate across links and forms.

Below is a **quick overview of the available options**.

| Nest | Option           | Type     | Description                                        |
| ---- | ---------------- | -------- | -------------------------------------------------- |
| form | acceptFormIds    | string[] | Forms that should receive parameters automatically |
| link | acceptOrigins    | string[] | Allowed domains for propagation                    |
| link | ignorePathnames  | string[] | Pathnames excluded from tracking                   |
| link | ignoreClasses    | string[] | CSS classes that disable tracking                  |
| link | ignoreProtocols  | string[] | Protocols that should not be modified              |
| link | manageAttributes | string[] | Attributes inspected for filtering                 |
| link | ignoreAttrValues | string[] | Attribute values that trigger ignore               |
| link | includeParams    | string[] | Parameters to preserve and propagate               |
| link | excludeParams    | string[] | Parameters removed from URLs                       |

ParamTracker performs a deep merge between the internal default configuration and the user-provided configuration.

This means:

• Default values are always preserved  
• Only the properties you specify are merged into the configuration  
• Unspecified options continue using the default values

👉 Full configuration documentation including default values:
See [./docs/configuration/](./docs/configuration/)

---

### Link Filtering Rules

Before modifying links, ParamTracker applies several filtering rules to ensure safe behavior.

These rules include:

- File URL detection (downloads and media files)
- Protocol filtering (`ignoreProtocols`)
- CSS class filtering (`ignoreClasses`)
- Attribute filtering (`manageAttributes` + `ignoreAttrValues`)
- Origin validation (`acceptOrigins`)
- Pathname filtering (`ignorePathnames`)

For a complete explanation of how links are evaluated, see:

👉 [`./docs/link-filtering/`](./docs/link-filtering/)

---

## 🧩 Advanced Usage

ParamTracker is designed to be extensible and will support advanced configuration patterns such as presets and plugins for framework-specific behavior.

Stay tuned for upcoming releases.

---

## 🏗️ Build Outputs

| Format       | File                      | Description                              |
| ------------ | ------------------------- | ---------------------------------------- |
| UMD          | `dist/tracker.js`         | Universal build for browsers and Node.js |
| UMD Minified | `dist/tracker.min.js`     | Minified version for production use      |
| ESM          | `dist/tracker.esm.js`     | ES Module format (`import`)              |
| ESM Minified | `dist/tracker.esm.min.js` | Minified version for production use      |
| CJS          | `dist/tracker.cjs.js`     | CommonJS format (`require`)              |
| CJS Minified | `dist/tracker.cjs.min.js` | Minified version for production use      |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## ✨ Author

<table>
  <tr>
    <td align="center">
      <a href="https://jonasmzsouza.github.io/">
         <img style="border-radius: 50%;" src="https://avatars.githubusercontent.com/u/61324433?v=4" width="100px;" alt=""/>
         <br />
         <sub><b>Jonas Souza</b></sub>
      </a>
    </td>
  </tr>
</table>
 
💼 [LinkedIn](https://linkedin.com/in/jonasmzsouza)
💻 [GitHub](https://github.com/jonasmzsouza)
