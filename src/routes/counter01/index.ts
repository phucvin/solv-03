import { BODY, DOCUMENT, Element, Solv  } from "../../shared";
import { eTxt, aInc } from "./index_handlers";

function Counter(solv: Solv) : Element {
    const main = solv.newElement('div');
    main.set('class', 'bg-white p-8 rounded-lg shadow-md flex flex-col items-center space-x-4 space-y-4');

    const count = solv.newSignal(10);
    const countTxt = solv.newElement('span');
    countTxt.set('class', 'text-5xl font-semibold text-gray-800');
    solv.addEffect(eTxt, [count.id, countTxt.id]);

    const incBtn = solv.newElement('button');
    incBtn.set('class', 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-2xl');
    incBtn.set('innerHTML', 'inc');
    incBtn.set('onclick', { handler: aInc, params: [count.id] });

    main.setChildren([countTxt, incBtn]);
    return main;
}

export default async function (solv: Solv) {
    solv.getElement(DOCUMENT).set('title', 'Counter 01');

    const body = solv.getElement(BODY);
    body.set('class', 'flex items-center justify-center min-h-screen bg-gray-100');

    const counter = Counter(solv);
    body.setChildren([counter.id]);
}