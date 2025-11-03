import { Id, UpdateElement, CommandMap, StaticId, HasId, Solv, AddEffect } from './shared';

declare const sharedHandlers: { [staticId: StaticId]: any };

export default () => {
    const signalCurrentValues: { [id: Id]: any } = {};
    const tempElementMap = new Map<Id, WeakRef<HTMLElement>>();
    const DOCUMENT = '$document';
    const BODY = '$body';

    function createElement(id: Id, tag: string) {
        const node = document.createElement(tag);
        node.id = id;
        tempElementMap.set(id, new WeakRef(node));
    }

    function findElementById(id: Id): HTMLElement {
        switch (id) {
            case DOCUMENT: return document;
            case BODY: return document.body;
        }

        const node = document.getElementById(id);
        if (node) {
            return node;
        }
        return tempElementMap.get(id)!.deref();
    }

    function applyElementUpdate(id: Id, update: UpdateElement) {
        let node = findElementById(id);
        for (const [name, value] of Object.entries(update.sets || {})) {
            if (value === null) {
                node[name] = undefined;
                if ((node as any).removeAttribute) {
                    node.removeAttribute(name);
                }
            } else  if (name.startsWith('on')) {
                node.setAttribute(name, `solv.dispatch(${JSON.stringify(value)})`);
            } else {
                node[name] = value;
                if ((node as any).setAttribute) {
                    node.setAttribute(name, value);
                }
            }
        }
        if (update.children) {
            let childNodes: HTMLElement[] = [];
            for (const childId of update.children) {
                childNodes.push(findElementById(childId)!);
            }
            node.replaceChildren(...childNodes);
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
            signalCurrentValues[id] = value;
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
            pendingSignals: undefined,
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
            if (!lcm.setSignals) {
                lcm.setSignals = {};
            }
            lcm.setSignals[id] = initialValue;
            return solv.getSignal(id);
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
                get: () => signalCurrentValues[id],
                set: (newValue: any) => {
                    // console.log(`signal(id:${id}).set`, newValue);
                    signalCurrentValues[id] = newValue;

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

            for (const paramId in params) {
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
                    let handler = sharedHandlers[effect.handler];
                    if (!handler) {
                        throw new Error(`unimplemented: maybe server handler: ${effect.handler}`);
                    }
                    const params: any[] = [...effect.params];
                    params.push(solv);
                    await handler(...params);
                }
            }
        }
        if (repeats <= 0) {
            throw new Error('Too many repeats processing pending signals');
        }
        tempElementMap.clear();
    }

    async function dispatch(action: { handler: StaticId, params: any[] }) {
        // console.log('dispatch', action);

        let params = [...action.params];
        params.push(solv);
        await sharedHandlers[action.handler](...params);
        await resolvePendingSignals();

        //console.log('lcm', JSON.stringify(lcm));
    }

    return {
        applyCommandMap,
        dispatch,
    };
};