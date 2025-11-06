import { registerSharedHandler, registerServerHandler } from "../../registry";
import { Id, Solv } from "../../shared";

export const eTxt = registerSharedHandler('ac', (countId: Id, countTxtId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    const countTxt = solv.getElement(countTxtId);
    countTxt.set('innerHTML', `${count.get()}`);
});

export const eReset = registerSharedHandler('ad', (countId: Id, resetBtnId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    const resetBtn = solv.getElement(resetBtnId);
    if (count.get() < 30) {
        resetBtn.set('disabled', 1);
    } else {
        resetBtn.set('disabled', null);
    }
});

export const aInc = registerSharedHandler('ae', (countId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    count.set(count.get() + 2);
});

export const aReset = registerServerHandler('af', (countId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    count.set(0);
});
