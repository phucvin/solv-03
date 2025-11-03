# WIP - Next prototype for https://github.com/phucvin/solv-01

Focusing on:
- Fine-grained reactivity (like SolidJS)
- Offline-capable to allow DOM updates on both client and server

TODOs:
- Remove signals when parent element is deleted
- Handle list
- Server action & effect handler
- Server caches signals & effects for each client but allow client to resend them if lost