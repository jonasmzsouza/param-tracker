---
title: Architecture
---

# ParamTracker Architecture

This document explains the internal architecture of **ParamTracker 5.x**.

ParamTracker is designed using a **micro-kernel architecture with specialized handlers**.  
This structure keeps the core lightweight while delegating responsibilities to focused modules.

The design goals are:

- lightweight core
- modular architecture
- easier testing
- long-term extensibility

---

# Architectural Overview

ParamTracker is composed of two main layers:

1. **Core (Micro-Kernel)**
2. **Handlers and Utilities**

The core manages lifecycle and orchestration, while handlers implement the actual logic for manipulating links and forms.

Conceptually:

```
ParamTracker (Core)
│
├── EventHandler
├── DOMObserverHandler
│
├── LinkHandler
├── FormHandler
│
└── Utilities
```

The core coordinates execution but intentionally avoids implementing the business logic directly.

---

# Runtime Flow

At runtime, ParamTracker follows a simple execution pipeline:

```
Page load / user interaction
↓
EventHandler or DOMObserverHandler
↓
Core orchestration
↓
Processing Handlers (LinkHandler / FormHandler)
↓
DOM manipulation
```

This flow ensures that tracking parameters are propagated only when relevant interactions occur.

---

# Micro-Kernel Core

The **ParamTracker core** acts as a micro-kernel responsible for:

- configuration management
- lifecycle control
- DOM observation
- delegating work to handlers

The core is intentionally minimal to keep the system predictable and easy to maintain.

Core responsibilities include:

- initializing the tracker
- merging configuration with defaults
- observing DOM mutations
- invoking handlers when needed

---

# Lifecycle

ParamTracker now provides full lifecycle control, allowing you to initialize, refresh, and destroy the instance when needed — especially useful for SPA (React, Vue, Angular) or dynamic environments.

## init()

```javascript
tracker.init();
```

Initializes the tracker.

Initialization performs:

- deep merge between default configuration and user configuration
- initial DOM scan
- event listener attachment
- MutationObserver initialization

`init()` is **idempotent**, meaning calling it multiple times is safe.

---

## refresh()

```javascript
tracker.refresh();
```

Triggers a new processing cycle.

Useful when:

- URL parameters change
- dynamic DOM content is inserted
- SPA navigation occurs

`refresh()` forces handlers to process links and forms again.

---

## destroy()

```javascript
tracker.destroy();
```

Stops the tracker and releases resources.

This method:

- removes event listeners
- disconnects the MutationObserver
- clears internal references

Recommended when cleaning up the tracker in **Single Page Applications**.

---

# Handlers

Handlers contain the **actual tracking logic**.

Each handler focuses on a **single responsibility**, improving:

- maintainability
- readability
- testability

Handlers can evolve independently without modifying the core tracker.

```
Handlers
 ├─ Interaction Handlers
 │   ├─ EventHandler
 │   └─ DOMObserverHandler
 │
 └─ Processing Handlers
     ├─ LinkHandler
     └─ FormHandler
```

---

## Interaction Handlers

Interaction handlers manage **user interactions and DOM changes** that trigger the tracking pipeline.

These handlers act as the **entry points** for the tracker.

### EventHandler

The EventHandler is responsible for managing document-level events used by the tracker.

Responsibilities:

• registering and tracking event listeners
• delegating click events to link or form handlers
• ensuring links are sanitized before context menu actions

Key behaviors include:

#### Document Click Delegation

The handler listens for `click` events on the document and determines whether the interaction involves:

- a link (`<a>`)
- a form submission button

If the target is a link:

```
instance.handleLinkClick()
```

If the target belongs to a configured form:

```
instance.addParamsToForm()
```

This allows the tracker to propagate parameters **just-in-time before navigation or submission**.

#### Context Menu Handling

The `contextmenu` event is intercepted to ensure the link `href` is sanitized before the browser displays the context menu.

This guarantees that actions like:

- Open link in new tab
- Copy link address

use the correct URL with propagated parameters.

### DOMObserverHandler

The **DOMObserverHandler** uses the browser's `MutationObserver` API to detect DOM updates.

Responsibilities:

• observe dynamic DOM changes
• trigger link sanitization for newly inserted elements

Example behavior:

When new nodes are added to the DOM:

```
MutationObserver → sanitizeLinks()
```

This ensures links injected dynamically by frameworks or scripts are processed automatically.

Typical environments where this is useful include:

• React
• Vue
• Angular
• WordPress dynamic components

The observer monitors:

```
document.body
```

with:

```
childList: true
subtree: true
```

The observer can be disconnected via:

```
disconnectObserver()
```

This is called during the tracker lifecycle cleanup.

---

## Processing Handlers

Processing handlers contain the main tracking logic executed by ParamTracker.

While interaction handlers are responsible for detecting user interactions and DOM updates, processing handlers perform the actual parameter propagation and URL manipulation.

These handlers are triggered by the core tracker when a relevant event or DOM mutation occurs.

### LinkHandler

The **LinkHandler** processes anchor (`<a>`) elements.

Responsibilities include:

- validating links using filtering rules
- propagating allowed parameters
- removing excluded parameters
- sanitizing malformed URLs
- preserving hash anchors (`#section`)

Processing flow:

```
link detected
│
▼
apply filtering rules
│
▼
extract current URL parameters
│
▼
merge parameters
│
▼
generate sanitized URL
```

Links that fail the filtering rules are skipped.

Filtering rules include:

- protocol filtering
- file URL detection
- CSS class filtering
- pathname filtering
- attribute filtering
- origin validation

See: [docs/link-filtering.md](docs/link-filtering.md)

for detailed behavior.

---

### FormHandler

The **FormHandler** propagates parameters to HTML forms.

Responsibilities:

- detecting configured forms
- injecting hidden inputs
- propagating allowed parameters

Example result:

```html
<form id="leadForm">
  <input type="hidden" name="utm_source" value="google" />
</form>
```

Forms are explicitly configured using:

```
form.acceptFormIds
```

This prevents unintended injection into unrelated forms.

---

### Parameter Processing Pipeline

ParamTracker processes parameters using a consistent pipeline.

Steps:

1. Extract parameters from the current page URL
2. Filter parameters using configuration rules
3. Remove excluded parameters
4. Merge parameters with the destination URL
5. Produce the final sanitized URL

This pipeline guarantees:

- predictable propagation
- safe URL manipulation
- consistent tracking behavior

---

# Utilities Layer

The utilities layer provides helper functions used internally by handlers and the core.

These utilities are divided into two categories:

• **Core utilities** — generic helpers such as URL parsing, parameter merging, and filtering  
• **DOM utilities** — helpers that interact with the browser environment

For example, the DOM utility `restoreScrollHash()` ensures that hash-based navigation behaves correctly after link sanitization.

Examples include:

- URL parsing
- query parameter merging
- file URL detection
- attribute inspection
- safe URL sanitization

Keeping these helpers centralized avoids duplication and simplifies testing.

---

# Architectural Benefits

The micro-kernel + handlers architecture provides several advantages.

## Maintainability

Responsibilities are clearly separated between core and handlers.

## Testability

Handlers can be unit tested independently.

## Extensibility

New features can be introduced without modifying the core.

Examples:

- preset configurations
- plugin system
- framework adapters
- custom filtering strategies

## Performance

The core remains lightweight and only invokes handlers when necessary.

---

# Future Extensions

The architecture was designed to support future capabilities such as:

- configuration presets
- plugin architecture
- framework integrations
- custom handlers
- advanced filtering strategies

These features can be added without modifying the core micro-kernel.

---

# Summary

ParamTracker 5.x uses a **micro-kernel architecture with specialized handlers**.

The core manages lifecycle and orchestration, while handlers implement the actual tracking logic.

This structure makes the library:

- modular
- extensible
- maintainable
- ready for long-term evolution

---

# Related Documentation

- [configuration.md](configuration.md)
- [link-filtering.md](link-filtering.md)
