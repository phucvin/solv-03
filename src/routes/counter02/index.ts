import { BODY, DOCUMENT, Element, Solv } from "../../shared";
import { eReset, eTxt, aInc, aReset } from "./index_handlers";

function Counter(solv: Solv): Element {
    const main = solv.newElement('div');
    main.set('class', 'bg-white p-8 rounded-lg shadow-md flex flex-col items-center space-x-4 space-y-4');

    const title = solv.newElement('h1');
    title.set('class', 'text-3xl font-bold mb-4');
    title.set('innerHTML', 'Counter');

    const count = solv.newSignal(20);
    const countTxt = solv.newElement('span');
    countTxt.set('class', 'text-5xl font-semibold text-gray-800');
    solv.addEffect(eTxt, [count.id, countTxt.id]);

    const incBtn = solv.newElement('button');
    incBtn.set('class', 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-2xl');
    incBtn.set('innerHTML', 'inc');
    incBtn.set('onclick', { handler: aInc, params: [count.id] });

    const resetBtn = solv.newElement('button');
    resetBtn.set('class', 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-2xl disabled:opacity-50 disabled:cursor-not-allowed');
    resetBtn.set('innerHTML', 'reset');
    resetBtn.set('onclick', { handler: aReset, params: [count.id] });
    solv.addEffect(eReset, [count.id, resetBtn.id]);

    main.setChildren([title, countTxt, incBtn, resetBtn]);
    return main;
}

export default async function (solv: Solv) {
    solv.getElement(DOCUMENT).set('title', 'Counter 02');

    const body = solv.getElement(BODY);
    body.set('class', 'flex flex-col space-y-4 items-center justify-center min-h-screen bg-gray-100');

    const counter1 = Counter(solv);
    const counter2 = Counter(solv);
    body.setChildren([counter1, counter2]);
}