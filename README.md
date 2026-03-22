# 🧭 ParamTracker

**ParamTracker** is a lightweight JavaScript library for intelligent manipulation of **links and forms**, preserving **UTM parameters** and removing irrelevant search parameters.  
It now supports **ES Modules**, **CommonJS**, and **browser global (UMD)** environments — perfect for WordPress, landing pages, or any website that relies on campaign tracking.

Now available for **ES Modules** _and_ **global browser usage (UMD/IIFE)** — no build tools required.

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

---

## ⚙️ Installation

### Clone and install:

```bash
git clone https://github.com/jonasmzsouza/param-tracker.git
cd param-tracker
npm install
```

### Or via NPM

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

## 🧠 Usage

#### 🧩 Option 1 — Browser (Global Usage)

```html
<script src="https://cdn.jsdelivr.net/npm/param-tracker@latest/dist/tracker.min.js"></script>
<script>
  const tracker = new ParamTracker({
    form: {
      acceptFormIds: ["registrationForm"]
    },
    link: {
      acceptOrigins: ["example.com"],
      ignoreClasses: ["no-track"],
      includeParams: ["custom_param"],
      excludeParams: ["any_filter", "any_search"]
      // another configuration option
    }
  }).init();
</script>
```

#### 📦 Option 2 — ES Module (Modern Apps)

```js
import { ParamTracker } from "param-tracker";

const tracker = new ParamTracker({
  form: {
    acceptFormIds: ["registrationForm"]
  },
  link: {
    acceptOrigins: ["example.com"],
    ignoreClasses: ["no-track"],
    includeParams: ["custom_param"],
    excludeParams: ["any_filter", "any_search"]
    // another configuration option
  }
}).init();
```

#### 💻 Option 3 — Node.js / CommonJS

```js
const { ParamTracker } = require("param-tracker");

const tracker = new ParamTracker({
  form: {
    acceptFormIds: ["registrationForm"]
  },
  link: {
    acceptOrigins: ["example.com"],
    ignoreClasses: ["no-track"],
    includeParams: ["custom_param"],
    excludeParams: ["any_filter", "any_search"]
    // another configuration option
  }
}).init();
```

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
    <a href="https://example.com/page1?utm_source=google&utm_medium=cpc">Page 1</a>
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
          acceptFormIds: ["registrationForm"]
        },
        link: {
          acceptOrigins: ["example.com"]
        }
      }).init();
    </script>
  </body>
</html>
```

When you click a link like:

```bash
https://example.com/page2
```

while the current page contains UTM parameters such as ?utm_source=tracker,
ParamTracker will automatically append them to the target URL:

```bash
https://example.com/page2?utm_source=tracker
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

## 🧩 Configuration Options

| Nest     | Option             | Type       | Description                                                                                                                                                               |
| -------- | ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **form** | `acceptFormIds`    | `string[]` | IDs of forms that should automatically receive UTM and custom parameters.                                                                                                 |
| **link** | `acceptOrigins`    | `string[]` | Defines which domains or subdomains are allowed for parameter propagation.                                                                                                |
| **link** | `ignorePathnames`  | `string[]` | Excludes specific URL pathnames from tracking.                                                                                                                            |
| **link** | `ignoreClasses`    | `string[]` | Ignores links that contain any of these CSS classes.                                                                                                                      |
| **link** | `ignoreProtocols`  | `string[]` | Skips links whose URL starts with certain protocols. Some protocols already handled: `mailto:`, `tel:`, `sms:`, `file:`, `blob:`, `data:`, `ftp:`, `ftps:`, `javascript:` |
| **link** | `ignoreAttrValues` | `string[]` | Values that, when matched, will cause the link to be ignored. Used together with `manageAttributes`.                                                                      |
| **link** | `manageAttributes` | `string[]` | Attributes to inspect (e.g. `href`, `data-action`, `download`). If any of these attributes contain a value present in `ignoreAttrValues`, the link will be ignored.       |
| **link** | `includeParams`    | `string[]` | Parameters to preserve or propagate (e.g. UTM parameters).                                                                                                                |
| **link** | `excludeParams`    | `string[]` | Parameters to remove from the URL before propagation.                                                                                                                     |

---

## 📘 Configuration Reference

Each configuration key allows fine-grained control over how parameters are managed and propagated.

### 🧩 `form.acceptFormIds`

Defines which forms should automatically receive UTM and custom parameters.

```js
new ParamTracker({
  form: {
    acceptFormIds: ["registrationForm", "leadForm"]
  }
});
```

---

### 🌍 `link.acceptOrigins`

Specifies the list of domains and subdomains where tracking should be active.

```js
link: {
  acceptOrigins: ["example.com", "another.com"],
}
```

- Note: subdomains are accepted automatically (e.g., \*.example.com).

---

### 🚫 `link.ignorePathnames`

Excludes certain URL pathnames from parameter propagation.

```js
link: {
  ignorePathnames: ["/admin", "/private"],
}
```

---

### 🏷️ `link.ignoreClasses`

Prevents links with certain CSS classes from being tracked.

```js
link: {
  ignoreClasses: ["no-track", "load-more", "page-numbers", "filter-button"],
}
```

---

### 🔗 `link.ignoreProtocols`

Skips links that use specific protocols (useful to avoid tracking file, email, or JS links).

```js
link: {
  ignoreProtocols: ["mailto:", "tel:", "file:", "javascript:"],
}
```

---

### ⚙️ `link.manageAttributes` + `link.ignoreAttrValues`

These options work **together** to ignore links containing specific values in certain attributes.

```js
link: {
  manageAttributes: ["role", "data-custom"];
  ignoreAttrValues: ["button", "dropdown", "tab", "modal"];
}
```

➡️ In this example, any link whose `role` or `data-custom` contains `button`, `dropdownp`, `tab`, or `modal` will be ignored.

---

### 🎯 `link.includeParams`

Defines which URL parameters should always be propagated or preserved.

```js
link: {
  includeParams: ["custom_param"],
}
```

- Note: UTMS parameters are already included by default.

---

### 🧹 `link.excludeParams`

Removes unwanted parameters from URLs before propagation.

```js
link: {
  excludeParams: ["s", "type", "category"],
}
```

---

## 🧪 Scripts úteis

- Lint:

```bash
npm run lint
```

- Lint with automatic correction:

```bash
npm run lint:fix
```

- Build library:

```bash
npm run build
```

---

## 🏗️ Build Outputs

| Format   | File                  | Description                              |
| -------- | --------------------- | ---------------------------------------- |
| UMD      | `dist/tracker.js`     | Universal build for browsers and Node.js |
| Minified | `dist/tracker.min.js` | Minified version for production use      |
| ESM      | `dist/tracker.esm.js` | ES Module format (`import`)              |
| CJS      | `dist/tracker.cjs.js` | CommonJS format (`require`)              |

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
