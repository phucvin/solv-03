import { SERVER_ACTION_HANDLER_STATIC_ID_PREFIX, SERVER_EFFECT_HANDLER_STATIC_ID_PREFIX, SHARED_ACTION_HANDLER_STATIC_ID_PREFIX, SHARED_EFFECT_HANDLER_STATIC_ID_PREFIX, StaticId } from "./shared";

const seenStaticIds = new Set<StaticId>();
let serverHandlers: { [staticId: StaticId]: any } = {};
let sharedHandlers: { [staticId: StaticId]: any } = {};

function addStaticId(staticId: StaticId) {
    if (seenStaticIds.has(staticId)) {
        throw new Error(`Duplicate Static ID: ${staticId}`);
    }
    seenStaticIds.add(staticId);
}

export function registerServerActionHandler(staticId: StaticId, handler: any): StaticId {
    staticId = `${SERVER_ACTION_HANDLER_STATIC_ID_PREFIX}${staticId}`;
    addStaticId(staticId);
    serverHandlers[staticId] = handler;
    return staticId;
}

export function registerServerEffectHandler(staticId: StaticId, handler: any): StaticId {
    staticId = `${SERVER_EFFECT_HANDLER_STATIC_ID_PREFIX}${staticId}`;
    addStaticId(staticId);
    serverHandlers[staticId] = handler;
    return staticId;
}

export function getServerHandler(staticId: StaticId) {
    return serverHandlers[staticId];
}

export function registerSharedActionHandler(staticId: StaticId, handler: any): StaticId {
    staticId = `${SHARED_ACTION_HANDLER_STATIC_ID_PREFIX}${staticId}`;
    addStaticId(staticId);
    sharedHandlers[staticId] = handler;
    return staticId;
}

export function registerSharedEffectHandler(staticId: StaticId, handler: any): StaticId {
    staticId = `${SHARED_EFFECT_HANDLER_STATIC_ID_PREFIX}${staticId}`;
    addStaticId(staticId);
    sharedHandlers[staticId] = handler;
    return staticId;
}

export function getSharedHandler(staticId: StaticId) {
    return sharedHandlers[staticId];
}
