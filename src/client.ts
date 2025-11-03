import { Id, UpdateElement, CommandMap } from './shared';

type Element = {
    id: Id,
    applyUpdate: (update: UpdateElement) => void,
};

type Signal = {
    id: Id,
    currentValue: any,
    set: (newValue: any) => void,
};

export default () => {
    const signalMap: { [id: Id]: Signal | null } = {};
    let outgoingSetSignals : { [id: Id]: any } = {};
    const elementById = new Map<Id, WeakRef<HTMLElement>>();
    const DOCUMENT = '$document';
    const BODY = '$body';

    function createElement(id: Id, tag: string) {
        const node = document.createElement(tag);
        node.id = id;
        elementById[id] = new WeakRef(node);
    }

    function getElementById(id: Id) : HTMLElement {
        const node = document.getElementById(id);
        if (node) {
            return node;
        }
        return elementById[id]!.deref();
    }

    function elementApplyUpdate(this: Element, update: UpdateElement) {
        let node: HTMLElement | Document;
        switch (this.id) {
            case DOCUMENT: node = document; break;
            case BODY: node = document.body; break;
            default: node = getElementById(this.id)!; break;
        }
        for (const [name, value] of Object.entries(update.sets|| {})) {
            if (name.startsWith('on')) {
                (node as HTMLElement).setAttribute(name, `solv.dispatch(${JSON.stringify(value)})`);
            } else {
                node[name] = value;
                if ((node as HTMLElement).setAttribute) {
                    (node as HTMLElement).setAttribute(name, value);
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

    function getElement(id: Id): Element {
        return {
            id,
            applyUpdate: elementApplyUpdate,
        };
    }

    function signalSet(this: Signal, newValue: any) {
        outgoingSetSignals[this.id] = newValue;
    }

    function setSignal(id: Id, value: any) {
        if (!signalMap[id]) {
            signalMap[id] = { id, currentValue: value, set: signalSet };
        }
        signalMap[id]!.set(value);
    }

    function applyCommandMap(cm: CommandMap) {
        for (const ce of cm.createElements || []) {
            createElement(ce.id, ce.tag);
        }
        for (const [id, update] of Object.entries(cm.updateElements || {})) {
            getElement(id).applyUpdate(update);
        }
        for (const id of cm.deleteDelements || []) {
            document.getElementById(id)?.remove();
        }
        for (const [id, value] of Object.entries(cm.setSignals || {})) {
            setSignal(id, value);
        }
    }

    function dispatch(action: any) {
        console.log(action);
    }

    return {
        applyCommandMap,
        dispatch,
    };
};