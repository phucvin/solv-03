import { Id, HasId, StaticId, CommandMap } from "./shared";
import clientFunc from './client';

const clientCode = clientFunc.toString();

export type Element = {
    id: Id,
    set: (name: string, value: any) => void,
    setChildren: (children: (HasId | Id)[]) => void,
};

export type Signal = {
    id: Id,
    get: () => any,
    set: (newValue: any) => void,
};

export type Solv = {
    newElement: (tag: string) => Element,
    newSignal: (initialValue: any) => Signal,
    getElement: (id: Id) => Element,
    getSignal: (id: Id) => Signal,
    addEffect: (element: Element, handler: StaticId, params: any[]) => void,
};

let nextStaticNumber = -1;
const registeredServerHandlers : { [staticId: StaticId]: any } = {};
const registeredSharedHandlers : { [staticId: StaticId]: any } = {};

export function registerServerHandler(handler: any) : StaticId {
    const staticId = numberToId(nextStaticNumber--);
    registeredServerHandlers[staticId] = handler;
    return staticId;
}

export function registerSharedHandler(handler: any) : StaticId {
    const staticId = numberToId(nextStaticNumber--);
    registeredSharedHandlers[staticId] = handler;
    return staticId;
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

function initUpdateElements(cm: CommandMap, id: Id) {
    if (!cm.updateElements) {
        cm.updateElements = {};
    }
    if (!cm.updateElements[id]) {
        cm.updateElements[id] = {
            sets: undefined,
            children: undefined,
        };
    }
}

export async function serve(app: (solv: Solv) => Promise<void>) {
    const signalCurrentValues : { [id: Id]: any } = {};

    const cm: CommandMap = {
        nextNumber: 1,
        createElements: undefined,
        updateElements: undefined,
        deleteDelements: undefined,
        setSignals: undefined,
        addEffects: undefined ,
        pendingSignals: undefined, 
    };

    const solv: Solv = {
        newElement: (tag: string) => {
            const id = numberToId(cm.nextNumber!++);
            if (!cm.createElements) {
                cm.createElements = [];
            }
            cm.createElements.push({ id, tag });
            return solv.getElement(id);
        },
        newSignal: (initialValue: any) => {
            const id = numberToId(cm.nextNumber!++);
            if (!cm.setSignals) {
                cm.setSignals = {};
            }
            cm.setSignals[id] = initialValue;
            signalCurrentValues[id] = initialValue;
            return solv.getSignal(id);
        },
        getElement: (id: Id) => {
            return {
                id,
                set: (name: string, value: any) => {
                    initUpdateElements(cm, id);
                    if (!cm.updateElements![id].sets) {
                        cm.updateElements![id].sets = {};
                    }
                    cm.updateElements![id]!.sets![name] = value;
                },
                setChildren: (children: (HasId | Id)[]) => {
                    initUpdateElements(cm, id); 
                    cm.updateElements![id]!.children = toIds(children);
                },
            };
        },
        getSignal: (id: Id) => {
            return {
                id,
                get: () => signalCurrentValues[id],
                set: (newValue: any) => {
                    signalCurrentValues[id] = newValue;
                    if (!cm.pendingSignals) {
                        cm.pendingSignals = {};
                    }
                    cm.pendingSignals[id] = (cm.pendingSignals[id] || 0) + 1;
                },
            }
        },
        addEffect: (element: Element, handler: StaticId, params: any[]) => {
            if (!cm.addEffects) {
                cm.addEffects = {};
            }
            if (!cm.addEffects[element.id]) {
                cm.addEffects[element.id] = [];
            }
            cm.addEffects[element.id].push({ handler, params });
        }
    };
    await app(solv);

    for (const elementId in cm.addEffects) {
        for (const addEffect of cm.addEffects[elementId]) {
            let handler = registeredServerHandlers[addEffect.handler];
            if (!handler) {
                handler = registeredSharedHandlers[addEffect.handler];
            }
            if (!handler) {
                throw new Error(`Handler not found whie processing added effects: ${addEffect.handler}`);
            }
            let params : any = [...addEffect.params];
            params.push(solv);
            handler(...params);
        }
    }

    return `
<html>
    <body></body>
    <script>
        const __name = () => {};  // TODO: find way to get rid of this
        const solv = (${clientCode})();
        solv.applyCommandMap(JSON.parse(\`\n${JSON.stringify(cm, null, 2)}\n\`));
    </script>
</html
`;
}

