# Solv - Stateless Offline-capable LiveView - Prototype 03

Solv's main idea is that stateless servers keep client's state in a volatile
cache. It enables server components that are also interactive, which is best of
both worlds between LiveView and htmx. Then fine-grained reactivity is added to
achieve efficient DOM updates + minimal payload size.

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

Run it yourself online: https://stackblitz.com/~/github.com/phucvin/solv-03

Branch `workers` is also auto-deployed to:
https://solv-03.phucvin.workers.dev/ (this uses a free plan of Cloudflare Workers)

Details:
- Counter 01: simple counter work entirely at client.
- Counter 02: 2 counters; increasing is client-side; reseting is a server action.
- Counter 03: multiple counters; adding a new counter is a server action that
also renders the component server-side (note that client handles the loading
effect when button is clicked).

Code for these demos are int `src/routes`.

## How does it works?
Life of a page request:
1. Client makes a request to view a page.
1. Server calls the page's component to render, this propagates a CommandMap which
contains created DOM nodes, signals, and effects.
1. Server generates a unique id for this client, caches the signals and effects
(but not the DOM nodes) with this id.
1. Server does SSR by generating HTML body from the created DOM nodes.
1. Server composes the HTML body with several things: unique id for this client,
signals and effects (so the client can rehyrate), required scripts for component
and their client action & effect handlers.

Life of a client action:
1. After rehyration, clicking a button will trigger an action, if this is a client
action, no request is made to server.
1. The action will execute and modify signals and DOM nodes.
1. Modified signals will trigger effects, which might modify more.
1. Repeat until no more changes or repeats exhausted (avoid infinite loop).

Life of a server action:
1. If an action handler is not found at client, it will be send to server a long
with the client's unique id, signal & effect updates.
1. Server finds the previously saved signals & effects for the client from cache.
1. If not found, server send 404 error, client sees that and resend the request
with ALL of its current signals & effects.
1. Now server has the client's signals & effects.
1. Server applies the updates and the action, which might modify more signals.
1. Modified signals will trigger effects, server runs these effects until no
more changes or repeat exhausted.
1. As the previous 2 steps run, it also propagate a CommandMap which contains
newly created DOM nodes, existing DOM property updates, new signals, new effects.
1. The CommandMap is then send to client. Client apply that to its current DOM tree,
signals and effects.

## What's next?
Since this is just a prototype, the required code to achieve what we want is
still rough & long.

If this idea makes sense and the provided benefits are good enough to the community,
a compiler is needed to compile ideal code (code that looks like a Solid's component)
to raw code.

## Raw notes

This prototype version is focusing on:
- Fine-grained reactivity (like SolidJS)
- Offline-capable to allow DOM updates on both client and server

TODOs:
- Use Hono (https://hono.dev/docs/getting-started/cloudflare-workers)
- Input field binding to signal
- Streaming server responses, including the initial HTML (idea: https://lamplightdev.com/blog/2024/01/10/streaming-html-out-of-order-without-javascript/)
- Remove signals & effects when all related elements are deleted, a GC (scanning effect params) is easiest first

References:
- https://github.com/phucvin/solv-01/
- https://github.com/phucvin/solv-01/tree/workers
