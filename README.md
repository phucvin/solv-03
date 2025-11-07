# Solv - Stateless Offline-capable LiveView - Prototype 03

## What is this?
A prototype to show:
1. Server can create & modify client's DOM directly, simlar to LiveView/htmx but
in a stateless & fine-grained way.
1. Server knows client's state by storing it in a simple volatile cache. This
cached state helps reduce payload size when client send request to server.
But if the cached item is cleared, client can always resend it to server.

This provides:
1. SSR with close-to-zero rehydration cost.
1. No API endpoints, server can just read from DB then render & update clients directly.
1. Server components that are interactive.
1. Minimal payload for updates from server.
1. Stateless servers that can handle stateful-like request/response.
1. Avoid consistent connection to server, clients can work offline after page load,
update local state, keep pending server requests and sync later
(can also use a sync engine like InstantDB to simplify some part of the page).

To compare with some other JS SPA/MPA library/framework:
- React: rehydration cost is high; server components are limited so API
endpoints are still needed to handle update.
- Solid: rehydration cost is high; API endpoints are needed to handle update.
- LiveView: requires stateful connection & server; doesn't work well or at all if offline.
- htmx: bigger payload for updates from server; requires imperative JS to handle
complex offline interaction (as constrast to having declarative JSX & signals).

## Demos

Live (auto-deployed from the workers branch): https://solv-03.phucvin.workers.dev/

Notes: The demo page uses a free plan of Cloudflare Workers.

Details:
- Counter 01: simple counter work entirely at client.
- Counter 02: 2 counters; increasing is client-side; reseting is a server action.
- Counter 03: multiple counters; adding a new counter is a server action that
also renders the component server-side (note that client handles the loading
effect when button is clicked).

Code for these demos are int `src/routes`.

## What's next?
Since this is just a prototype, the required code to achieve what we want is
still rough.

If this idea makes sense and the provided benefits are good enough to the community,
a compiler is needed to compile ideal code (code that looks like a Solid's component)
to raw code.

## Raw notes

This prototype version is focusing on:
- Fine-grained reactivity (like SolidJS)
- Offline-capable to allow DOM updates on both client and server

TODOs:
- Input field binding to signal
- Streaming server responses
- Remove signals & effects when all related elements are deleted, a GC (scanning effect params) is easiest first

References:
- https://github.com/phucvin/solv-01/
- https://github.com/phucvin/solv-01/tree/workers