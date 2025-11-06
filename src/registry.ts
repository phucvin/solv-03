import { StaticId } from "./shared";

const seenStaticIds = new Set<StaticId>();
let serverHandlers: { [staticId: StaticId]: any } = {};
let sharedHandlers: { [staticId: StaticId]: any } = {};
let sharedComponentCode: { [name: string]: string } = {};

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

export function registerSharedComponent(name: string, code: string) {
    sharedComponentCode[name] = code;
}

let sharedComponentAndHandlerCodeCache = new Map<any, string>();

export function getSharedComponentAndHandlerCode(key: any) {
    if (sharedComponentAndHandlerCodeCache.has(key)) {
        return sharedComponentAndHandlerCodeCache.get(key);
    }

    let s = '';
    for (const [name, code] of Object.entries(sharedComponentCode)) {
        // Code with aliases so it work both locally an on workers 
        s += `const ${name} = ${code};\n`;
        s += `const _${name.toLowerCase()}_mjs = { default: ${name} };\n`;
    }
    s += '\nwindow.sharedHandlers = {\n';
    for (const [staticId, handler] of Object.entries(sharedHandlers)) {
        s += `'${staticId}': ${handler.toString()},`
    }
    s += '};';

    sharedComponentAndHandlerCodeCache.set(key, s);
    return sharedComponentAndHandlerCodeCache.get(key);
}

