import { StaticId } from "./shared";

const seenStaticIds = new Set<StaticId>();
let serverHandlers: { [staticId: StaticId]: any } = {};
let sharedHandlers: { [staticId: StaticId]: any } = {};

function addStaticId(staticId: StaticId) {
    if (seenStaticIds.has(staticId)) {
        throw new Error(`Duplicate Static ID: ${staticId}`);
    }
    seenStaticIds.add(staticId);
}

export function registerServerHandler(staticId: StaticId, handler: any): StaticId {
    addStaticId(staticId);
    serverHandlers[staticId] = handler;
    return staticId;
}

export function getServerHandler(staticId: StaticId) {
    return serverHandlers[staticId];
}

export function registerSharedHandler(staticId: StaticId, handler: any): StaticId {
    addStaticId(staticId);
    sharedHandlers[staticId] = handler;
    return staticId;
}

export function getSharedHandler(staticId: StaticId) {
    return sharedHandlers[staticId];
}
