import { registerSharedActionHandler, registerSharedEffectHandler, registerServerActionHandler } from "../../registry";
import { Id, Solv } from "../../shared";

export const eTxt = registerSharedEffectHandler('ac',
    (countId: Id, countTxtId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        const countTxt = solv.getElement(countTxtId);
        countTxt.set('innerHTML', `${count.get()}`);
    });

export const eReset = registerSharedEffectHandler('ad',
    (countId: Id, resetBtnId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        const resetBtn = solv.getElement(resetBtnId);
        if (count.get() < 30) {
            resetBtn.set('disabled', 1);
        } else {
            resetBtn.set('disabled', null);
        }
    });

export const aInc = registerSharedActionHandler('ae',
    (countId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        count.set(count.get() + 2);
    });

// Only server can reset a counter
export const aReset = registerServerActionHandler('af',
    (countId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        count.set(0);
    });
