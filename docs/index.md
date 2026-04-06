---
title: Introduction
layout: docs
---

# ParamTracker Documentation

Welcome to the ParamTracker documentation.

## Architecture Overview

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
