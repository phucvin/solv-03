import { registerSharedHandler } from "../../registry";
import { Id, Solv } from "../../shared";
import { CounterMap } from ".";

export const eMain = registerSharedHandler('am', (counterMapId: Id, mainId: Id, solv: Solv) => {
    const signal = solv.getSignal(counterMapId);
    const view = solv.getElement(mainId);
    const counterMap : CounterMap = signal.get();
    view.setChildren(counterMap.viewOrder || []);
});
