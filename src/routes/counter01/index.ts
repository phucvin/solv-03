import { Solv } from "../../server";
import { BODY, DOCUMENT } from "../../shared";

export default async function (solv: Solv) {
    const hello = solv.newElement('span');
    hello.setValue('innerHTML', 'hello');
    solv.getElement(BODY).setChildren([hello.id]);
    solv.getElement(DOCUMENT).setValue('title', 'hello');
}