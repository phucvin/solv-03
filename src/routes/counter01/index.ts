import { IncomingMessage, ServerResponse } from "node:http";
import client from '../../client';
import { CommandMap } from "../../client/types";

const clientCode = client.toString();

export type Id = string;

export function numberToId(x: number) {
    return x.toString();
}

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

async function App(solv: Solv) {
    const hello = solv.newElement('span');
    hello.setValue('innerHTML', 'hello');
    solv.getElement('$body').setChildren([hello.id]);
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
            const id = numberToId(cm.nextNumber++);
            cm.createElements.push({ id, tag });
            return solv.getElement(id);
        },
        newSignal: (initialValue: any) => {
            const id = numberToId(cm.nextNumber++);
            cm.setSignals[id] = initialValue;
            return id;
        },
        getElement: (id: Id) => {
            return {
                id,
                setValue: (name: string, value: any) => {
                    if (!cm.updateElements[id]) {
                        cm.updateElements[id] = {
                            setValues: {},
                            removeValues: [],
                            setChildren: null,
                        };
                    }
                    cm.updateElements[id].setValues[name] = value;
                },
                setChildren: (children: Id[] | null) => {
                    if (!cm.updateElements[id]) {
                        cm.updateElements[id] = {
                            setValues: {},
                            removeValues: [],
                            setChildren: null,
                        };
                    }
                    cm.updateElements[id].setChildren = children;
                },
            };
        },
        addEffect: (element: Id, handler: Id, ...params: Id[]) => {
            if (!cm.addEffects[element]) {
                cm.addEffects[element] = [];
            }
            cm.addEffects[element].push({ handlerId: handler, params });
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

async function serve(req: IncomingMessage, res: ServerResponse) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(await render(App));
}

export default serve;