import { CounterMap } from ".";
import { registerSharedHandler } from "../../server";
import { Id, Element, Solv, Signal } from "../../shared";

const eMain = registerSharedHandler('am', (counterMapId: Id, mainId: Id, solv: Solv) => {
    const signal = solv.getSignal(counterMapId);
    const view = solv.getElement(mainId);
    const counterMap : CounterMap = signal.get();
    view.setChildren(counterMap.viewOrder || []);
});

export default async function ({ counterMap } : { counterMap: Signal }, solv: Solv): Promise<Element> {
    const main = solv.newElement('div');
    main.set('class', 'space-y-4');
    solv.addEffect(eMain, [ counterMap.id, main.id ]);
    return main;
}