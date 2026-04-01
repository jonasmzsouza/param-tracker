# Changelog

All notable changes to this project will be documented in this file.  
The format follows the conventions of Conventional Commits(https://www.conventionalcommits.org) and semantic versioning (SemVer).

---

## 5.0.0

### 💥 Breaking Changes

- Architecture to micro-kernel with modular handlers (#29)

## 4.0.1

### 📚 Documentation

- Update README.md with lifecycle control section (#27)

## 4.0.0

### 💥 Breaking Changes

- Add full lifecycle, event manager, and SPA support (#25)

## 3.1.1

### 🐛 Fixes

- Add conditional in the tag create step in the workflow (#23)

### 📚 Documentation

- Update the README.md file in the demos folder (#22)

## 3.1.0

### ✨ Features

- Enhance origin validation, add context menu propagation, caching and advanced demos (#20)

### 🤖 CI

- Migrate to PR-based release workflow using create-pull-request (#19)

## ⏪ 3.0.2

### ⏪ Reverts

- Revert ":robot: ci: add automated release and npm token rotation workflows ([#14](https://github.com/jonasmzsouza/param-tracker/issues/14))" ([#15](https://github.com/jonasmzsouza/param-tracker/issues/15)) ([ba3acb3](https://github.com/jonasmzsouza/param-tracker/commit/ba3acb321faa647384aec65710ce8c85b87a9901))

---

## 🐞 3.0.1

### 🐛 Fixes

- Fixed `Uncaught ReferenceError: isFileUrl is not defined` by prefixing with `this.` inside the class scope.

---

## 💥 3.0.0

### ⚙️ Refactor

- Restructured the configuration system into **nested `link` and `form` objects** for improved clarity and extensibility.
- Introduced default settings for `link` and `form` nests to simplify instantiation.
- Improved sanitization methods for string arrays and merging configurations.
- Enhanced file URL detection with a comprehensive list of extensions.
- Updated event handling for links and forms to accommodate new configuration structure.
- Added detailed documentation comments for better understanding of configuration options.

### 💥 Breaking Changes

- Configuration structure has changed:
  - `acceptFormIds` → `form.acceptFormIds`
  - `acceptOrigins`, `ignoreClasses`, `ignorePathnames`, `ignoreProtocols`, `ignoreAttrValues`, `manageAttributes`, `includeParams`, `excludeParams` → now under `link` object
- Scripts using the old configuration format will need to update to the new nested structure.

### 📄 Documentation

- Updated README with new configuration table and usage examples.

---

## ✨ 2.1.0

### ✨ Features

#### Added

- Full **UMD + ESM compatibility**:
  - Works in browsers via `<script>`
  - Works in Node.js via `require()`
  - Works in modern bundlers via `import`
  - Supports AMD loaders (RequireJS)
- Adds global fallback to `window.ParamTracker`

### 🧠 Improvements

- Simplified the factory pattern for better maintainability
- Unified exports for consistent behavior across environments

### 🛠️ Build

- Added build.mjs script to automate the build process
- Configured builds for UMD, ESM, and CommonJS formats
- Generated both minified and unminified versions
- Cleaned up the dist/ folder before each build
- Included automatic banner with version and license information
- Updated tracker.js, tracker.cjs.js, and tracker.esm.js with new build outputs

---

## 🐞 2.0.1

### 🐛 Fixes

- Avoids duplication of parameters by the addParamsToForm function if a field with the same name and value already exists in the form.

---

## 🚀 2.0.0

### 💥 Breaking Changes

- Migrated from procedural script to **modular `ParamTracker` class**
- Now requires **constructor-based configuration** (custom + default settings)
- Added **validation for required parameters** — throws exception if missing

### ♻️ Refactor

- Rewritten architecture to improve maintainability and scalability
- Enhanced parameter sanitization and event binding
- Removed global functions in favor of instance methods

---

## 🔁 1.4.1

### ♻️ Refactor

- Removed handleFormSubmit function and update form submission handling to use manual click events.

---

## 🧩 1.4.0

### 🔧 Chore

- Addition of essential configuration files (`package.json`, `.eslintrc.json`, `.prettierrc`, etc.) to standardize code style and quality.

---

## 🔁 1.3.0

### ♻️ Refactor

- Update to URL parameter handling to normalize malformed queries and preserve UTM parameters

---

## 🐞 1.2.3

### 🐛 Fixes

- Fixed the use of link element parameters when they do not exist, improving script stability.

---

## ✨ 1.2.0

### ✨ Features

- Handling specific forms and improving job descriptions

### ♻️ Refactor

- Several internal improvements to the code, including adjustments to accepted sources, class ignorance, and optimizations.

---

## 🚀 1.0.0

### ✨ Features

- Implementation of function that removes specific search parameters

### 🐛 Fixes

- Several corrections to the scope, variables, and logic of `href` construction

### ♻️ Refactor

- Separation of validations and handlers into dedicated functions
- Inclusion of code block to ensure execution after DOMContentLoaded

---

## ✨ 0.2.0

### ✨ Features

- Propagated URL parameters and handle anchors/hash in all links

---

## 🎉 0.1.0

### 🎯 Initial Commit

- First commit

---

## 📘 Notas

- **Commit pattern:** Conventional Commits (https://www.conventionalcommits.org)
- **Versioning:** SemVer (`MAJOR.MINOR.PATCH`)
- **Author:** Jonas Souza (https://github.com/jonasmzsouza)
- **Repository:** Link Tracking (https://github.com/jonasmzsouza/param-tracker)

---
