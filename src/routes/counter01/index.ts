import { Element, Solv, registerSharedHandler } from "../../server";
import { BODY, DOCUMENT, Id } from "../../shared";

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

    const count = solv.newSignal(10);
    const countTxt = solv.newElement('span');
    solv.addEffect(main, eTxt, [count.id, countTxt.id]);

    const incBtn = solv.newElement('button');
    incBtn.set('innerHTML', 'inc');
    incBtn.set('onclick', { handler: aInc, params: [count.id] });

    main.setChildren([countTxt, incBtn]);
    return main;
}

export default async function (solv: Solv) {
    solv.getElement(DOCUMENT).set('title', 'hello');
    const counter = Counter(solv);
    solv.getElement(BODY).setChildren([counter.id]);
}