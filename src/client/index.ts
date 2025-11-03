export type Id = string;

export type CreateElement = {
    id: Id,
    tag: string,
};

export type CommandMap = {
    createElements: CreateElement[],
    deleteDelements: Id[],
    updateElements: Map<Id, UpdateElement>,
    setSignals: Map<Id, any>,
};

export type UpdateElement = {
    addOrUpdateValues: Map<string, any> | null,
    removeValues: string[],
    setChildren: Id[] | undefined,
};

export type Element = {
    id: Id,
    applyUpdate: (update: UpdateElement) => void,
};

export type Signal = {
    id: Id,
    currentValue: any,
    set: (newValue: any) => void,
};

const signalMap = new Map<Id, Signal>();
let outgoingSetSignals = new Map<Id, any>();

function createElement(id: Id, tag: string) {

}

function elementApplyUpdate(this: Element, update: UpdateElement) {
    for (const [name, value] of update.addOrUpdateValues?.entries() || new Map()) {

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
    if (!signalMap.has(id)) {
        signalMap.set(id, { id, currentValue: value, set: signalSet });
    }
    signalMap.get(id)!.set(value);
}

export default {
    apply: (cm: CommandMap) => {
        for (const ce of cm.createElements) {
            createElement(ce.id, ce.tag);
        }
        for (const [id, update] of cm.updateElements.entries()) {
            getElement(id).applyUpdate(update);
        }
        // TODO: deleteElements
        for (const [id, value] of cm.setSignals.entries()) {
            setSignal(id, value);
        }
    },
};