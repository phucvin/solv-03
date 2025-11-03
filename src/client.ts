import { Id, UpdateElement, CommandMap, StaticId, HasId, Signal, Element, Solv } from './shared';

export default () => {
    const signalCurrentValues: { [id: Id]: any } = {};
    const elementById = new Map<Id, WeakRef<HTMLElement>>();
    const DOCUMENT = '$document';
    const BODY = '$body';

    function createElement(id: Id, tag: string) {
        const node = document.createElement(tag);
        node.id = id;
        elementById[id] = new WeakRef(node);
    }

    function getElementById(id: Id): HTMLElement {
        switch (id) {
            case DOCUMENT: return document;
            case BODY: return document.body;
        }

        const node = document.getElementById(id);
        if (node) {
            return node;
        }
        return elementById[id]!.deref();
    }

    function applyElementUpdate(id: Id, update: UpdateElement) {
        let node = getElementById(id);
        for (const [name, value] of Object.entries(update.sets || {})) {
            if (name.startsWith('on')) {
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
                childNodes.push(getElementById(childId)!);
            }
            node.replaceChildren(...childNodes);
        }
    }

    function applyCommandMap(cm: CommandMap) {
        for (const ce of cm.createElements || []) {
            createElement(ce.id, ce.tag);
        }
        for (const [id, update] of Object.entries(cm.updateElements || {})) {
            applyElementUpdate(id, update);
        }
        for (const id of cm.deleteDelements || []) {
            document.getElementById(id)?.remove();
        }
        for (const [id, value] of Object.entries(cm.setSignals || {})) {
            signalCurrentValues[id] = value;
        }

        lcm = {
            nextNumber: cm.nextNumber,
            createElements: undefined,
            updateElements: undefined,
            deleteDelements: undefined,
            setSignals: undefined,
            addEffects: cm.addEffects,
            pendingSignals: undefined,
        };
    }

    let lcm: CommandMap;

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
            const id = numberToId(lcm.nextNumber!++);
            createElement(id, tag);
            return solv.getElement(id);
        },
        newSignal: (initialValue: any) => {
            const id = numberToId(lcm.nextNumber!++);
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
        addEffect: (element: Element, handler: StaticId, params: any[]) => {
            if (!lcm.addEffects) {
                lcm.addEffects = {};
            }
            if (!lcm.addEffects[element.id]) {
                lcm.addEffects[element.id] = [];
            }
            lcm.addEffects[element.id].push({ handler, params });
        }
    };

    function resolvePendingSignals() {
        let repeats = 5;
        while (Object.keys(lcm.pendingSignals || {}).length > 0 && --repeats > 0) {
            const pendingSignals = lcm.pendingSignals || {};
            lcm.pendingSignals = undefined;
            for (const signalId in pendingSignals) {
                // TODO: faster with map<signal, handler[]>
                for (const elementId in lcm.addEffects) {
                    for (const addEffect of lcm.addEffects[elementId]) {
                        if (addEffect.params.indexOf(signalId) == -1) {
                            continue;
                        }
                        let handler = this.sharedHandlers[addEffect.handler];
                        if (!handler) {
                            throw new Error(`unimplemented: maybe server handler: ${addEffect.handler}`);
                        }
                        const params : any[] = [...addEffect.params];
                        params.push(solv);
                        handler(...params);
                    }
                }
            }
        }
        if (repeats <= 0) {
            throw new Error('Too many repeats processing pending signals');
        }
    }

    function dispatch(action: { handler: StaticId, params: any[] }) {
        // console.log('dispatch', action);
        let params = [...action.params];
        params.push(solv);
        this.sharedHandlers[action.handler](...params);
        this.resolvePendingSignals();
    }

    return {
        applyCommandMap,
        dispatch,
        resolvePendingSignals,
    };
};