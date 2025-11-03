import { registerSharedHandler } from "../../server";
import { BODY, DOCUMENT, Id, Element, Solv  } from "../../shared";

const eTxt = registerSharedHandler((countId: Id, countTxtId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    const countTxt = solv.getElement(countTxtId);
    countTxt.set('innerHTML', `${count.get()}`);
});

const aInc = registerSharedHandler((countId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    count.set(count.get() + 1);
});

function Counter(solv: Solv) : Element {
    const main = solv.newElement('div');
    main.set('class', 'bg-white p-8 rounded-lg shadow-md flex flex-col items-center space-x-4 space-y-4');

    const count = solv.newSignal(10);
    const countTxt = solv.newElement('span');
    countTxt.set('class', 'text-5xl font-semibold text-gray-800');
    solv.addEffect(main, eTxt, [count.id, countTxt.id]);

    const incBtn = solv.newElement('button');
    incBtn.set('class', 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-2xl');
    incBtn.set('innerHTML', 'inc');
    incBtn.set('onclick', { handler: aInc, params: [count.id] });

    main.setChildren([countTxt, incBtn]);
    return main;
}

export default async function (solv: Solv) {
    solv.getElement(DOCUMENT).set('title', 'hello');

    const body = solv.getElement(BODY);
    body.set('class', 'flex items-center justify-center min-h-screen bg-gray-100');

    const counter = Counter(solv);
    body.setChildren([counter.id]);
}