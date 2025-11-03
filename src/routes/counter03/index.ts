import { registerSharedHandler } from "../../server";
import { BODY, DOCUMENT, Id, Solv } from "../../shared";

import Add from './add';
import List from './list';

export type CounterMap = {
    countToViewMap: { [countId: Id]: Id } | undefined,
    viewOrder: Id[] | undefined,
    delete_: Id,
};

const eDelete = registerSharedHandler((counterMapId: Id, deleteId: Id, solv: Solv) => {
    const delete_ = solv.getSignal(deleteId);
    if (delete_.get().length == 0) {
        return;
    }

    const counterMap: CounterMap = solv.getSignal(counterMapId).get();
    if (counterMap.countToViewMap && counterMap.viewOrder) {
        const viewIdsToDelete = new Set<Id>();
        for (const countId of delete_.get()) {
            const viewId = counterMap.countToViewMap[countId];
            if (viewId) {
                viewIdsToDelete.add(viewId);
            }
            delete counterMap.countToViewMap[countId];
        }
        counterMap.viewOrder = counterMap.viewOrder.filter(x => !viewIdsToDelete.has(x));
        solv.getSignal(counterMapId).set(counterMap);
    }
    delete_.set([]);
});

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