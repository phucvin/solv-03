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
};

export type Solv = {
    newElement: (tag: string) => Element,
    newSignal: (initialValue: any) => Signal,
    getElement: (id: Id) => Element,
    addEffect: (element: Element, handler: StaticId, ...params: (Id | HasId)[]) => void,
};

function numberToId(x: number) {
    return `_${x}`;
}

function toId(x: HasId | Id) {
    if (typeof x === 'string') {
        return x;
    } else {
        return x.id;
    }
}

function toIds(xs: (HasId | Id)[]) {
    if (!xs) {
        return xs;
    }
    const ids: Id[] = [];
    for (const x of xs) {
        ids.push(toId(x));
    }
    return ids;
}

function initUpdateElements(cm: CommandMap, element: Id | HasId) {
    const id = toId(element);
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
    const cm: CommandMap = {
        nextNumber: 1,
        createElements: [],
        deleteDelements: [],
        updateElements: {},
        setSignals: {},
        addEffects: {},
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
            return { id };
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
        addEffect: (element: Element, handler: StaticId, ...params: (Id | HasId)[]) => {
            if (!cm.addEffects) {
                cm.addEffects = {};
            }
            if (!cm.addEffects[element.id]) {
                cm.addEffects[element.id] = [];
            }
            cm.addEffects[element.id].push({ handler: handler, params: toIds(params) });
        }
    };
    await app(solv);
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

