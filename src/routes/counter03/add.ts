import { Element, Solv, Signal } from "../../shared";
import { aTxtChange, aAdding, aAdd } from "./add_handlers";

export default async function ({ counterMap }: { counterMap: Signal }, solv: Solv): Promise<Element> {
    const main = solv.newElement('div');
    main.set('class', 'bg-white p-8 rounded-lg shadow-md flex flex-col items-center space-x-4 space-y-4');

    const newCount = solv.newSignal(0);
    const newCountTxt = solv.newElement('input');
    newCountTxt.set('type', 'text');
    newCountTxt.set('class', 'bg-gray-50 border border-gray-300 text-center');
    // TODO: bind
    newCountTxt.set('onchange', { handler: aTxtChange, params: [newCountTxt.id, newCount.id] });

    const addBtn = solv.newElement('button');
    addBtn.set('innerHTML', 'Add');
    addBtn.set('class', 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-2xl');
    addBtn.set('onclick', [
        { handler: aAdding, params: [newCountTxt.id] },
        { handler: aAdd, params: [counterMap.id, newCount.id, newCountTxt.id] },
    ]);

    main.setChildren([newCountTxt, addBtn]);
    return main;
}