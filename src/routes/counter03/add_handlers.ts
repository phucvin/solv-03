import { registerActionHandler, registerEffectHandler, registerServerActionHandler } from "../../registry";
import { Id, Solv } from "../../shared";
import { CounterMap } from ".";
import Counter from "./counter";

export const aAdding = registerActionHandler('ao',
    async (newCountTxtId: Id, solv: Solv) => {
        solv.getElement(newCountTxtId).set('value', 'Adding...');
    });

// Only server can add counter
export const aAdd = registerServerActionHandler('ag',
    async (counterMapId: Id, newCountId: Id, newCountTxtId: Id, solv: Solv) => {
        const newCount: number = solv.getSignal(newCountId).get();
        if (newCount < 0) {
            console.error('internal error: invalid count', newCount);
            return;
        }

        const signal = solv.getSignal(counterMapId);
        const counterMap: CounterMap = signal.get();

        const count = solv.newSignal(newCount);
        if (!counterMap.countToViewMap) {
            counterMap.countToViewMap = {};
        }
        const view = await Counter({ count, delete_: solv.getSignal(counterMap.delete_) }, solv);
        view.set('style',
            'transition: transform 0.5s ease-in-out; transform: translate(-100px, 0px)');
        counterMap.countToViewMap[count.id] = view.id;
        if (!counterMap.viewOrder) {
            counterMap.viewOrder = [];
        }
        counterMap.viewOrder.splice(0, 0, view.id);

        signal.set(counterMap);

        solv.addEffect(eAdd, [view.id]);

        // Simulate long processing time, then reset text field from server-side
        await new Promise(resolve => setTimeout(resolve, 500));
        solv.getElement(newCountTxtId).set('value', '');
    });

export const eAdd = registerEffectHandler('an',
    (viewId: Id, solv: Solv) => {
        requestIdleCallback(() =>
            solv.getElement(viewId).set('style', 'transition: transform 0.5s ease-in-out'));
    });