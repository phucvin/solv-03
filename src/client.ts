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
    const elementById = new Map<Id, HTMLElement>();
    const DOCUMENT = '$document';
    const BODY = '$body';

    function createElement(id: Id, tag: string) {
        const node = document.createElement(tag);
        node.id = id;
        elementById[id] = node;
    }

    function getElementById(id: Id) : HTMLElement {
        const node = document.getElementById(id);
        if (node) {
            return node;
        }
        return elementById[id]!;
    }

    function elementApplyUpdate(this: Element, update: UpdateElement) {
        let node: HTMLElement | Document;
        switch (this.id) {
            case DOCUMENT: node = document; break;
            case BODY: node = document.body; break;
            default: node = getElementById(this.id)!; break;
        }
        for (const [name, value] of Object.entries(update.setValues || {})) {
            node[name] = value;
        }
        if (update.setChildren) {
            let childNodes: HTMLElement[] = [];
            for (const childId of update.setChildren) {
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
        outgoingSetSignals.set(this.id, newValue);
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
        // TODO: deleteElements
        for (const [id, value] of Object.entries(cm.setSignals || {})) {
            setSignal(id, value);
        }
    }

    return {
        applyCommandMap,
    };
};