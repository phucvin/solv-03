import { Element, Solv } from "../../server";
import { BODY, DOCUMENT } from "../../shared";

function Counter(solv: Solv) : Element {
    const countTxt = solv.newElement('span');
    countTxt.setValue('innerHTML', 1);

    const incBtn = solv.newElement('button');
    incBtn.setValue('innerHTML', 'inc');

    const main = solv.newElement('div');
    main.setChildren([countTxt, incBtn]);
    return main;
}

export default async function (solv: Solv) {
    solv.getElement(DOCUMENT).setValue('title', 'hello');
    const counter = Counter(solv);
    solv.getElement(BODY).setChildren([counter.id]);
}