import { BODY, DOCUMENT, Id, Solv } from "../../shared";
import { eDelete } from "./index_handlers";

import Add from './add';
import List from './list';

export type CounterMap = {
    countToViewMap: { [countId: Id]: Id } | undefined,
    viewOrder: Id[] | undefined,
    delete_: Id,
};

export default async function (solv: Solv) {
    solv.getElement(DOCUMENT).set('title', 'Counter 03');

    const body = solv.getElement(BODY);
    body.set('class', 'flex flex-col space-y-4 items-center justify-center min-h-screen bg-gray-100');

    const initial: CounterMap = {
        countToViewMap: undefined,
        viewOrder: undefined,
        delete_: solv.newSignal([]).id,
    };
    const counterMap = solv.newSignal(initial);
    solv.addEffect(eDelete, [counterMap.id, initial.delete_]);

    const add = await Add({ counterMap }, solv);
    const list = await List({ counterMap }, solv);
    body.setChildren([add, list]);
}