import { registerSharedActionHandler, registerSharedEffectHandler } from "../../registry";
import { Id, Solv } from "../../shared";

export const eTxt = registerSharedEffectHandler('aa',
    (countId: Id, countTxtId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        const countTxt = solv.getElement(countTxtId);
        countTxt.set('innerHTML', `${count.get()}`);
    });

export const aInc = registerSharedActionHandler('ab',
    (countId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        count.set(count.get() + 1);
    });
