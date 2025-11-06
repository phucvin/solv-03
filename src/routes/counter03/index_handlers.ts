import { registerSharedHandler } from "../../registry";
import { Id, Solv } from "../../shared";
import { CounterMap } from ".";

export const eDelete = registerSharedHandler('al', (counterMapId: Id, deleteId: Id, solv: Solv) => {
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
