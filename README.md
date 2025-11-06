# Stateless Offline-capable LiveView (Solv) Prototype 03

Live (deployed from workers branch): https://solv-03.phucvin.workers.dev/

Focusing on:
- Fine-grained reactivity (like SolidJS)
- Offline-capable to allow DOM updates on both client and server

TODOs:
- Input field binding to signal
- Streaming server responses
- SSR
- Remove signals & effects when all related elements are deleted, a GC (scanning effect params) is easiest first

References:
- https://github.com/phucvin/solv-01/
- https://github.com/phucvin/solv-01/tree/workers