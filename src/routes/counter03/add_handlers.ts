import { registerActionHandler, registerEffectHandler, registerServerActionHandler } from "../../registry";
import { Id, Solv } from "../../shared";
import { CounterMap } from ".";
import Counter from "./counter";

export const aTxtChange = registerActionHandler('ap',
    (newCountTxtId: Id, newCountId: Id, solv: Solv) => {
        // @ts-ignore
        solv.getSignal(newCountId).set(document.getElementById(newCountTxtId).value);
    });

export const eNewCount = registerEffectHandler('aq',
    (newCountId: Id, newCountTxtId: Id, addBtnId: Id, solv: Solv) => {
        console.log(typeof window);
        if (typeof window === 'undefined') return;

        const newCount = solv.getSignal(newCountId).get();
        solv.getElement(addBtnId).set('disabled',
            !Number.isInteger(Number(newCount)) ? 1 : null);

        const newCountTxt = document.getElementById(newCountTxtId);
        // @ts-ignore
        if (newCountTxt.value != newCount) {
            // @ts-ignore
            newCountTxt.value = newCount;
        }
    });

export const aAdding = registerActionHandler('ao',
    async (newCountTxtId: Id, solv: Solv) => {
        solv.getElement(newCountTxtId).set('value', 'Adding...');
    });

// Only server can add counter
export const aAdd = registerServerActionHandler('ag',
    async (counterMapId: Id, newCountId: Id, newCountTxtId: Id, solv: Solv) => {
        let newCount = solv.getSignal(newCountId).get();
        if (!Number.isInteger(Number(newCount))) {
            throw new Error(`Invalid count ${newCount}`);
        }
        newCount = Number.parseInt(newCount);

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
        solv.getElement(newCountTxtId).set('value', 'Added');
        solv.getSignal(newCountId).set(0);
    });

export const eAdd = registerEffectHandler('an',
    (viewId: Id, solv: Solv) => {
        requestIdleCallback(() =>
            solv.getElement(viewId).set('style', 'transition: transform 0.5s ease-in-out'));
    });