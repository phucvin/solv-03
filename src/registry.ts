import { SERVER_ACTION_HANDLER_STATIC_ID_PREFIX, SERVER_EFFECT_HANDLER_STATIC_ID_PREFIX, ACTION_HANDLER_STATIC_ID_PREFIX, EFFECT_HANDLER_STATIC_ID_PREFIX, StaticId, Id, SIGNAL_ID_PREFIX } from "./shared";

const seenStaticIds = new Set<StaticId>();
let serverHandlers: { [staticId: StaticId]: any } = {};
let handlers: { [staticId: StaticId]: any } = {};

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

export function registerActionHandler(staticId: StaticId, handler: any): StaticId {
    staticId = `${ACTION_HANDLER_STATIC_ID_PREFIX}${staticId}`;
    addStaticId(staticId);
    handlers[staticId] = handler;
    return staticId;
}

export function registerEffectHandler(staticId: StaticId, handler: any): StaticId {
    staticId = `${EFFECT_HANDLER_STATIC_ID_PREFIX}${staticId}`;
    addStaticId(staticId);
    handlers[staticId] = handler;
    return staticId;
}

export function getHandler(staticId: StaticId) {
    return handlers[staticId];
}

export function isServerHandler(staticId: StaticId) {
    return staticId.startsWith(SERVER_ACTION_HANDLER_STATIC_ID_PREFIX) ||
        staticId.startsWith(SERVER_EFFECT_HANDLER_STATIC_ID_PREFIX);
}

export function isSignal(id: Id) {
    return id.startsWith(SIGNAL_ID_PREFIX);
}
