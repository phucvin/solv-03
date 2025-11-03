import { Id, Signal, UpdateElement, CommandMap, Element } from './types';

export default () => {
    const signalMap = new Map<Id, Signal>();
    let outgoingSetSignals = new Map<Id, any>();

    function createElement(id: Id, tag: string) {

    }

    function elementApplyUpdate(this: Element, update: UpdateElement) {
        if (update.addOrUpdateValues) {
            for (const [name, value] of update.addOrUpdateValues.entries()) {

            }
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

    function applyCommandMap(cm: CommandMap) {
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
    }

    return {
        applyCommandMap,
    };
};