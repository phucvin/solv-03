import { Id, HasId, StaticId, CommandMap, Solv } from "./shared";
import { getServerHandler, getSharedHandler } from "./registry";

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
    const signalCurrentValues: { [id: Id]: any } = {};

    const cm: CommandMap = {
        nextNumber: 1,
        createElements: undefined,
        updateElements: undefined,
        deleteElements: undefined,
        setSignals: undefined,
        addEffects: undefined,
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
        addEffect: (handler: StaticId, params: any[]) => {
            if (!cm.addEffects) {
                cm.addEffects = [];
            }
            cm.addEffects.push({ handler, params });
        }
    };
    await app(solv);

    for (const addEffect of cm.addEffects || []) {
        let handler = getServerHandler(addEffect.handler);
        if (!handler) {
            handler = getSharedHandler(addEffect.handler);
        }
        if (!handler) {
            throw new Error(`Handler not found whie processing added effects: ${addEffect.handler}`);
        }
        let params: any = [...addEffect.params];
        params.push(solv);
        await handler(...params);
    }

    const html = `
<html>
    <head>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <head>
    <body></body>
    <script type="module">
        import '/client.mjs';
        import '/routes/counter01/index_handlers.mjs';

        solv.applyCommandMap(JSON.parse(\`\n${JSON.stringify(cm, null, 2)}\n\`));
    </script>
</html>
    `;

    return html;
}

