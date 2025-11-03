import { BODY, DOCUMENT, Id, Solv } from "../../shared";

import Add from './add';
import List from './list';

export type CounterMap = {
    countToViewMap: { [countId: Id]: Id } | undefined,
    viewOrder: Id[] | undefined,
};

export default async function (solv: Solv) {
    solv.getElement(DOCUMENT).set('title', 'Counter 03');

    const body = solv.getElement(BODY);
    body.set('class', 'flex flex-col space-y-4 items-center justify-center min-h-screen bg-gray-100');

    const initial : CounterMap = {
        countToViewMap: undefined,
        viewOrder: undefined,
    };
    const counterMap = solv.newSignal(initial);
    const add = await Add({ counterMap }, solv);
    const list = await List({ counterMap }, solv);
    body.setChildren([add, list]);
}