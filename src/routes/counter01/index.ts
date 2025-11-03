import { Element, Solv, registerSharedHandler } from "../../server";
import { BODY, DOCUMENT, INVOKE_HANDLER, Id } from "../../shared";

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

    const count = solv.newSignal(0);
    const countTxt = solv.newElement('span');
    solv.addEffect(main, eTxt, [count, countTxt]);

    const incBtn = solv.newElement('button');
    incBtn.set('innerHTML', 'inc');
    incBtn.set('onclick', { '$': INVOKE_HANDLER, handler: aInc, params: [count.id] });

    main.setChildren([countTxt, incBtn]);
    return main;
}

export default async function (solv: Solv) {
    solv.getElement(DOCUMENT).set('title', 'hello');
    const counter = Counter(solv);
    solv.getElement(BODY).setChildren([counter.id]);
}