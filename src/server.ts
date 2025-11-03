import { CommandMap } from "./types";
import clientFunc from './client';

const clientCode = clientFunc.toString();

export type Id = string;

export type Element = {
    id: Id,
    setValue: (name: string, value: any) => void,
    setChildren: (children: Id[] | null) => void,
};

export type Solv = {
    newElement: (tag: string) => Element,
    newSignal: (initialValue: any) => Id,
    getElement: (id: Id) => Element,
    addEffect: (element: Id, handler: Id, ...params: Id[]) => void,
};

function numberToId(x: number) {
    return `_${x}`;
}
export async function render(app: (solv: Solv) => Promise<void>) {
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
            return id;
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
        addEffect: (element: Id, handler: Id, ...params: Id[]) => {
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
        const __name = () => {};
        const solv = (${clientCode})();
        solv.applyCommandMap(JSON.parse('${JSON.stringify(cm)}'))
    </script>
</html
`;
}

