import { Element, Solv, Signal } from "../../shared";
import { eTxt, eDelete, aInc, aDelete } from "./counter_handlers";

async function Counter({ count, delete_ }: { count: Signal, delete_: Signal }, solv: Solv): Promise<Element> {
    const main = solv.newElement('div');
    main.set('class', 'bg-white p-8 rounded-lg shadow-md flex flex-col items-center space-x-4 space-y-4');

    const title = solv.newElement('h1');
    title.set('class', 'text-3xl font-bold mb-4');
    title.set('innerHTML', 'Counter');

    const countTxt = solv.newElement('span');
    countTxt.set('class', 'text-5xl font-semibold text-gray-800');
    solv.addEffect(eTxt, [count.id, countTxt.id]);

    const incBtn = solv.newElement('button');
    incBtn.set('class', 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-2xl');
    incBtn.set('innerHTML', 'inc');
    incBtn.set('onclick', { handler: aInc, params: [count.id] });

    const deleteBtn = solv.newElement('button');
    deleteBtn.set('class', 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-2xl disabled:opacity-50 disabled:cursor-not-allowed');
    deleteBtn.set('innerHTML', 'del');
    deleteBtn.set('onclick', { handler: aDelete, params: [count.id, delete_.id] });
    solv.addEffect(eDelete, [count.id, deleteBtn.id]);

    const tmpTxt = solv.newElement('input');
    tmpTxt.set('type', 'text');
    tmpTxt.set('class', 'bg-gray-50 border border-gray-300 text-center');

    main.setChildren([title, countTxt, incBtn, deleteBtn, tmpTxt]);
    return main;
}

export default Counter;