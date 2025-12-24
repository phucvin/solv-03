# Solv Architecture and Design

This document details the architecture, key data structures, and the lifecycle of a session in Solv.

## Architecture Overview

Solv is a prototype for a "Stateless Offline-capable LiveView". It attempts to combine the benefits of server-side rendering (SSR), fine-grained reactivity (like SolidJS), and the simplicity of server-driven UI (like LiveView or HTMX), while maintaining offline capabilities and minimizing server state.

The system is composed of the following key components:

1.  **Server (`src/server.ts`):**
    -   Handles initial page requests (SSR).
    -   Processes server-side actions (`/action`).
    -   Maintains a "volatile cache" of client state (signals and effects) to facilitate reactivity without persistent connections.
    -   Generates `CommandMap`s to instruct the client on how to update its state and DOM.

2.  **Client (`src/client.ts`):**
    -   Hydrates the initial state from the server.
    -   Handles user interactions (clicks, etc.).
    -   Executes "client actions" locally for immediate feedback (offline capability).
    -   Dispatches "server actions" to the backend when necessary, syncing local state changes.
    -   Applies `CommandMap` updates received from the server.

3.  **Registry (`src/registry.ts`):**
    -   A central registry for action and effect handlers.
    -   Uses "static IDs" (prefixed strings) to identify functions across the client-server boundary.
    -   Ensures that both client and server can execute the same logic (or know where to find it).

4.  **Shared Core (`src/shared.ts`):**
    -   Defines the fundamental data structures (`CommandMap`, `Solv`, `Element`, `Signal`) used by both environments.

## Key Data Structures

### CommandMap
Defined in `src/shared.ts`.
The `CommandMap` is the primary vehicle for state synchronization. It describes a batch of operations to be performed on the state (DOM, signals, effects).

```typescript
export type CommandMap = {
    nextNumber: number | undefined,          // Seed for ID generation
    createElements: CreateElement[] | undefined, // New DOM nodes to create
    updateElements: { [id: Id] : UpdateElement } | undefined, // Updates to attributes/children
    deleteElements: Id[] | undefined,        // DOM nodes to remove
    setSignals: { [id: Id]: any } | undefined, // Updates to reactive signal values
    addEffects: AddEffect[] | undefined,     // New reactive effects to register
    pendingSignals: { [id: Id]: number } | undefined, // Signals that have changed and need propagation
};
```

### Solv API
Defined in `src/shared.ts`.
The `Solv` object is the API exposed to components and handlers. It allows them to interact with the reactive system without knowing the underlying implementation (client vs. server).

```typescript
export type Solv = {
    newElement: (tag: string) => Element,
    newSignal: (initialValue: any) => Signal,
    getElement: (id: Id) => Element,
    getSignal: (id: Id) => Signal,
    addEffect: (handler: StaticId, params: any[]) => void,
};
```

### Signals and Elements
-   **Signal (`src/shared.ts`):** A reactive primitive with a `get()` and `set()` method. Changes to signals trigger dependent effects.
-   **Element (`src/shared.ts`):** A wrapper around a DOM node (or its server-side representation). It allows setting attributes and children.

### Registry & Static IDs
Defined in `src/registry.ts` and `src/shared.ts`.
Functions (handlers) are identified by static string IDs.
-   `a_...`: Client Action Handler
-   `A_...`: Server Action Handler
-   `e_...`: Client Effect Handler
-   `E_...`: Server Effect Handler

## Session Lifecycle

### 1. Page Request (Initial Load)
**Entry Point:** `src/index.ts` -> `src/server.ts:serve`

1.  **Component Execution:** The server executes the route's component function (e.g., `Counter`).
2.  **State Building:** The component uses the `Solv` API to create signals, elements, and effects. These operations populate an initial `CommandMap`.
3.  **Effect Execution:** `runAddedEffects` runs any initial effects on the server to settle the state.
4.  **Caching:** The server caches the *reactive state* (signals, effects, `nextNumber`) in `src/cache01.ts` associated with a unique Client ID (`cid`). DOM nodes are *not* cached.
5.  **SSR:** `src/ssr.ts` converts the `CommandMap` (specifically the created elements) into an HTML string.
6.  **Response:** The server sends the HTML, which includes:
    -   The rendered DOM.
    -   A script tag initializing `globalThis.SOLV_CID`.
    -   A script tag calling `solv.applyCommandMap` with the remaining state (signals, effects) for hydration.

### 2. Client Action (Local/Offline)
**Entry Point:** `src/client.ts` -> Event Handler (in HTML) -> `solv.dispatch`

1.  **Trigger:** A DOM event (e.g., `onclick`) calls `solv.dispatch({ handler: 'a_...', params: [...] })`.
2.  **Dispatch:** `src/client.ts:dispatchRaw` looks up the handler in the registry.
3.  **Execution:** If it's a client handler (`a_`), it runs locally.
    -   The handler modifies signals via `solv.getSignal(id).set(val)`.
    -   These changes update the local `signals` map and the `lcm` (Local Command Map).
4.  **Reactivity:** `resolvePendingSignals` iterates until stability:
    -   It checks `lcm.pendingSignals`.
    -   Finds effects dependent on those signals using `effectMap`.
    -   Runs the effect handlers.
    -   Effect handlers may modify more signals/DOM, repeating the cycle.
5.  **DOM Update:** DOM updates happen immediately as `Element.set` or `Element.setChildren` are called by handlers/effects (via `applyElementUpdate`).

### 3. Server Action
**Entry Point:** `src/client.ts:dispatchServer` -> `POST /action` -> `src/server.ts:act`

1.  **Trigger:** `dispatchRaw` determines the handler is a server handler (`A_...`) or explicit dispatch.
2.  **Client Request:** The client sends a JSON payload to `/action` containing:
    -   `cid`: Client ID.
    -   `cm`: The `lcm` (Local Command Map) representing recent client-side changes (syncing state).
    -   `action`: The handler ID and params.
    -   *(Optional)* `client`: Full state (signals/effects) if the server previously lost the cache (retry mechanism).
3.  **Server Processing (`src/server.ts:act`):**
    -   **Cache Retrieval:** Retrieves the client's last known state from `src/cache01.ts` using `cid`.
    -   **Sync:** Applies the client's `cm` updates to the server-side state.
    -   **Execution:** Runs the requested action handler.
    -   **Reactivity:** Signals changed by the handler trigger server-side effects.
    -   **Recording:** All changes (new elements, signal updates, etc.) are recorded in a new `CommandMap`.
    -   **Cache Update:** Updates the cache with the new state.
4.  **Response:** The server streams the new `CommandMap` back to the client.
5.  **Client Update:** The client receives the `CommandMap` and applies it (`src/client.ts:applyCommandMap`), updating the DOM, signals, and effects to match the server's state.

## Code Pointers

-   **Client-side Entry:** `src/client.ts`. Look for `solv` object definition and `dispatch` function.
-   **Server-side Entry:** `src/server.ts`. Look for `serve` (initial load) and `act` (action handling).
-   **Reactivity Engine:** `src/client.ts` (`resolvePendingSignals`) and `src/server.ts` (`act` logic).
-   **HTML Generation:** `src/ssr.ts`.
-   **ID Registry:** `src/registry.ts`.
