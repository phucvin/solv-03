import { Id, CommandMap } from "./shared";
import clientFunc from './client';

const clientCode = clientFunc.toString();

export type HasId = {
    id: Id,
};

export type Element = {
    id: Id,
    setValue: (name: string, value: any) => void,
    setChildren: (children: Id[] | null) => void,
};

export type Signal = HasId;

export type Solv = {
    newElement: (tag: string) => Element,
    newSignal: (initialValue: any) => Signal,
    getElement: (id: Id) => Element,
    addEffect: (element: Element, handler: Id, ...params: HasId[]) => void,
};

function numberToId(x: number) {
    return `_${x}`;
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
                setValue: (name: string, value: any) => {
                    if (!cm.updateElements) {
                        cm.updateElements = {};
                    }
                    if (!cm.updateElements[id]) {
                        cm.updateElements[id] = {
                            setValues: undefined,
                            removeValues: undefined,
                            setChildren: undefined,
                        };
                    }
                    if (!cm.updateElements[id].setValues) {
                        cm.updateElements[id].setValues = {};
                    }
                    cm.updateElements[id]!.setValues![name] = value;
                },
                setChildren: (children: Id[] | null) => {
                    if (!cm.updateElements) {
                        cm.updateElements = {};
                    }
                    if (!cm.updateElements[id]) {
                        cm.updateElements[id] = {
                            setValues: undefined,
                            removeValues: undefined,
                            setChildren: undefined,
                        };
                    }
                    cm.updateElements[id]!.setChildren = children || undefined;
                },
            };
        },
        addEffect: (element: Id, handler: Id, ...params: HasId[]) => {
            if (!cm.addEffects) {
                cm.addEffects = {};
            }
            if (!cm.addEffects[element]) {
                cm.addEffects[element] = [];
            }
            cm.addEffects[element].push({ handler: handler, params });
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

