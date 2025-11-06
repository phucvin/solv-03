import { Id, UpdateElement, CommandMap, StaticId, HasId, Solv, AddEffect } from './shared';
import { getHandler } from './registry';
import { DOCUMENT, BODY } from './shared';

declare const SOLV_CID: any;

const signals: { [id: Id]: any } = {};
// @ts-ignore
const tempElementMap = new Map<Id, WeakRef<HTMLElement>>();

function createElement(id: Id, tag: string) {
    const node = document.createElement(tag);
    node.id = id;
// @ts-ignore
    tempElementMap.set(id, new WeakRef(node));
}

function findElementById(id: Id): HTMLElement {
    switch (id) {
        // @ts-ignore
        case DOCUMENT: return document;
        case BODY: return document.body;
    }

    const node = document.getElementById(id);
    if (node) {
        return node;
    }
    return tempElementMap.get(id)!.deref()!;
}

function applyElementUpdate(id: Id, update: UpdateElement) {
    let node = findElementById(id);
    for (const [name, value] of Object.entries(update.sets || {})) {
        if (value === null) {
            // @ts-ignore
            node[name] = undefined;
            if ((node as any).removeAttribute) {
                node.removeAttribute(name);
            }
        } else if (name.startsWith('on')) {
            node.setAttribute(name, `solv.dispatch(${JSON.stringify(value)})`);
        } else {
            // @ts-ignore
            node[name] = value;
            if ((node as any).setAttribute) {
                node.setAttribute(name, value);
            }
        }
    }
    if (update.children) {
        let childNodes: HTMLElement[] = [];
        // @ts-ignore
        const childrenToRemove: Set<HTMLElement> = new Set(node.children);
        for (const childId of update.children) {
            const child = findElementById(childId)!;
            childNodes.push(child);
            childrenToRemove.delete(child);
        }
        for (const childToRemove of childrenToRemove) {
            childToRemove.remove();
        }
        childNodes.forEach((element, index) => {
            const currentChild = node.children[index];
            if (currentChild !== element) {
                node.insertBefore(element, currentChild || null);
            }
        });
    }
}

let lcm: CommandMap;
const effectMap: { [signalId: Id]: AddEffect[] } = {};

function applyCommandMap(cm: CommandMap) {
    for (const ce of cm.createElements || []) {
        createElement(ce.id, ce.tag);
    }
    for (const [id, update] of Object.entries(cm.updateElements || {})) {
        applyElementUpdate(id, update);
    }
    for (const id of cm.deleteElements || []) {
        document.getElementById(id)?.remove();
    }
    for (const [id, value] of Object.entries(cm.setSignals || {})) {
        signals[id] = value;
    }
    for (const addEffect of cm.addEffects || []) {
        for (const paramId of addEffect.params) {
            if (!effectMap[paramId]) {
                effectMap[paramId] = [];
            }
            effectMap[paramId].push(addEffect);
        }
    }
    tempElementMap.clear();

    lcm = {
        nextNumber: cm.nextNumber,
        createElements: undefined,
        updateElements: undefined,
        deleteElements: undefined,
        setSignals: undefined,
        addEffects: undefined,
        pendingSignals: cm.pendingSignals,
    };
}

function numberToId(x: number) {
    if (x < 0) {
        return `@${-x}`;
    } else {
        return `_${x}`;
    }
}

function toIds(xs: (HasId | Id)[]) {
    const ids: Id[] = [];
    for (const x of xs) {
        ids.push(typeof x === 'string' ? x : x?.id);
    }
    return ids;
}

const solv: Solv = {
    newElement: (tag: string) => {
        if (lcm.nextNumber === undefined) {
            throw new Error('Local Command Map is not ready');
        }
        const id = numberToId(lcm.nextNumber++);
        createElement(id, tag);
        return solv.getElement(id);
    },
    newSignal: (initialValue: any) => {
        if (lcm.nextNumber === undefined) {
            throw new Error('Local Command Map is not ready');
        }
        const id = numberToId(lcm.nextNumber++);
        const signal = solv.getSignal(id);
        signal.set(initialValue);
        return signal;
    },
    getElement: (id: Id) => {
        return {
            id,
            set: (name: string, value: any) => {
                applyElementUpdate(id, { sets: { [name]: value }, children: undefined });
            },
            setChildren: (children: (HasId | Id)[]) => {
                applyElementUpdate(id, { sets: undefined, children: toIds(children) });
            },
        };
    },
    getSignal: (id: Id) => {
        return {
            id,
            get: () => signals[id],
            set: (newValue: any) => {
                signals[id] = newValue;
                if (!lcm.pendingSignals) {
                    lcm.pendingSignals = {};
                }
                lcm.pendingSignals[id] = (lcm.pendingSignals[id] || 0) + 1;
                if (!lcm.setSignals) {
                    lcm.setSignals = {};
                }
                lcm.setSignals[id] = newValue;
            },
        }
    },
    addEffect: (handler: StaticId, params: any[]) => {
        const addEffect: AddEffect = { handler, params };
        if (!lcm.addEffects) {
            lcm.addEffects = []
        }
        lcm.addEffects.push(addEffect);

        for (const paramId of params) {
            if (!effectMap[paramId]) {
                effectMap[paramId] = [];
            }
            effectMap[paramId].push(addEffect);
        }
    }
};

async function resolvePendingSignals() {
    let repeats = 5;
    while (Object.keys(lcm.pendingSignals || {}).length > 0 && --repeats > 0) {
        const pendingSignals = lcm.pendingSignals || {};
        lcm.pendingSignals = undefined;
        for (const signalId in pendingSignals) {
            for (const effect of effectMap[signalId] || []) {
                let handler = getHandler(effect.handler);
                if (handler) {
                    const params: any[] = [...effect.params];
                    params.push(solv);
                    await handler(...params);
                } else { // Server handler
                    // TODO: Confirm it's an action, so it doesn't need execute
                }
            }
        }
    }
    if (repeats <= 0) {
        throw new Error('Too many repeats processing pending signals');
    }
    tempElementMap.clear();
}

async function dispatchServer(action: { handler: StaticId, params: any[] }) {
    const body = JSON.stringify({ cid: SOLV_CID, ...action, cm: lcm });
    console.log('dispatchServer', body);
    const res = await fetch('/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    });
    if (!res.ok) {
        console.error('Dispatch response error', res.status);
        return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        const CHUNK_BEGIN = '|>';
        const CHUNK_END = '<|';
        let chunkEndIdx = result.indexOf(CHUNK_END);
        while (chunkEndIdx >= 0) {
            console.assert(result.startsWith(CHUNK_BEGIN));

            const cm = JSON.parse(result.substring(CHUNK_BEGIN.length, chunkEndIdx));
            console.log('cm', JSON.stringify(cm));
            applyCommandMap(cm);
            
            result = result.substring(chunkEndIdx + CHUNK_END.length);
            // Find next chunk
            chunkEndIdx = result.indexOf(CHUNK_END);
        }
    }
}

async function dispatch(action: { handler: StaticId, params: any[] }) {
    let params = [...action.params];
    params.push(solv);
    const handler = getHandler(action.handler);
    if (handler) {
        await handler(...params);
    } else { // Server handler
        await dispatchServer(action);
    }
    await resolvePendingSignals();
}

// @ts-ignore
globalThis.solv = {
    applyCommandMap,
    dispatch,
    signals,
    effectMap,
};

export default {};