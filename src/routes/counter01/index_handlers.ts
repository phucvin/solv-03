import { registerSharedHandler } from "../../registry";
import { Id, Solv  } from "../../shared";

export const eTxt = registerSharedHandler('aa', (countId: Id, countTxtId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    const countTxt = solv.getElement(countTxtId);
    countTxt.set('innerHTML', `${count.get()}`);
});

export const aInc = registerSharedHandler('ab', (countId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    count.set(count.get() + 1);
});
